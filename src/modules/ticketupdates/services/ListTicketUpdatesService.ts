import AppError from '@shared/errors/AppError';
import { injectable, inject } from 'tsyringe';
import TicketUpdate from '../infra/typeorm/entities/TicketUpdate';
import ITicketUpdatesRepository from '../repositories/ITicketUpdatesRepository';

interface IRequest {
  ticket_id: string;
}

@injectable()
class ListTicketUpdatesService {
  constructor(
    @inject('TicketUpdatesRepository')
    private ticket_updatesRepository: ITicketUpdatesRepository,
  ) {}

  public async execute({ ticket_id }: IRequest): Promise<TicketUpdate[]> {
    const ticket_updates = await this.ticket_updatesRepository.findByTicket(
      ticket_id,
    );

    if (!ticket_updates) {
      throw new AppError('Ticket does not exits');
    }

    return ticket_updates;
  }
}

export default ListTicketUpdatesService;
