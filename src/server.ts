import app from './app';
import config from './config';
import knex from 'knex';

const { PORT, DB_URL } = config;

const db = knex({
  client: 'pg',
  connection: DB_URL,
});

app.set('db', db);

app
  .listen(PORT, () => {
    console.log(`server is listening on ${PORT}`);
  })
  .on('error', err => {
    console.error(err);
  });
