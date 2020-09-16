import ITicketsRepository from '@modules/tickets/repositories/ITicketsRepository';
import { Repository, getRepository } from 'typeorm';
import ICreateTicketDTO from '@modules/tickets/dtos/ICreateTicketDTO';
import Ticket from '../entities/Ticket';

class TicketsRepository implements ITicketsRepository {
  private ormRepository: Repository<Ticket>;

  constructor() {
    this.ormRepository = getRepository(Ticket);
  }

  public async findById(ticket_id: string): Promise<Ticket | undefined> {
    const ticket = await this.ormRepository.findOne(ticket_id, {
      relations: ['user'],
    });

    return ticket;
  }

  public async save(ticket: Ticket): Promise<Ticket> {
    return this.ormRepository.save(ticket);
  }

  public async findByUser(user_id: string): Promise<Ticket[]> {
    const tickets = await this.ormRepository.find({
      where: { user_id },
      order: {
        updated_at: 'DESC',
      },
      relations: ['user'],
    });

    return tickets;
  }

  public async findAll(status: object[]): Promise<Ticket[]> {
    const statusArray = status;
    // const whereArray = status.map(statusItem => {
    //   const statusFiltered = {
    //     ...statusItem,
    //     canceled,
    //   };
    //   return statusFiltered;
    // });
    // whereArray = [
    //   { status: 'Não atendido', canceled: false },
    //   { status: 'Em atendimento', canceled: false },
    // ]

    const tickets = await this.ormRepository.find({
      where: statusArray,
      order: {
        updated_at: 'DESC',
      },
      relations: ['user'],
    });

    return tickets;
  }

  public async create({
    user_id,
    client_id,
    client_name,
    client_cnpj,
    classification,
    equipment,
    type,
    status,
    description,
  }: ICreateTicketDTO): Promise<Ticket> {
    const ticket = this.ormRepository.create({
      user_id,
      client_id,
      client_name,
      client_cnpj,
      classification,
      equipment,
      type,
      status,
      description,
    });

    await this.ormRepository.save(ticket);

    return ticket;
  }

  public async delete(ticket: Ticket): Promise<void> {
    await this.ormRepository.remove(ticket);
  }
}

export default TicketsRepository;
