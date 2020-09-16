import { injectable, inject } from 'tsyringe';
import AppError from '@shared/errors/AppError';
import ITicketUpdatesRepository from '../repositories/ITicketUpdatesRepository';

interface IRequest {
  ticket_update_id: string;
}

@injectable()
class DeleteTicketUpdatesService {
  constructor(
    @inject('TicketUpdatesRepository')
    private ticketUpdatesRepository: ITicketUpdatesRepository,
  ) {}

  public async execute({ ticket_update_id }: IRequest): Promise<void> {
    const ticket_update = await this.ticketUpdatesRepository.findById(
      ticket_update_id,
    );

    if (!ticket_update) {
      throw new AppError('TicketUpdate does not exits');
    }

    await this.ticketUpdatesRepository.delete(ticket_update);
  }
}

export default DeleteTicketUpdatesService;
