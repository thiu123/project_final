import { ProductType } from '../../../constants/app.constants';

export class AddToCartDto {
  bookId: string;
  quantity: number;
  productType?: ProductType;
}

export class UpdateCartItemDto {
  bookId: string;
  quantity: number;
}

export class RemoveCartItemDto {
  bookId: string;
}
