export default interface ICreateTicketDTO {
  user_id: string;
  client_id: string;
  client_name: string;
  client_cnpj: string;
  classification: string;
  equipment: string;
  type: string;
  status: string;
  description: string;
}
