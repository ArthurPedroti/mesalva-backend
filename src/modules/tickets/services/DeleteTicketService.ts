import { injectable, inject } from 'tsyringe';
import AppError from '@shared/errors/AppError';
import ITicketsRepository from '../repositories/ITicketsRepository';

interface IRequest {
  ticket_id: string;
}

@injectable()
class DeleteTicketsService {
  constructor(
    @inject('TicketsRepository')
    private ticketsRepository: ITicketsRepository,
  ) {}

  public async execute({ ticket_id }: IRequest): Promise<void> {
    const ticket = await this.ticketsRepository.findById(ticket_id);

    if (!ticket) {
      throw new AppError('Ticket does not exits');
    }

    this.ticketsRepository.delete(ticket);
  }
}

export default DeleteTicketsService;
