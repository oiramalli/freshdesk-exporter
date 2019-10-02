const json2csv = require('json2csv');
const path = require('path');
const fs = require('fs');

/**
 * Writes the data to a csv file in the `out` dir.
 * 
 * @param {string} type the type of data being exported (Ej. Tikets).
 * @param {object[]} objectData an array of object containing the data to be exported.
 */
function writeFile(type, objectData) {
    const file = `.${path.sep}out${path.sep}${type}-${new Date().toISOString().replace(/T/, '_').replace(/\\:/g, '').replace(/\..+/, '')}.csv`;
    const csv = json2csv.parse(objectData);
    fs.writeFile(file, csv, 'utf8', err =>{
      if(err){
        return Promise.reject(err);
      }
      return Promise.resolve();
    });
}

module.exports = {
  writeFile
};