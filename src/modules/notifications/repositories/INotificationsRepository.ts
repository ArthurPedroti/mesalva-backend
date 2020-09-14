import { ObjectID } from 'typeorm';
import ICreateNotificationDTO from '../dtos/ICreateNotificationDTO';
import Notification from '../infra/typeorm/schemas/Notification';

export default interface INotificationsRepository {
  create(data: ICreateNotificationDTO): Promise<Notification>;
  findByTicketId(ticket_id: string): Promise<ObjectID[] | undefined>;
  deleteArray(data: ObjectID[]): Promise<void>;
}
