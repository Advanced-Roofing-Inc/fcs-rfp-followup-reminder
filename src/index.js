const mysql = require('mysql');
const moment = require('moment');
const he = require('he');

const config = require('../config/config.json');

const dateFormat = 'YYYY-MM-DD 00:00:00';
const today = moment('2017-07-17');
const targetDates = [];

try {
  config.rfpAges.forEach((numDays) => {
    const dateString = moment(today).subtract(numDays, 'days').format(dateFormat);
    targetDates.push(dateString);
  });
} catch (err) {
  console.error('Error reading config property `rfpAges`.');
  process.exit(1);
}

// Connect to the mysql database
console.log('Connecting to MySQL...');
const conn = mysql.createConnection(config.database);

conn.connect((err) => {
  if (err) {
    console.error('Could not connect to MySQL.');
    process.exit(1);
  }
});

const sql = 'SELECT * FROM `OpenQuotes` WHERE `creation_date` IN (?)';
conn.query(sql, [targetDates], (error, results) => {
  if (error) {
    console.error('Error querying database:', error);
    process.exit(1);
    return;
  }

  results.forEach((result) => {
    const creationDate = moment(result.creation_date).format('MM/DD/YY');
    console.log(creationDate, he.decode(result.site_name));

    // send email here
    // const { createEmail, sendEmail } = require('./email');
  });
});

conn.end();
