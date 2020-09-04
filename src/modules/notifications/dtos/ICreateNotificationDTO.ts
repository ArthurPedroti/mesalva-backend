export default interface ICreateNotificationDTO {
  title: string;
  content: string;
  recipient_role?: string;
  recipient_ids?: string[];
}
