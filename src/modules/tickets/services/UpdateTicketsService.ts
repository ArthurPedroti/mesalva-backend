import { injectable, inject } from 'tsyringe';
import AppError from '@shared/errors/AppError';
import INotificationsRepository from '@modules/notifications/repositories/INotificationsRepository';
import IUsersRepository from '@modules/users/repositories/IUsersRepository';
import { addDays, differenceInMilliseconds, subMilliseconds } from 'date-fns';
import ITicketUpdatesRepository from '@modules/ticketupdates/repositories/ITicketUpdatesRepository';
import ITicketsRepository from '../repositories/ITicketsRepository';
import Ticket from '../infra/typeorm/entities/Ticket';

interface IRequest {
  user_id: string;
  ticket_id: string;
  client_id: string;
  client_name: string;
  client_cnpj: string;
  classification: string;
  equipment: string;
  type: string;
  sector: string;
  description: string;
}

@injectable()
class UpdateTicketsService {
  constructor(
    @inject('TicketsRepository')
    private ticketsRepository: ITicketsRepository,

    @inject('NotificationsRepository')
    private notificationsRepository: INotificationsRepository,

    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('TicketUpdatesRepository')
    private ticketUpdatesRepository: ITicketUpdatesRepository,
  ) {}

  public async execute({
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
    ticket.sector = sector;
    ticket.description = description;

    const updatedTicket = await this.ticketsRepository.save(ticket);

    const ticket_updates = await this.ticketUpdatesRepository.findByTicket(
      ticket_id,
    );

    const classificationTicketUpdate = ticket_updates.find(
      item => item.title === 'Classificado',
    );

    if (!classificationTicketUpdate) {
      await this.ticketUpdatesRepository.create({
        user_id,
        ticket_id,
        title: 'Classificado',
      });

      ticket.status = 'Em atendimento';
      await this.ticketsRepository.save(ticket);
    }

    const admins = await this.usersRepository.listAllUsers('admin');
    const filteredAdmins = admins.filter(user => user.id !== user_id);
    const mapAdmins = filteredAdmins.map(user => user.id);

    // user owner notification
    if (user_id !== ticket.user.id) {
      await this.notificationsRepository.create({
        title: 'Chamado atualizado!',
        content: `Cliente: ${clientNotificationName}`,
        recipient_ids: [ticket.user.id],
        ticket_id: updatedTicket.id,
      });
    }

    // admin notification
    if (mapAdmins.length > 0) {
      await this.notificationsRepository.create({
        title: 'Chamado atualizado!',
        content: `Cliente: ${clientNotificationName}`,
        recipient_ids: mapAdmins,
        ticket_id: updatedTicket.id,
      });
    }

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

        // user notification
        await this.notificationsRepository.create({
          title: 'Seu chamado se tornou cr??tico!',
          content: `Cliente: ${clientNotificationName}`,
          recipient_ids: [ticket.user.id],
          ticket_id: ticket.id,
          send_after: subMilliseconds(
            addDays(ticket.created_at, 20),
            millisecondsDifference,
          ),
        });

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

        // user notification
        await this.notificationsRepository.create({
          title: 'Seu chamado se tornou urgente!',
          content: `Cliente: ${clientNotificationName}`,
          recipient_ids: [ticket.user.id],
          ticket_id: ticket.id,
          send_after: subMilliseconds(
            addDays(ticket.created_at, 28),
            millisecondsDifference,
          ),
        });
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

        await this.notificationsRepository.create({
          // user notification
          title: 'Seu chamado se tornou urgente!',
          content: `Cliente: ${clientNotificationName}`,
          recipient_ids: [ticket.user.id],
          ticket_id: ticket.id,
          send_after: subMilliseconds(
            addDays(ticket.created_at, 8),
            millisecondsDifference,
          ),
        });
      }
    }

    return updatedTicket;
  }
}

export default UpdateTicketsService;
