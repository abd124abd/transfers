import express, { Application, Request, Response, NextFunction} from 'express';
import AuthService from './auth-service';
import UsersService from '../users/users-service';

const authRouter = express.Router();

authRouter
  .post('/login', async (req: Request, res: Response, next: NextFunction) => {
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

    try {
      const user = await AuthService.getUserByUsername(knexInstance, serializedUser.username);
      if (!user) {
        return res.status(404).json({
          error: "User not found"
        });
      };

      const passwordsMatch = await AuthService.comparePasswords(password, user.password);
      if (!passwordsMatch) {
        return res.status(404).json({
          error: "Password is incorrect"
        });
      };

      return res
      .status(201)
      .json({
        user: UsersService.serializeGetUser(user),
        authToken: AuthService.createJWT(user.username, {user_id: user.id})
      });
    } catch(err) {
      next(err);
    };
  })

export default authRouter;
