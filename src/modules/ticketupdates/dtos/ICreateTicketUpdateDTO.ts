export default interface ICreateTicketUpdateDTO {
  user_id: string;
  ticket_id: string;
  flag?: string;
  description: string;
}
