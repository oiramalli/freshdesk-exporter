module.exports = {
  defaultConfig: {
    protocol: 'https://',
    hostname: 'freshdesk.com',
    apikey: 'your_apikey',
    updated_since: '2015-01-19T02:00:00Z',
  },
  paths: {
    allTickets: '/api/v2/tickets/',
  },
  domainsToIgnore: [
  ],
  accountsToIgnore:[
  ]
};