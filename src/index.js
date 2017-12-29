const mysql = require('mysql');
const moment = require('moment');
const he = require('he');

const config = require('../config/config.json');
const { createEmail, sendEmail } = require('./email');

const dateFormat = 'YYYY-MM-DD 00:00:00';
// const today = moment('2017-07-17');
const today = moment();
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
console.info('Connecting to MySQL...');
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
    const { to, creation_date, site_name } = result; // eslint-disable-line camelcase
    const creationDate = moment(creation_date);
    const dateDiff = moment(today).diff(creationDate, 'days');

    const emailData = {
      creationDate: creationDate.format('MM/DD/YY'),
      projectAge: dateDiff,
      projectName: he.decode(site_name),
    };

    const email = createEmail(to, config.from, emailData);
    console.info(`Sending email to ${to} for project ${emailData.projectName}`);
    sendEmail(email);
  });
});

conn.end();
