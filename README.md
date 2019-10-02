# Freshdesk Exporter

Utility built from scratch to export all data for [freshdesk.com/api/](https://developers.freshdesk.com/api/)

## Getting Started

These instructions will get you a copy of the project up and running on your local machine.

### Prerequisites

It's recommended that you have the following system requirements:

```txt
NodeJS v8.9.3
npm v6.1.0
```

### Installing

Follow these steps to run the freshdesk exporter utility

* Colone the repo `git clone https://github.com/oiramalli/freshdesk-exporter.git`.
* CD into the directory `cd freshdesk-exporter`
* Run `npm i`.
* Create a `local.js` file under the config folder with the following structure:

```javascript
module.exports = {
  numato: {
    protocol: 'https://',
    hostname: 'my_brand.freshdesk.com',
    apikey: 'abcdefghij1234567890',
    updated_since: '2018-05-01T00:00:00Z',
  },
  domainsToIgnore: [
    'spammy_domain_one.com',
    'other_spammy_domain.com',
  ],
  accountsToIgnore:[
    'shady-email@some-domain.ru',
  ]
};
```

* Run `node cli.js collect -b {brand}` to begin collecting all the data.
* Sit, wait and enjoy.
* Example: `node cli.js collect -b my_brand -p 50`

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/oiramalli/freshdesk-exporter/tags).
