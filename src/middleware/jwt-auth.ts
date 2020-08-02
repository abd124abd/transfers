import { Request, Response, NextFunction } from 'express';
import AuthService from '../auth/auth-service';

const verifyJWTAuth = async (req: Request, res: Response, next: NextFunction) => {
  const knexInstance = req.app.get('db');
  const authToken = req.get('Authorization') || '';

  if (!authToken.toString().toLowerCase().startsWith('bearer')) {
    return res
      .status(401)
      .json({
        error: `Unauthorized request`,
      });
  };

  const bearerToken = authToken.slice(authToken.indexOf(' ') + 1);

  try {
    const authPayload = await AuthService.verifyJWT(bearerToken);
    const user = await AuthService.getUserByUsername(knexInstance, authPayload.sub);

    if (!user) {
      return res
        .status(401)
        .json({
          error: `Unauthorized request`,
        });
    };

    req.body.user = user;
    next();
  } catch(err) {
    next(err);
  };
};

export default verifyJWTAuth;
