import ICreateTicketDTO from '../dtos/ICreateTicketDTO';
import Ticket from '../infra/typeorm/entities/Ticket';

export default interface ITicketsRepository {
  create(data: ICreateTicketDTO): Promise<Ticket>;
  findByUser(user_id: string): Promise<Ticket[]>;
  findById(ticket_id: string): Promise<Ticket | undefined>;
  findAll(status: object[]): Promise<Ticket[]>;
  save(ticket: Ticket): Promise<Ticket>;
  delete(ticket: Ticket): Promise<void>;
}
