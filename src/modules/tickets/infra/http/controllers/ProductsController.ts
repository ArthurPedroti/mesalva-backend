import { Response, Request } from 'express';
import axios from 'axios';

export default class ProductsController {
  public async index(request: Request, response: Response): Promise<Response> {
    const products = await axios.get(
      `${process.env.APP_PROTHEUS_API_URL}/products`,
      {
        headers: request.headers,
        params: request.params,
      },
    );

    return response.json(products.data);
  }
}
