import CreateTicketUpdateService from '@modules/ticketupdates/services/CreateTicketUpdateService';
import ListTicketUpdatesService from '@modules/ticketupdates/services/ListTicketUpdatesService';
import UpdateTicketUpdatesService from '@modules/ticketupdates/services/UpdateTicketUpdatesService';
import DeleteTicketUpdateService from '@modules/ticketupdates/services/DeleteTicketUpdateService';
import { Response, Request } from 'express';
import { container } from 'tsyringe';

export default class TicketUpdatesController {
  public async index(request: Request, response: Response): Promise<Response> {
    const { ticket_id } = request.params;

    const listTicketUpdates = container.resolve(ListTicketUpdatesService);

    const ticketUpdates = await listTicketUpdates.execute({ ticket_id });

    return response.json(ticketUpdates);
  }

  public async create(request: Request, response: Response): Promise<Response> {
    const user_id = request.user.id;
    const { ticket_id, title, flag, description } = request.body;

    const createTicketUpdate = container.resolve(CreateTicketUpdateService);

    const ticket_update = await createTicketUpdate.execute({
      user_id,
      ticket_id,
      title,
      flag,
      description,
    });

    return response.json(ticket_update);
  }

  public async update(request: Request, response: Response): Promise<Response> {
    const user_id = request.user.id;
    const { ticket_update_id, title, flag, description } = request.body;

    const createTicketUpdate = container.resolve(UpdateTicketUpdatesService);

    const ticket_update = await createTicketUpdate.execute({
      user_id,
      ticket_update_id,
      title,
      flag,
      description,
    });

    return response.json(ticket_update);
  }

  public async delete(request: Request, response: Response): Promise<Response> {
    const { ticket_update_id } = request.params;

    const deleteTicketUpdate = container.resolve(DeleteTicketUpdateService);

    await deleteTicketUpdate.execute({ ticket_update_id });

    return response.status(204).send();
  }
}
