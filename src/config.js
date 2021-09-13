const Joi = require('joi');
require('dotenv').config();

const envVarsSchema = Joi.object({
  NODE_ENV: Joi.string()
    .allow(['development', 'production'])
    .default('production'),
  DB_HOST: Joi.string().required(),
  DB_USER: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_DATABASE: Joi.string().required(),
  EMAIL_HOST: Joi.string().required(),
  EMAIL_PORT: Joi.number().required(),
  // EMAIL_SECURE: Joi.bool().required(),
  EMAIL_USER: Joi.string().required(),
  EMAIL_PASS: Joi.string().required(),
  EMAIL_FROM: Joi.string().required(),
  RFP_AGES: Joi.string()
    .regex(/^\d+(?:,\d+)*$/)
    .required(), // e.g. "7" or "7,14,120"
})
  .unknown()
  .required();

const { error, value: envVars } = Joi.validate(process.env, envVarsSchema);

if (error) {
  console.error(
    `Error processing configuration file! Exiting.\n${error.message}`
  );
  process.exit(1);
}

const config = {
  env: envVars.NODE_ENV,
  database: {
    host: envVars.DB_HOST,
    user: envVars.DB_USER,
    password: envVars.DB_PASSWORD,
    database: envVars.DB_DATABASE,
  },
  email: {
    host: envVars.EMAIL_HOST,
    port: envVars.EMAIL_PORT,
    secure: envVars.EMAIL_SECURE === 'true',
    auth: {
      user: envVars.EMAIL_USER,
      pass: envVars.EMAIL_PASS,
    },
  },
  from: envVars.EMAIL_FROM,
  rfpAges: envVars.RFP_AGES.split(','),
};

module.exports = config;
