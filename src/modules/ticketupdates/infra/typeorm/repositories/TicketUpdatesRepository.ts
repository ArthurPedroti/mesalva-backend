import ICreateTicketUpdateDTO from '@modules/ticketupdates/dtos/ICreateTicketUpdateDTO';
import ITicketUpdatesRepository from '@modules/ticketupdates/repositories/ITicketUpdatesRepository';
import { Repository, getRepository } from 'typeorm';
import TicketUpdate from '../entities/TicketUpdate';

class TicketUpdatesRepository implements ITicketUpdatesRepository {
  private ormRepository: Repository<TicketUpdate>;

  constructor() {
    this.ormRepository = getRepository(TicketUpdate);
  }

  public async create({
    user_id,
    ticket_id,
    title,
    flag,
    description,
  }: ICreateTicketUpdateDTO): Promise<TicketUpdate> {
    const ticket = this.ormRepository.create({
      user_id,
      ticket_id,
      title,
      flag,
      description,
    });

    await this.ormRepository.save(ticket);

    return ticket;
  }

  public async findByTicket(ticket_id: string): Promise<TicketUpdate[]> {
    const ticket_updates = await this.ormRepository.find({
      where: { ticket_id },
      order: {
        created_at: 'ASC',
      },
      relations: ['user', 'ticket'],
    });

    return ticket_updates;
  }

  public async findById(
    ticket_update_id: string,
  ): Promise<TicketUpdate | undefined> {
    const ticket = await this.ormRepository.findOne(ticket_update_id, {
      relations: ['user', 'ticket'],
    });

    return ticket;
  }

  public async save(ticket_update: TicketUpdate): Promise<TicketUpdate> {
    return this.ormRepository.save(ticket_update);
  }

  public async delete(ticket_update: TicketUpdate): Promise<void> {
    await this.ormRepository.remove(ticket_update);
  }
}

export default TicketUpdatesRepository;
