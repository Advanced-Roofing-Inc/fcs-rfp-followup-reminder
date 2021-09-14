const mysql = require('mysql');
const moment = require('moment');
const he = require('he');
const R = require('ramda');

const config = require('./config');
const { createEmail, sendEmail } = require('./email');

const dateFormat = 'YYYY-MM-DD 00:00:00';
let today;
if (config.env === 'development') {
  today = moment('2017-07-17');
} else {
  today = moment();
}

async function main() {
  const targetDates = [];

  try {
    config.rfpAges.forEach((numDays) => {
      const dateString = moment(today)
        .subtract(numDays, 'days')
        .format(dateFormat);
      targetDates.push(dateString);
    });
  } catch (err) {
    console.error('Error reading config property `rfpAges`.');
    process.exit(1);
  }

  // Connect to the mysql database
  console.info('Connecting to MySQL...');
  const conn = mysql.createConnection(config.database);
  try {
    await new Promise((resolve, reject) => {
      conn.connect((err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  } catch (err) {
    console.error('Could not connect to MySQL.');
    process.exit(1);
  }

  const sql = 'SELECT * FROM `OpenQuotes` WHERE `creation_date` IN (?)';
  let results;
  try {
    results = await new Promise((resolve, reject) => {
      conn.query(sql, [targetDates], (error, res) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(res);
      });
    });

    conn.end();
  } catch (err) {
    console.error('Error querying database:', err);
    conn.end();
    process.exit(1);
    return;
  }

  const projects = results.reduce((acc, result) => {
    const to = result.Email;
    const siteName = result.site_name;
    const creationDate = moment(result.creation_date);
    const dateDiff = moment(today).diff(creationDate, 'days');

    const projectName = he.decode(siteName);
    const creationDateFmt = creationDate.format('MM/DD/YY');
    const projectAge = dateDiff;

    const accProject = acc[projectName] || {
      to,
      creationDate: creationDateFmt,
      projectAges: [],
    };
    accProject.projectAges = R.pipe(
      R.append(projectAge),
      R.uniq,
    )(accProject.projectAges);

    return {
      ...acc,
      [projectName]: accProject,
    };
  }, {});

  const projectNames = Object.keys(projects);
  Object.keys(projects).forEach((name) => {
    console.log('Project:', name, projects[name]);
  });

  for (let i = 0; i < projectNames.length; i += 1) {
    const projectName = projectNames[i];
    const projectData = projects[projectName];
    const emailData = {
      projectName,
      projectAges: projectData.projectAges,
      creationDate: projectData.creationDate,
    };

    const email = createEmail(projectData.to, config.from, emailData);
    console.info(
      `[${i + 1}/${projectNames.length}] Sending email to ${projectData.to} ` +
        `for "${emailData.projectName}", ages ` +
        `${projectData.projectAges.join(', ')}`,
    );

    try {
      const info = await sendEmail(email);
      console.log('Mail sent successfully', info);
    } catch (err) {
      console.log('Error sending email:', err);
    }
  }
}

main();
