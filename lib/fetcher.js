const utils = require('./utils');
const request = require('request');
const _ = require('lodash');
const co = require('co');

const config = require('../config/config');

/* ******************************************************************
 * Accordig to freshdesk documentation, A maximum of 300 pages      *
 * (9000 tickets) will be returned.                                 *
 * https://developers.freshdesk.com/api/#list_all_tickets - Note 2. *
 ********************************************************************/
const MAX_PAGE = 300;

/* ******************************************************************
 * Show a warning when only 10 requests are left.                   *
 ********************************************************************/
const LOW_THRESHOLD = 10;

let buffer = [];

/**
 * Fetches a single page of data.
 * 
 * @param {object} args the arguments with the brand, page and path info.
 * @param {Function} cb a function to be called at the end.
 * @returns {Promise} returns a promise if no callback is provided
 */
function fetchSinglePage(args, cb) {
  let brand = 'defaultConfig';
  if (config[args.brand]) {
    brand = args.brand;
  }
  const protocol = config[brand].protocol;
  const hostname = config[brand].hostname;
  const path = args.path || config.paths.allTickets;
  const url = `${protocol}${hostname}${path}`;

  const updated_since = config[brand].updated_since;
  const page = args.page || 1;
  const username = config[brand].apikey;

  const reqOpts = {
    url,
    method: 'GET',
    qs: {
      page,
      updated_since,
      per_page: '100',
      include: 'description,requester',
    },
    headers: {
      Accept: 'application/json',
      Authorization: 'Basic ' + Buffer.from(username + ":X").toString("base64")
    },
  };
  return new Promise(((resolve, reject) => {
    request(reqOpts, (err, response, body) => {
      if (err) {
        if (cb) {
          return cb(err)
        }
        return reject(err)
      }
      if (response.statusCode !== 200) {
        console.error({
          reqOpts
        });
        if (cb) {
          return cb(new Error(`Expected http status 200, got ${response.statusCode} - ${response.statusMessage}`));
        }
        return reject(new Error(`Expected http status 200, got ${response.statusCode} - ${response.statusMessage}`));
      }

      //const link = response.headers['link']; // this will be useful (I think)
      const remaining = response.headers['x-ratelimit-remaining'];
      const current = response.headers['x-ratelimit-used-currentrequest'];
      if(remaining < current * LOW_THRESHOLD) {
        console.warn('Warning! only ' + Math.floor(remaining/current)
        + ` requests left. (rate limit remaining: ${remaining} | rate limit used on current request: ${current})`);
      }
      try {
        const result = _.filter(JSON.parse(body), o => {
          return !(
              config.accountsToIgnore.includes(o.requester.email) ||
            config.domainsToIgnore.includes(o.requester.email.replace(/.*@/, "")));
        });
        if (cb) {
          return cb(null, result);
        }
        return resolve(result);
      } catch (err) {
        if (cb) {
          return cb(err);
        }
        return reject(err);
      }
    });
  }));
}

/**
 * Fetches all the pages for a specific type
 * 
 * @param {object} args the arguments with the brand, page and path info.
 * @param {Function} cb a function to be called at the end.
 * @returns {Promise} returns a promise if no callback is provided
 */
function fetchAllPages(args, cb) {
  return fetchSinglePage(args).then(res => {
    buffer = buffer.concat(_.map(res, o => {
      return {
        email: o.requester.email,
        status: o.status,
        subject: o.subject,
        created_at: o.created_at,
        updated_at: o.updated_at,
        description_text: o.description_text,
      }
    }));
    console.log(args);
    args.page ++;
    if(res.length === 0 || args.page > MAX_PAGE) {
      utils.writeFile(args.type, buffer);
  
      if (cb) {
        return cb(null, buffer);
      }
  
      return Promise.resolve({
        type: args.type,
        buffer,
      });
    }
    return fetchAllPages(args, cb);
  }).catch(err => {
    if (cb) {
      return cb(err);
    }
    return Promise.reject(err);
  });
}

/**
 * Main fetch method... this needs to improve
 * 
 * @param {object} args the arguments with the brand and page info.
 */
function fetch(args) {
  co(function* () {
    buffer = [];
    const type = 'tickets';
    console.log('\nSaving: ', type);
    yield fetchAllPages(_.merge({}, args, {
      type,
      page: args.page && !isNaN(args.page) ? args.page : 1,
      path: `/api/v2/${type}`,
    }));
  }).catch((err) => {
    console.error(err);
  });
}

module.exports = {
  fetch,
};