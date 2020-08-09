import express, { Request, Response, NextFunction } from 'express';
import TransfersService from './transfers-service';
import UsersService from '../users/users-service';

import verifyJWTAuth from '../middleware/jwt-auth';

const transfersRouter = express.Router();

transfersRouter
  .route('/')
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const knexInstance = req.app.get('db');

    try {
      const {sum} = await TransfersService.getAllTransfersTotal(knexInstance);
      const result = {
        total: sum !== null ? parseFloat(sum) : 0,
      };

      return res
        .status(200)
        .json(result);
    } catch(err) {
      next(err);
    };
  })

transfersRouter
  .route('/user/:id')
  .all(verifyJWTAuth, async (req: Request, res: Response, next: NextFunction) => {
    const knexInstance = req.app.get('db');

    const {user} = req.body;
    const paramUserId = parseInt(req.params.id);

    if (paramUserId === undefined) {
      return res
        .status(401)
        .json({
          error: `Id must be a number`,
        });
    };

    if (user.id !== paramUserId) {
      return res
        .status(401)
        .json({
          error: `Token doesn't match ID provided`,
        });
    };

    next();
  })
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const knexInstance = req.app.get('db');

    const paramUserId = parseInt(req.params.id);

    try {
      const transfers = await TransfersService.getTransfersByUser(knexInstance, paramUserId);

      return res
        .status(200)
        .json(transfers);
    } catch(err) {
      next(err);
    };
  })
  .post(verifyJWTAuth, async (req: Request, res: Response, next: NextFunction) => {
    const knexInstance = req.app.get('db');

    const {receiver, amount} = req.body;
    const paramUserId = parseInt(req.params.id);
    const transfer = {sender: paramUserId, receiver, amount};

    for (const [key, value] of Object.entries(transfer)) {
      if (value === null || value === undefined) {
        return res.status(400).json({
          error: `Missing ${key} in request body`,
        });
      };
    };

    if (typeof receiver !== 'number') {
      return res
        .status(400)
        .json({
          error: `Receiver should be a number`,
        });
    };

    if (typeof amount !== 'number') {
      return res
        .status(400)
        .json({
          error: `Amount should be a number`,
        });
    };

    if (receiver === paramUserId) {
      return res
        .status(400)
        .json({
          error: `User and receiver cannot match`,
        });
    };

    try {
      const receiverUser = await UsersService.getUserById(knexInstance, receiver);

      if (!receiverUser) {
        return res
          .status(404)
          .json({
            error: `Receiver not found`,
          });
      };

      const successfulTransfer = await TransfersService.createTransfer(knexInstance, transfer);

      if (!successfulTransfer) {
        return res
          .status(400)
          .json({
            error: `Transfer not completed`,
          });
      };

      return res
        .status(201)
        .json(successfulTransfer);
    } catch(err) {
      next(err);
    };
  });

export default transfersRouter;
