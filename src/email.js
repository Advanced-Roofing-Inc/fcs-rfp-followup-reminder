const path = require('path');
const fs = require('fs');
const ejs = require('ejs');
const nodemailer = require('nodemailer');
const config = require('../config/config.json');

const transporter = nodemailer.createTransport(config.email);

const emailTemplatePath = path.join(__dirname, 'templates', 'reminder.ejs');
const emailTemplateFile = fs.readFileSync(emailTemplatePath, 'utf8');

const createEmail = (data) => {
  let html;

  try {
    html = ejs.compile(emailTemplateFile)(data);
  } catch (err) {
    console.error('Error parsing email template.', err);
    process.exit(1);
  }

  return {
    from: 'Dylan Tester <dylan@testsender.com>',
    to: 'Dylan Test <dylan@dylantest.com>',
    subject: 'RFP Followup Reminder',
    text: 'Sorry, the message cannot be displayed because your email client does not support HTML.',
    html
  };
};

const sendEmail = (emailOptions) => {
  transporter.sendMail(emailOptions, (error, info) => {
    if (error) {
      return console.error(error);
    }
    
    console.log('Mail sent:', info);
  });
};

module.exports = {
  createEmail,
  sendEmail
};
