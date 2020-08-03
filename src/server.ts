import app from './app';
import config from './config';
import knex from 'knex';

const { PORT, DB_URL, TEST_DB_URL } = config;

class Server {
  public db;
  public app;

  constructor(DB, app) {
    this.db = knex({
      client: 'pg',
      connection: DB
    });

    this.app = app;
    app.set('db', DB);
  }

  public runServer(): void {
    this.app
      .listen(PORT, () => {
        console.log(`server is listening on ${PORT}`);
      })
      .on('error', err => {
        console.error(err);
      });
  };
}

if (require.main === module) {
  const server: Server = new Server(DB_URL, app);
  server.runServer();
}
