export default interface ICreateNotificationDTO {
  title: string;
  content: string;
  role?: string;
  recipient_id?: string;
}
