import { injectable, inject } from 'tsyringe';
import ITicketsRepository from '../repositories/ITicketsRepository';
import Ticket from '../infra/typeorm/entities/Ticket';

interface IRequest {
  user_id: string;
  client: string;
  classification: string;
  equipment: string;
  type: string;
  status: string;
  description: string;
}

@injectable()
class CreateTicketService {
  constructor(
    @inject('TicketsRepository')
    private ticketsRepository: ITicketsRepository,
  ) {}

  public async execute({
    user_id,
    client,
    classification,
    equipment,
    type,
    status,
    description,
  }: IRequest): Promise<Ticket> {
    let statusDefault = 'Não atendido';
    let classificationDefault = 'Sem calssificação';

    if (status) {
      statusDefault = status;
    }

    if (classification) {
      classificationDefault = classification;
    }

    const ticket = this.ticketsRepository.create({
      user_id,
      client,
      classification: classificationDefault,
      equipment,
      type,
      status: statusDefault,
      description,
    });

    return ticket;
  }
}

export default CreateTicketService;
