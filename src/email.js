const path = require('path');
const fs = require('fs');
const ejs = require('ejs');
const nodemailer = require('nodemailer');
const config = require('./config');

const transporter = nodemailer.createTransport({
  ...config.email,
  pool: true,
  maxConnections: 1,
  tls: {
    ciphers: 'SSLv3',
  },
});

const emailTemplatePath = path.join(__dirname, 'templates', 'reminder.ejs');
const emailTemplateFile = fs.readFileSync(emailTemplatePath, 'utf8');

const createEmail = (to, from, emailData) => {
  let html;

  try {
    html = ejs.compile(emailTemplateFile)(emailData);
  } catch (err) {
    console.error('Error parsing email template.', err);
    process.exit(1);
  }

  return {
    to,
    from,
    subject: 'RFP Followup Reminder',
    text: 'Sorry, the message cannot be displayed because your email client does not support HTML.',
    html,
  };
};

const sendEmail = (emailOptions) =>
  new Promise((resolve, reject) => {
    transporter.sendMail(emailOptions, (error, info) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(info);
    });
  });

module.exports = {
  createEmail,
  sendEmail,
};
