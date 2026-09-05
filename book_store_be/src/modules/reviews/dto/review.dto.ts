export class CreateReviewDto {
  bookId: string;
  rating: number;
  comment: string;
}

export class EditReviewDto {
  rating: number;
  comment: string;
}

export class ReplyDto {
  content: string;
}
