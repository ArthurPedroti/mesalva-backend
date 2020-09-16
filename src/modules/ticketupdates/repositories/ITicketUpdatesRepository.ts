import ICreateTicketUpdateDTO from '../dtos/ICreateTicketUpdateDTO';
import TicketUpdate from '../infra/typeorm/entities/TicketUpdate';

export default interface ITicketUpdatesRepository {
  create(data: ICreateTicketUpdateDTO): Promise<TicketUpdate>;
  findByTicket(ticket_id: string): Promise<TicketUpdate[]>;
  findById(ticket_update_id: string): Promise<TicketUpdate | undefined>;
  save(ticket: TicketUpdate): Promise<TicketUpdate>;
  delete(ticket: TicketUpdate): Promise<void>;
}
