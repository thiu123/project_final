import { IsIn, IsInt, IsMongoId, IsOptional, Min } from 'class-validator';
import { PRODUCT_TYPES, ProductType } from '../../../constants/app.constants';

export class AddToCartDto {
  @IsMongoId({ message: 'Invalid bookId' })
  bookId: string;

  @IsInt()
  @Min(1, { message: 'Quantity must be at least 1' })
  quantity: number;

  @IsOptional()
  @IsIn(PRODUCT_TYPES)
  productType?: ProductType;
}

export class UpdateCartItemDto {
  @IsMongoId({ message: 'Invalid bookId' })
  bookId: string;

  @IsInt()
  @Min(1, { message: 'Quantity must be at least 1' })
  quantity: number;
}

export class RemoveCartItemDto {
  @IsMongoId({ message: 'Invalid bookId' })
  bookId: string;
}
