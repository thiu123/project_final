export class CreateBookDto {
  key: string;
  title: string;
  cover_url?: string;
  pdf_url?: string | null;
  first_publish_year?: number;
  authors: string[];
  price?: number;
  subjects?: string[];
  description?: string;
  rating?: number;
  stock?: number;
  sold?: number;
}

export type UpdateBookDto = Partial<CreateBookDto>;
