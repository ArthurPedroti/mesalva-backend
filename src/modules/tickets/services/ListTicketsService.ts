import { injectable, inject } from 'tsyringe';
import ITicketsRepository from '../repositories/ITicketsRepository';
import Ticket from '../infra/typeorm/entities/Ticket';

interface IRequest {
  status: object[];
}

@injectable()
class ListTicketsService {
  constructor(
    @inject('TicketsRepository')
    private ticketsRepository: ITicketsRepository,
  ) {}

  public async execute({ status }: IRequest): Promise<Ticket[]> {
    const tickets = await this.ticketsRepository.findAll(status);

    return tickets;
  }
}

export default ListTicketsService;
