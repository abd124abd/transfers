import {Secret} from 'jsonwebtoken';

interface Config {
  NODE_ENV: string;
  PORT: string | number;
  DB_URL: string | undefined;
  TEST_DB_URL: string | undefined;
  JWT_SECRET: Secret;
  JWT_EXPIRY: string | undefined;
};

const config: Config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 8080,
  DB_URL: process.env.DB_URL,
  TEST_DB_URL: process.env.TEST_DB_URL,
  JWT_SECRET: process.env.JWT_SECRET || 'secret',
  JWT_EXPIRY: process.env.JWT_EXPIRY,
};

export default config;
