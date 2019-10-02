const commander = require('commander');
const pjson = require('./package.json');
const fetcher = require('./lib/fetcher');

main();

/**
 * Graceful shutdown action.
 */
function bootstrap() {
  process.on('SIGTERM', () => {
    global.shutdown = true;
    console('SIGTERM received.  Shutting down...');
  });
}

/**
 * Main function to be executed.
 */
function main() {
  bootstrap();
  commander.version(pjson.version);
  commander.command('collect')
  .description('Collect all data from freshdesk eg. "collect --brand MyBrand --page 10')
  .option('-p, --page [number]', 'The page number to begin with')
  .option('-b, --brand [name]', 'Name for brand to retreive the info')
  .action( options => {
    console.log('Starting to collect data');
    const fetchArgs = {
      brand    : options.brand,
      page     : parseInt(options.page),
    };

    fetcher.fetch(fetchArgs);
  });

  commander.parse(process.argv);
}