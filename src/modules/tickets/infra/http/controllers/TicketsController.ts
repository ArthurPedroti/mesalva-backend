import { Response, Request } from 'express';
import { container } from 'tsyringe';
import CreateTicketService from '@modules/tickets/services/CreateTicketService';
import ListTicketsService from '@modules/tickets/services/ListTicketsService';
import UpdateTicketsService from '@modules/tickets/services/UpdateTicketsService';

export default class TicketsController {
  public async index(request: Request, response: Response): Promise<Response> {
    const { attended } = request.query;
    let status = [
      { status: 'Atendido' },
      { status: 'Não atendido' },
      { status: 'Em atendimento' },
    ];

    if (attended) {
      if (attended === 'yes') {
        status = [{ status: 'Atendido' }];
      } else {
        status = [{ status: 'Não atendido' }, { status: 'Em atendimento' }];
      }
    }

    const listTickets = container.resolve(ListTicketsService);

    const tickets = await listTickets.execute({ status });

    return response.json(tickets);
  }

  public async create(request: Request, response: Response): Promise<Response> {
    const user_id = request.user.id;
    const {
      client,
      classification,
      equipment,
      type,
      status,
      description,
    } = request.body;

    const createTicket = container.resolve(CreateTicketService);

    const ticket = await createTicket.execute({
      user_id,
      client,
      classification,
      equipment,
      type,
      status,
      description,
    });

    return response.json(ticket);
  }

  public async update(request: Request, response: Response): Promise<Response> {
    const {
      ticket_id,
      client,
      classification,
      equipment,
      type,
      status,
      description,
    } = request.body;

    const updateTicket = container.resolve(UpdateTicketsService);

    const ticket = await updateTicket.execute({
      ticket_id,
      client,
      classification,
      equipment,
      type,
      status,
      description,
    });

    return response.json(ticket);
  }
}
