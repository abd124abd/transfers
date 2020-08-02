require('dotenv').config();
import express, { Application, Request, Response, NextFunction} from 'express';
import morgan from 'morgan';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import config from './config';
import errorhandler from 'errorhandler';
import transfersRouter from './transfers/transfers-router';
import payeesRouter from './payees/payees-router';
import usersRouter from './users/users-router';
import authRouter from './auth/auth-router';
import bodyParser from 'body-parser';

const { NODE_ENV } = config;
const app: Application = express();

// Enable if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
// see https://expressjs.com/en/guide/behind-proxies.html
app.set('trust proxy', 1);

const morganOption = (NODE_ENV === 'development')
  ? 'common'
  : 'tiny';

const JSONParser = bodyParser.json();

app.use(morgan(morganOption));
app.use(cors());
app.use(helmet());
app.use(JSONParser);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use(apiLimiter);

// limit payload
app.use(express.json({ limit: '10kb' }))

if (NODE_ENV === 'development') {
  app.use(errorhandler())
};

app.use('/transfers', transfersRouter);
app.use('/payees', payeesRouter);
app.use('/users', usersRouter);
app.use('/auth', authRouter);

app.get('/', (req: Request, res: Response): void => {
  res.send('home');
})

app.use((error:any, req: Request, res: Response, next: NextFunction): void => {
  let response;
  if (NODE_ENV === 'production') {
    response = { error: { message: 'server error' } }
  } else {
    response = { message: error.message, error }
  }
  res.status(500).json(response)
})

export default app;
