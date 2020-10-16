import { injectable, inject } from 'tsyringe';
import INotificationsRepository from '@modules/notifications/repositories/INotificationsRepository';
import IUsersRepository from '@modules/users/repositories/IUsersRepository';
import { addDays } from 'date-fns';
import ITicketUpdatesRepository from '@modules/ticketupdates/repositories/ITicketUpdatesRepository';
import ITicketsRepository from '../repositories/ITicketsRepository';
import Ticket from '../infra/typeorm/entities/Ticket';

interface IRequest {
  user_id: string;
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
class CreateTicketService {
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
    client_id,
    client_name,
    client_cnpj,
    classification,
    equipment,
    type,
    status,
    description,
  }: IRequest): Promise<Ticket> {
    let statusDefault = 'Não atendido';
    let classificationDefault = 'Sem classificação';

    if (status) {
      statusDefault = status;
    }

    if (classification) {
      classificationDefault = classification;
    }

    const admins = await this.usersRepository.listAllUsers('admin');
    const filteredAdmins = admins.filter(user => user.id !== user_id);
    const mapAdmins = filteredAdmins.map(user => user.id);

    const ticket = await this.ticketsRepository.create({
      user_id,
      client_id,
      client_name,
      client_cnpj,
      classification: classificationDefault,
      equipment,
      type,
      status: statusDefault,
      description,
    });

    // ticket created admins notification
    if (mapAdmins.length > 0) {
      await this.notificationsRepository.create({
        title: `Novo chamado! - ${type}`,
        content: `Cliente: ${client_name}`,
        recipient_ids: mapAdmins,
        ticket_id: ticket.id,
      });
    }

    // if not stoped machine notifications
    if (type === 'Máquina não parada') {
      // admin notification
      if (mapAdmins.length > 0) {
        await this.notificationsRepository.create({
          title: 'Um chamado se tornou crítico!',
          content: `Cliente: ${client_name}`,
          recipient_ids: mapAdmins,
          ticket_id: ticket.id,
          send_after: addDays(ticket.created_at, 20),
        });
      }

      // user notification
      await this.notificationsRepository.create({
        title: 'Seu chamado se tornou crítico!',
        content: `Cliente: ${client_name}`,
        recipient_ids: [user_id],
        ticket_id: ticket.id,
        send_after: addDays(ticket.created_at, 20),
      });

      // admin notification
      if (mapAdmins.length > 0) {
        await this.notificationsRepository.create({
          title: 'Um chamado se tornou urgente!',
          content: `Cliente: ${client_name}`,
          recipient_ids: mapAdmins,
          ticket_id: ticket.id,
          send_after: addDays(ticket.created_at, 28),
        });
      }

      // user notification
      await this.notificationsRepository.create({
        title: 'Seu chamado se tornou urgente!',
        content: `Cliente: ${client_name}`,
        recipient_ids: [user_id],
        ticket_id: ticket.id,
        send_after: addDays(ticket.created_at, 28),
      });
    }

    // if stoped machine notifications
    if (type === 'Máquina parada') {
      // admin notification
      if (mapAdmins.length > 0) {
        await this.notificationsRepository.create({
          title: 'Um chamado se tornou urgente!',
          content: `Cliente: ${client_name}`,
          recipient_ids: mapAdmins,
          ticket_id: ticket.id,
          send_after: addDays(ticket.created_at, 8),
        });
      }

      await this.notificationsRepository.create({
        // user notification
        title: 'Seu chamado se tornou urgente!',
        content: `Cliente: ${client_name}`,
        recipient_ids: [user_id],
        ticket_id: ticket.id,
        send_after: addDays(ticket.created_at, 8),
      });
    }

    await this.ticketUpdatesRepository.create({
      user_id,
      ticket_id: ticket.id,
      title: 'Aguardando classificação',
    });

    return ticket;
  }
}

export default CreateTicketService;
