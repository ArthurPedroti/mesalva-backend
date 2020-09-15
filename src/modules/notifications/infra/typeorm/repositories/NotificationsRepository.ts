import { getMongoRepository, MongoRepository, ObjectID } from 'typeorm';

import INotificationsRepository from '@modules/notifications/repositories/INotificationsRepository';
import ICreateNotificationDTO from '@modules/notifications/dtos/ICreateNotificationDTO';

import axios from 'axios';
import Notification from '../schemas/Notification';

class NotificationsRepository implements INotificationsRepository {
  private ormRepository: MongoRepository<Notification>;

  constructor() {
    this.ormRepository = getMongoRepository(Notification, 'mongo');
  }

  public async create({
    title,
    content,
    send_after,
    ticket_id,
    recipient_role,
    recipient_ids,
  }: ICreateNotificationDTO): Promise<Notification> {
    let onesignalNotification;
    if (recipient_role) {
      onesignalNotification = await axios({
        method: 'POST',
        url: 'https://onesignal.com/api/v1/notifications',
        headers: {
          Authorization: process.env.ONE_SIGNAL_KEY,
          'Content-Type': 'application/json',
        },
        data: {
          app_id: process.env.ONE_SIGNAL_APP_ID,
          contents: { en: content },
          headings: { en: title },
          send_after,
          filters: [
            {
              field: 'tag',
              key: 'role',
              realation: '=',
              value: recipient_role,
            },
          ],
        },
      });
    } else {
      onesignalNotification = await axios({
        method: 'POST',
        url: 'https://onesignal.com/api/v1/notifications',
        headers: {
          Authorization: process.env.ONE_SIGNAL_KEY,
          'Content-Type': 'application/json',
        },
        data: {
          app_id: process.env.ONE_SIGNAL_APP_ID,
          contents: { en: content },
          headings: { en: title },
          send_after,
          include_external_user_ids: recipient_ids,
        },
      });
    }

    const notification = this.ormRepository.create({
      title,
      content,
      send_after,
      one_signal_id: onesignalNotification.data.id,
      schedule: !!send_after,
      ticket_id,
      recipient_role,
      recipient_ids,
    });

    await this.ormRepository.save(notification);

    return notification;
  }

  public async findByTicketId(
    ticket_id: string,
  ): Promise<ObjectID[] | undefined> {
    const notifications = await this.ormRepository.find({
      where: { ticket_id },
    });

    const idsArray = notifications.map(notification => notification.id);

    return idsArray;
  }

  public async deleteArray(data: ObjectID[]): Promise<void> {
    const result = data.map(async id => {
      const notification = await this.ormRepository.findOne(id);

      if (notification) {
        await this.ormRepository.remove(notification);
      }

      if (notification?.one_signal_id) {
        await axios({
          method: 'DELETE',
          url: `https://onesignal.com/api/v1/notifications/${notification?.one_signal_id}?app_id=${process.env.ONE_SIGNAL_APP_ID}`,
          headers: {
            Authorization: process.env.ONE_SIGNAL_KEY,
            'Content-Type': 'application/json',
          },
        });
      }
    });

    Promise.all(result);
  }

  public async deleteOnlyScheduledArray(data: ObjectID[]): Promise<void> {
    const result = data.map(async id => {
      const notification = await this.ormRepository.findOne(id);

      if (notification?.schedule) {
        await this.ormRepository.remove(notification);
      }
      if (notification?.one_signal_id) {
        await axios({
          method: 'DELETE',
          url: `https://onesignal.com/api/v1/notifications/${notification?.one_signal_id}?app_id=${process.env.ONE_SIGNAL_APP_ID}`,
          headers: {
            Authorization: process.env.ONE_SIGNAL_KEY,
            'Content-Type': 'application/json',
          },
        });
      }
    });

    Promise.all(result);
  }
}

export default NotificationsRepository;
