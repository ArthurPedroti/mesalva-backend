import { getMongoRepository, MongoRepository } from 'typeorm';

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
    recipient_role,
    recipient_ids,
  }: ICreateNotificationDTO): Promise<Notification> {
    const notification = this.ormRepository.create({
      title,
      content,
      recipient_role,
      recipient_ids,
    });

    await this.ormRepository.save(notification);

    if (recipient_role) {
      await axios({
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
      await axios({
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
          include_external_user_ids: recipient_ids,
        },
      });
    }

    return notification;
  }
}

export default NotificationsRepository;
