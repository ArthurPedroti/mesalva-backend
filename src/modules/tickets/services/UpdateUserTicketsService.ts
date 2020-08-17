import { injectable, inject } from 'tsyringe';
import AppError from '@shared/errors/AppError';
import ITicketsRepository from '../repositories/ITicketsRepository';
import Ticket from '../infra/typeorm/entities/Ticket';

interface IRequest {
  ticket_id: string;
  client_id: string;
  client_name: string;
  client_cnpj: string;
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
    client_id,
    client_name,
    client_cnpj,
    equipment,
    type,
    description,
  }: IRequest): Promise<Ticket> {
    const ticket = await this.ticketsRepository.findById(ticket_id);

    if (!ticket) {
      throw new AppError('Ticket does not exits');
    }

    ticket.client_id = client_id;
    ticket.client_name = client_name;
    ticket.client_cnpj = client_cnpj;
    ticket.equipment = equipment;
    ticket.type = type;
    ticket.description = description;

    return this.ticketsRepository.save(ticket);
  }
}

export default UpdateUserTicketsService;
