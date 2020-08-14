import express, { Application, Request, Response, NextFunction} from 'express';
import UsersService from './users-service';

const usersRouter = express.Router();

usersRouter
  .route('/:id')
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const knexInstance = req.app.get('db');

    const id = parseInt(req.params.id);

    if (id === undefined) {
      return res
        .status(400)
        .json({
          error: `Id must be a number`,
        });
    }

    try {
      const user = await UsersService.getUserById(knexInstance, id);
      if(!user) {
        return res.status(404).json({
          error: "User not found"
        });
      };

      return res.status(201).json(UsersService.serializeGetUser(user));
    } catch(err) {
      next(err);
    };
  })

usersRouter
  .route('/')
  .post(async (req: Request, res: Response, next: NextFunction) => {
    const knexInstance = req.app.get('db');
    const {username, password} = req.body;
    const user = {username, password};

    for (const [key, value] of Object.entries(user)) {
      if (value === null || value === undefined) {
        return res.status(400).json({
          error: `Missing ${key} in request body`,
        });
      };
    };

    const serializedUser = UsersService.serializeCreateUser(user);
    if (serializedUser.username.length < 3) {
      return res
        .status(401)
        .json({
          error: `Username must be 3 or more characters long`,
        });
    };

    if (serializedUser.password.length < 8 ||
        serializedUser.password.length > 64) {
        return res
          .status(401)
          .json({
            error: `Password length must be between 8 and 64 characters`,
          });
      };

    try {
      const userExists = await UsersService.getUserByUsername(knexInstance, serializedUser.username);

      if (userExists) {
        return res
          .status(400)
          .json({
            error: `User already exists`
          });
      };
    } catch(err) {
      next(err);
    }

    try {
      const password = await UsersService.hashPassword(serializedUser.password);
      serializedUser.password = password;
      const user = await UsersService.createUser(knexInstance, serializedUser);

      if (!user) {
        return res
          .status(404)
          .json({
            error: `User not created`,
          });
      };

      return res
        .status(201)
        .json(UsersService.serializeGetUser(user));
    } catch(err) {
      next(err);
    };
  });

export default usersRouter;
