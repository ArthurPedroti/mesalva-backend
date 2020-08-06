export default interface ICreateTicketDTO {
  user_id: string;
  client: string;
  classification: string;
  equipment: string;
  type: string;
  status: string;
  description: string;
}
