export default interface ICreateNotificationDTO {
  title: string;
  content: string;
  ticket_id: string;
  send_after?: Date;
  recipient_role?: string;
  recipient_ids?: string[];
}
