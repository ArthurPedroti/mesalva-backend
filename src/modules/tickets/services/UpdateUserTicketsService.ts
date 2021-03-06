import { injectable, inject } from 'tsyringe';
import AppError from '@shared/errors/AppError';
import INotificationsRepository from '@modules/notifications/repositories/INotificationsRepository';
import IUsersRepository from '@modules/users/repositories/IUsersRepository';
import { addDays, differenceInMilliseconds, subMilliseconds } from 'date-fns';
import ITicketsRepository from '../repositories/ITicketsRepository';
import Ticket from '../infra/typeorm/entities/Ticket';

interface IRequest {
  user_id: string;
  ticket_id: string;
  client_id: string;
  client_name: string;
  client_cnpj: string;
  equipment: string;
  type: string;
  description: string;
}

@injectable()
class UpdateUserTicketsService {
  constructor(
    @inject('TicketsRepository')
    private ticketsRepository: ITicketsRepository,

    @inject('NotificationsRepository')
    private notificationsRepository: INotificationsRepository,

    @inject('UsersRepository')
    private usersRepository: IUsersRepository,
  ) {}

  public async execute({
    user_id,
    ticket_id,
    client_id,
    client_name,
    client_cnpj,
    equipment,
    type,
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
    ticket.equipment = equipment;
    ticket.type = type;
    ticket.description = description;

    const updatedTicket = await this.ticketsRepository.save(ticket);

    const admins = await this.usersRepository.listAllUsers('admin');
    const filteredAdmins = admins.filter(user => user.id !== user_id);
    const mapAdmins = filteredAdmins.map(user => user.id);

    // admin notification
    await this.notificationsRepository.create({
      title: 'Chamado atualizado!',
      content: `Cliente: ${clientNotificationName}`,
      recipient_ids: mapAdmins,
      ticket_id: updatedTicket.id,
    });

    const notifications = await this.notificationsRepository.findByTicketId(
      ticket_id,
    );

    if (type && notifications) {
      this.notificationsRepository.deleteOnlyScheduledArray(notifications);
      const millisecondsDifference = differenceInMilliseconds(
        ticket.created_at,
        Date.now(),
      );

      // if not stoped machine notifications
      if (type === 'M??quina n??o parada') {
        // admin notification
        if (mapAdmins.length > 0) {
          await this.notificationsRepository.create({
            title: 'Um chamado se tornou cr??tico!',
            content: `Cliente: ${clientNotificationName}`,
            recipient_ids: mapAdmins,
            ticket_id: ticket.id,
            send_after: subMilliseconds(
              addDays(ticket.created_at, 20),
              millisecondsDifference,
            ),
          });
        }

        // admin notification
        if (mapAdmins.length > 0) {
          await this.notificationsRepository.create({
            title: 'Um chamado se tornou urgente!',
            content: `Cliente: ${clientNotificationName}`,
            recipient_ids: mapAdmins,
            ticket_id: ticket.id,
            send_after: subMilliseconds(
              addDays(ticket.created_at, 28),
              millisecondsDifference,
            ),
          });
        }
      }

      // if stoped machine notifications
      if (type === 'M??quina parada') {
        // admin notification
        if (mapAdmins.length > 0) {
          await this.notificationsRepository.create({
            title: 'Um chamado se tornou urgente!',
            content: `Cliente: ${clientNotificationName}`,
            recipient_ids: mapAdmins,
            ticket_id: ticket.id,
            send_after: subMilliseconds(
              addDays(ticket.created_at, 8),
              millisecondsDifference,
            ),
          });
        }
      }
    }

    return updatedTicket;
  }
}

export default UpdateUserTicketsService;
