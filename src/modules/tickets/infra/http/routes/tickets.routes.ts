import { Router } from 'express';
import ensureAuthenticated from '@modules/users/infra/http/middlewares/ensureAuthenticated';
import { celebrate, Segments, Joi } from 'celebrate';
import TicketsController from '../controllers/TicketsController';
import UserTicketsController from '../controllers/UserTicketsController';

const ticketsRouter = Router();
const ticketsController = new TicketsController();
const userTicketsController = new UserTicketsController();

ticketsRouter.use(ensureAuthenticated);

ticketsRouter.get('/', ticketsController.index);

ticketsRouter.post(
  '/',
  celebrate({
    [Segments.BODY]: {
      client: Joi.string().required(),
      equipment: Joi.string().required(),
      type: Joi.string().required(),
      description: Joi.string().required(),
    },
  }),
  ticketsController.create,
);

ticketsRouter.put(
  '/',
  celebrate({
    [Segments.BODY]: {
      ticket_id: Joi.string().uuid().required(),
      client: Joi.string(),
      classification: Joi.string(),
      equipment: Joi.string(),
      type: Joi.string(),
      status: Joi.string(),
      description: Joi.string(),
    },
  }),
  ticketsController.update,
);

ticketsRouter.put(
  '/me',
  celebrate({
    [Segments.BODY]: {
      ticket_id: Joi.string().uuid().required(),
      client: Joi.string(),
      equipment: Joi.string(),
      type: Joi.string(),
      description: Joi.string(),
    },
  }),
  userTicketsController.update,
);

ticketsRouter.get('/me', userTicketsController.index);

export default ticketsRouter;
