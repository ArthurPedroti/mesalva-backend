import { Response, Request } from 'express';
import { container } from 'tsyringe';
import CreateTicketService from '@modules/tickets/services/CreateTicketService';
import ListTicketsService from '@modules/tickets/services/ListTicketsService';
import UpdateTicketsService from '@modules/tickets/services/UpdateTicketsService';
import DeleteTicketsService from '@modules/tickets/services/DeleteTicketService';

export default class TicketsController {
  public async index(request: Request, response: Response): Promise<Response> {
    const { canceled } = request.query;

    let status = [{}];
    if (canceled === 'true') {
      status = [{ status: 'Cancelado' }];
    }

    const listTickets = container.resolve(ListTicketsService);

    const tickets = await listTickets.execute({ status });

    return response.json(tickets);
  }

  public async create(request: Request, response: Response): Promise<Response> {
    const user_id = request.user.id;
    const {
      client_id,
      client_name,
      client_cnpj,
      classification,
      equipment,
      type,
      description,
    } = request.body;

    const createTicket = container.resolve(CreateTicketService);

    const ticket = await createTicket.execute({
      user_id,
      client_id,
      client_name,
      client_cnpj,
      classification,
      equipment,
      type,
      description,
    });

    return response.json(ticket);
  }

  public async update(request: Request, response: Response): Promise<Response> {
    const user_id = request.user.id;
    const { ticket_id } = request.params;
    const {
      client_id,
      client_name,
      client_cnpj,
      classification,
      equipment,
      type,
      sector,
      description,
    } = request.body;

    const updateTicket = container.resolve(UpdateTicketsService);

    const ticket = await updateTicket.execute({
      user_id,
      ticket_id,
      client_id,
      client_name,
      client_cnpj,
      classification,
      equipment,
      type,
      sector,
      description,
    });

    return response.json(ticket);
  }

  public async delete(request: Request, response: Response): Promise<Response> {
    const { ticket_id } = request.params;

    const deleteTicket = container.resolve(DeleteTicketsService);

    await deleteTicket.execute({
      ticket_id,
    });

    return response.status(204).send();
  }
}
