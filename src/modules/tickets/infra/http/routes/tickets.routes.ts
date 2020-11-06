import { Router } from 'express';
import ensureAuthenticated from '@modules/users/infra/http/middlewares/ensureAuthenticated';
import { celebrate, Segments, Joi } from 'celebrate';
import TicketsController from '../controllers/TicketsController';
import UserTicketsController from '../controllers/UserTicketsController';
import ClientsController from '../controllers/ClientsController';
import ProductsController from '../controllers/ProductsController';

const ticketsRouter = Router();
const ticketsController = new TicketsController();
const userTicketsController = new UserTicketsController();
const clientsController = new ClientsController();
const productsController = new ProductsController();

ticketsRouter.get('/clients', clientsController.index);
ticketsRouter.get('/products', productsController.index);
ticketsRouter.use(ensureAuthenticated);

ticketsRouter.get('/', ticketsController.index);

ticketsRouter.post(
  '/',
  celebrate({
    [Segments.BODY]: {
      client_id: Joi.string().required(),
      client_name: Joi.string().required(),
      client_cnpj: Joi.string().required(),
      equipment: Joi.string().required(),
      type: Joi.string().required(),
      description: Joi.string().required(),
    },
  }),
  ticketsController.create,
);

ticketsRouter.put(
  '/:ticket_id',
  celebrate({
    [Segments.PARAMS]: {
      ticket_id: Joi.string().uuid().required(),
    },
    [Segments.BODY]: {
      client_id: Joi.string(),
      client_name: Joi.string(),
      client_cnpj: Joi.string(),
      classification: Joi.string(),
      equipment: Joi.string(),
      type: Joi.string(),
      sector: Joi.string(),
      description: Joi.string(),
    },
  }),
  ticketsController.update,
);

ticketsRouter.delete(
  '/:ticket_id',
  celebrate({
    [Segments.PARAMS]: {
      ticket_id: Joi.string().uuid().required(),
    },
  }),
  ticketsController.delete,
);

ticketsRouter.put(
  '/:ticket_id/me',
  celebrate({
    [Segments.PARAMS]: {
      ticket_id: Joi.string().uuid().required(),
    },
    [Segments.BODY]: {
      client_id: Joi.string(),
      client_name: Joi.string(),
      client_cnpj: Joi.string(),
      equipment: Joi.string(),
      type: Joi.string(),
      description: Joi.string(),
    },
  }),
  userTicketsController.update,
);

ticketsRouter.get('/me', userTicketsController.index);

export default ticketsRouter;
