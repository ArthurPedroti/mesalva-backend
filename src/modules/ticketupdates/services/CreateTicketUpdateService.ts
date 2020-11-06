import { injectable, inject } from 'tsyringe';
import INotificationsRepository from '@modules/notifications/repositories/INotificationsRepository';
import IUsersRepository from '@modules/users/repositories/IUsersRepository';
import AppError from '@shared/errors/AppError';
import ITicketsRepository from '@modules/tickets/repositories/ITicketsRepository';
import ITicketUpdatesRepository from '../repositories/ITicketUpdatesRepository';
import TicketUpdate from '../infra/typeorm/entities/TicketUpdate';

interface IRequest {
  user_id: string;
  ticket_id: string;
  title: string;
  flag?: string;
  description: string;
}

@injectable()
class CreateTicketUpdateService {
  constructor(
    @inject('TicketsRepository')
    private ticketsRepository: ITicketsRepository,

    @inject('TicketUpdatesRepository')
    private ticketUpdatesRepository: ITicketUpdatesRepository,

    @inject('NotificationsRepository')
    private notificationsRepository: INotificationsRepository,

    @inject('UsersRepository')
    private usersRepository: IUsersRepository,
  ) {}

  public async execute({
    user_id,
    ticket_id,
    title,
    flag,
    description,
  }: IRequest): Promise<TicketUpdate> {
    const users = await this.usersRepository.listAllUsers();
    const filteredAdmins = users.filter(user => user.id !== user_id);
    const mapAdmins = filteredAdmins.map(user => user.id);

    const ticket_update_created = await this.ticketUpdatesRepository.create({
      user_id,
      ticket_id,
      title,
      flag,
      description,
    });

    const ticket_update = await this.ticketUpdatesRepository.findById(
      ticket_update_created.id,
    );

    if (!ticket_update) {
      throw new AppError('An error has occurred at creating a ticket update');
    }

    if (title === 'Concluído') {
      const ticket = await this.ticketsRepository.findById(
        ticket_update.ticket.id,
      );

      if (ticket) {
        ticket.status = 'Atendido';
        await this.ticketsRepository.save(ticket);
      }
    }

    // user owner notification
    if (user_id !== ticket_update.ticket.user_id) {
      await this.notificationsRepository.create({
        title: 'Chamado atualizado!',
        content: `Cliente: ${ticket_update.ticket.client_name}`,
        recipient_ids: [ticket_update.ticket.user_id],
        ticket_id: ticket_update.ticket.id,
      });
    }

    // admin notification
    await this.notificationsRepository.create({
      title: 'Chamado atualizado!',
      content: `Cliente: ${ticket_update.ticket.client_name}`,
      recipient_ids: mapAdmins,
      ticket_id: ticket_update.ticket.id,
    });

    return ticket_update;
  }
}

export default CreateTicketUpdateService;
