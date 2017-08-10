const mysql = require('mysql');
const moment = require('moment');


const dateFormat = 'YYYY-MM-DD 00:00:00';
const today = moment();
const yesterday = moment(today).add(-1, 'days');
console.log('Today is:', today.format(dateFormat));
console.log('Yesterday is:', yesterday.format(dateFormat));

process.exit();

////////

const conn = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'app_contractors'
});

conn.connect((err) => {
  if (err) {
    console.error('Could not connect to MySQL.');
    process.exit(1);
  }
});

conn.query('select * from OpenQuotes limit 10', (error, results, fields) => {
  results.forEach(result => {
    console.log(result['site_name']);
  });
});

conn.end();

// process.exit();
