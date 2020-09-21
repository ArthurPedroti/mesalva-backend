import { injectable, inject } from 'tsyringe';
import AppError from '@shared/errors/AppError';
import INotificationsRepository from '@modules/notifications/repositories/INotificationsRepository';
import IUsersRepository from '@modules/users/repositories/IUsersRepository';
import ITicketUpdatesRepository from '../repositories/ITicketUpdatesRepository';
import TicketUpdate from '../infra/typeorm/entities/TicketUpdate';

interface IRequest {
  user_id: string;
  ticket_update_id: string;
  title: string;
  flag: string;
  description: string;
}

@injectable()
class UpdateTicketUpdatesService {
  constructor(
    @inject('TicketUpdatesRepository')
    private ticketUpdatesRepository: ITicketUpdatesRepository,

    @inject('NotificationsRepository')
    private notificationsRepository: INotificationsRepository,

    @inject('UsersRepository')
    private usersRepository: IUsersRepository,
  ) {}

  public async execute({
    user_id,
    ticket_update_id,
    title,
    flag,
    description,
  }: IRequest): Promise<TicketUpdate> {
    const ticket_update = await this.ticketUpdatesRepository.findById(
      ticket_update_id,
    );

    if (!ticket_update) {
      throw new AppError('TicketUpdate does not exits');
    }

    ticket_update.title = title;
    ticket_update.flag = flag;
    ticket_update.description = description;

    const updatedTicketUpdate = await this.ticketUpdatesRepository.save(
      ticket_update,
    );

    const users = await this.usersRepository.listAllUsers();
    const filteredAdmins = users.filter(user => user.id !== user_id);
    const mapAdmins = filteredAdmins.map(user => user.id);

    // user owner notification
    if (user_id !== ticket_update.user.id) {
      await this.notificationsRepository.create({
        title: 'Chamado atualizado!',
        content: `Cliente: ${ticket_update.ticket.client_name}`,
        recipient_ids: [ticket_update.user.id],
        ticket_id: updatedTicketUpdate.id,
      });
    }

    // admin notification
    await this.notificationsRepository.create({
      title: 'Chamado atualizado!',
      content: `Cliente: ${ticket_update.ticket.client_name}`,
      recipient_ids: mapAdmins,
      ticket_id: updatedTicketUpdate.id,
    });

    return updatedTicketUpdate;
  }
}

export default UpdateTicketUpdatesService;
