import { injectable, inject } from 'tsyringe';
import AppError from '@shared/errors/AppError';
import INotificationsRepository from '@modules/notifications/repositories/INotificationsRepository';
import ITicketsRepository from '../repositories/ITicketsRepository';
import Ticket from '../infra/typeorm/entities/Ticket';

interface IRequest {
  ticket_id: string;
  client_id: string;
  client_name: string;
  client_cnpj: string;
  classification: string;
  equipment: string;
  type: string;
  status: string;
  description: string;
}

@injectable()
class UpdateTicketsService {
  constructor(
    @inject('TicketsRepository')
    private ticketsRepository: ITicketsRepository,

    @inject('NotificationsRepository')
    private notificationsRepository: INotificationsRepository,
  ) {}

  public async execute({
    ticket_id,
    client_id,
    client_name,
    client_cnpj,
    classification,
    equipment,
    type,
    status,
    description,
  }: IRequest): Promise<Ticket> {
    const ticket = await this.ticketsRepository.findById(ticket_id);

    if (!ticket) {
      throw new AppError('Ticket does not exits');
    }

    let clientNotificationName;

    if (client_name) {
      clientNotificationName = client_name;
    } else {
      clientNotificationName = ticket.client_name;
    }

    ticket.client_id = client_id;
    ticket.client_name = client_name;
    ticket.client_cnpj = client_cnpj;
    ticket.classification = classification;
    ticket.equipment = equipment;
    ticket.type = type;
    ticket.status = status;
    ticket.description = description;

    const updatedTicket = await this.ticketsRepository.save(ticket);

    await this.notificationsRepository.create({
      title: 'Chamado atualizado!',
      content: `Cliente: ${clientNotificationName}`,
      recipient_role: 'admin',
    });

    await this.notificationsRepository.create({
      title: 'Chamado atualizado!',
      content: `Cliente: ${clientNotificationName}`,
      recipient_ids: [ticket.user.id],
    });

    return updatedTicket;
  }
}

export default UpdateTicketsService;
