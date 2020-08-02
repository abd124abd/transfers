import express, { Application, Request, Response, NextFunction} from 'express';
import PayeesService from './payees-service';
import UsersService from '../users/users-service';

import verifyJWTAuth from '../middleware/jwt-auth';

const payeesRouter = express.Router();

payeesRouter
  .route('/:id')
  .all(verifyJWTAuth, async (req: Request, res: Response, next: NextFunction) => {
    const knexInstance = req.app.get('db');

    const {user} = req.body;
    const sender = parseInt(req.params.id);

    if (user.id !== sender) {
      return res
        .status(401)
        .json({
          error: `User does not match ID provided`,
        });
    };

    next();
  })
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const knexInstance = req.app.get('db');

    const sender = parseInt(req.params.id);

    try {
      const payees = await PayeesService.getAllPayeesBySender(knexInstance, sender);

      return res
        .status(201)
        .json(payees);
    } catch(err) {
      next(err);
    };
  })
  .post(async (req: Request, res: Response, next: NextFunction) => {
    const knexInstance = req.app.get('db');

    const sender = parseInt(req.params.id);

    if (!req.body.hasOwnProperty('payee') ||
        typeof req.body.payee !== 'number') {
      return res
        .status(404)
        .json({
          error: `Payee needs to be of type number`,
        });
    };

    const payee = parseInt(req.body.payee);

    if (sender === payee) {
      return res
        .status(404)
        .json({
          error: `Sender and payee cannot match`,
        });
    };

    try {
      const payeeUser = await UsersService.getUserById(knexInstance, payee);

      if (!payeeUser) {
        return res
          .status(404)
          .json({
            error: `Payee not found`,
          });
      };

      const senderPayeeEntry = await PayeesService.getPayeeSenderEntry(knexInstance, sender, payee);

      if (senderPayeeEntry.length > 0) {
        return res
          .status(404)
          .json({
            error: `Payee is already assigned to sender`,
          });
      };

      const newPayee = await PayeesService.addPayee(knexInstance, sender, payee);

      if (!newPayee) {
        return res
          .status(404)
          .json({
            error: `Payee not added`
          });
      };

      return res
        .status(201)
        .json(newPayee);
    } catch(err) {
      next(err);
    };
  })
  .delete(async (req: Request, res: Response, next: NextFunction) => {
    const knexInstance = req.app.get('db');

    const sender = parseInt(req.params.id);

    if (!req.body.hasOwnProperty('payee') ||
        typeof req.body.payee !== 'number') {
      return res
        .status(404)
        .json({
          error: `Payee needs to be of type number`,
        });
    };

    const payee = parseInt(req.body.payee);

    if (sender === payee) {
      return res
        .status(404)
        .json({
          error: `Sender and payee cannot match`,
        });
    }

    try {
      const senderPayeeEntry = await PayeesService.getPayeeSenderEntry(knexInstance, sender, payee);

      if (senderPayeeEntry.length < 1) {
        return res
          .status(404)
          .json({
            error: `Payee is not assigned`,
          });
      };

      const deletedPayee = await PayeesService.deletePayee(knexInstance, sender, payee);

      if (!deletedPayee) {
        return res
          .status(404)
          .json({
            error: `Payee not deleted`,
          });
      };

      return res
        .status(204)
        .end();
    } catch(err) {
      next(err);
    }
  });

export default payeesRouter;
