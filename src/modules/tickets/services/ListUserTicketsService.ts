import { injectable, inject } from 'tsyringe';
import ITicketsRepository from '../repositories/ITicketsRepository';
import Ticket from '../infra/typeorm/entities/Ticket';

interface IRequest {
  user_id: string;
}

@injectable()
class ListUserTicketsService {
  constructor(
    @inject('TicketsRepository')
    private ticketsRepository: ITicketsRepository,
  ) {}

  public async execute({ user_id }: IRequest): Promise<Ticket[]> {
    const tickets = await this.ticketsRepository.findByUser(user_id);

    return tickets;
  }
}

export default ListUserTicketsService;
