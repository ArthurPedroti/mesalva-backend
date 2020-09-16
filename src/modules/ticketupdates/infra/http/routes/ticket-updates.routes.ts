import { Router } from 'express';
import ensureAuthenticated from '@modules/users/infra/http/middlewares/ensureAuthenticated';
import { celebrate, Segments, Joi } from 'celebrate';
import TicketUpdatesController from '../controllers/TicketUpdatesController';

const ticketUpdatesRouter = Router();
const ticketUpdatesController = new TicketUpdatesController();

ticketUpdatesRouter.use(ensureAuthenticated);

ticketUpdatesRouter.get(
  '/:ticket_id',
  celebrate({
    [Segments.PARAMS]: {
      ticket_id: Joi.string().required(),
    },
  }),
  ticketUpdatesController.index,
);

ticketUpdatesRouter.post(
  '/',
  celebrate({
    [Segments.BODY]: {
      ticket_id: Joi.string().required(),
      flag: Joi.string(),
      description: Joi.string().required(),
    },
  }),
  ticketUpdatesController.create,
);

ticketUpdatesRouter.put(
  '/',
  celebrate({
    [Segments.BODY]: {
      ticket_update_id: Joi.string().required(),
      flag: Joi.string(),
      description: Joi.string().required(),
    },
  }),
  ticketUpdatesController.update,
);

ticketUpdatesRouter.delete(
  '/:ticket_update_id',
  celebrate({
    [Segments.PARAMS]: {
      ticket_update_id: Joi.string().required(),
    },
  }),
  ticketUpdatesController.delete,
);

export default ticketUpdatesRouter;
