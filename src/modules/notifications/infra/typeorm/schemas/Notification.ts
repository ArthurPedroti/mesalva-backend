import {
  ObjectID,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  ObjectIdColumn,
} from 'typeorm';

@Entity('notifications')
class Notification {
  @ObjectIdColumn()
  id: ObjectID;

  @Column()
  title: string;

  @Column()
  content: string;

  @Column()
  send_after: Date;

  @Column()
  one_signal_id: Date;

  @Column()
  ticket_id: Date;

  @Column()
  recipient_role: string;

  @Column('uuid')
  recipient_ids: string[];

  @Column({ default: false })
  read: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

export default Notification;
