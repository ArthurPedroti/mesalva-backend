import { injectable, inject } from 'tsyringe';
import AppError from '@shared/errors/AppError';
import ITicketsRepository from '../repositories/ITicketsRepository';
import Ticket from '../infra/typeorm/entities/Ticket';

interface IRequest {
  ticket_id: string;
  client: string;
  classification: string;
  equipment: string;
  type: string;
  status: string;
  description: string;
}

@injectable()
class UpdateTicketsService {
  constructor(
    @inject('TicketsRepository')
    private ticketsRepository: ITicketsRepository,
  ) {}

  public async execute({
    ticket_id,
    client,
    classification,
    equipment,
    type,
    status,
    description,
  }: IRequest): Promise<Ticket> {
    const ticket = await this.ticketsRepository.findById(ticket_id);

    if (!ticket) {
      throw new AppError('Ticket does not exits');
    }

    ticket.client = client;
    ticket.classification = classification;
    ticket.equipment = equipment;
    ticket.type = type;
    ticket.status = status;
    ticket.description = description;

    return this.ticketsRepository.save(ticket);
  }
}

export default UpdateTicketsService;
