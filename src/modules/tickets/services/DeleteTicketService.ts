import { injectable, inject } from 'tsyringe';
import AppError from '@shared/errors/AppError';
import INotificationsRepository from '@modules/notifications/repositories/INotificationsRepository';
import ITicketsRepository from '../repositories/ITicketsRepository';

interface IRequest {
  ticket_id: string;
}

@injectable()
class DeleteTicketsService {
  constructor(
    @inject('TicketsRepository')
    private ticketsRepository: ITicketsRepository,

    @inject('NotificationsRepository')
    private notificationsRepository: INotificationsRepository,
  ) {}

  public async execute({ ticket_id }: IRequest): Promise<void> {
    const ticket = await this.ticketsRepository.findById(ticket_id);

    if (!ticket) {
      throw new AppError('Ticket does not exits');
    }

    const notifications = await this.notificationsRepository.findByTicketId(
      ticket_id,
    );

    if (notifications) {
      await this.notificationsRepository.deleteArray(notifications);
    }
  }
}

export default DeleteTicketsService;
