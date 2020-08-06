import { injectable, inject } from 'tsyringe';
import AppError from '@shared/errors/AppError';
import ITicketsRepository from '../repositories/ITicketsRepository';
import Ticket from '../infra/typeorm/entities/Ticket';

interface IRequest {
  ticket_id: string;
  client: string;
  equipment: string;
  type: string;
  description: string;
}

@injectable()
class UpdateUserTicketsService {
  constructor(
    @inject('TicketsRepository')
    private ticketsRepository: ITicketsRepository,
  ) {}

  public async execute({
    ticket_id,
    client,
    equipment,
    type,
    description,
  }: IRequest): Promise<Ticket> {
    const ticket = await this.ticketsRepository.findById(ticket_id);

    if (!ticket) {
      throw new AppError('Ticket does not exits');
    }

    ticket.client = client;
    ticket.equipment = equipment;
    ticket.type = type;
    ticket.description = description;

    return this.ticketsRepository.save(ticket);
  }
}

export default UpdateUserTicketsService;
