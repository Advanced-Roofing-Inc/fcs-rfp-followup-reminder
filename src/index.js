const mysql = require('mysql');
const moment = require('moment');
const config = require('./config.json');
const he = require('he');
const nodemailer = require('nodemailer');

const dateFormat = 'YYYY-MM-DD 00:00:00';
const today = moment('2017-07-17');
const targetDates = [];

try {
  config.rfpAges.forEach(numDays => {
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
conn.query(sql, [targetDates], (error, results, fields) => {
  if (error) {
    console.error('Error querying database:', error);
    process.exit(1);
    return;
  }
  
  results.forEach(result => {
    const creationDate = moment(result['creation_date']).format('MM/DD/YY');
    console.log(creationDate, he.decode(result['site_name']));
  });
});

conn.end();

// Email mock
const transporter = nodemailer.createTransport(config.email);

const mailOptions = {
  from: 'Dylan Tester',
  to: 'Dylan Test <dylan@dylantest.com>',
  subject: 'Email test',
  text: 'This is plain text email',
  html: '<h1>This is html email</h1>'
};

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    return console.error(error);
  }
  console.log('Mail sent:', info);
});
