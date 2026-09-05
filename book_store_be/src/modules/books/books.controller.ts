import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AdminGuard } from '../../common/guards/admin.guard';
import { BooksService } from './books.service';
import { CreateBookDto, UpdateBookDto } from './dto/book.dto';
import { QueryBooksDto } from './dto/query-books.dto';

/**
 * Coerces query strings to the DTO's types and drops unknown params.
 * Scoped to this controller so other modules keep their current behaviour.
 */
const queryPipe = new ValidationPipe({
  transform: true,
  whitelist: true,
  forbidUnknownValues: false,
});

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  /**
   * Paginated catalogue. Every filter, sort and page boundary is applied in
   * MongoDB, so the client only receives the rows it renders.
   *
   * `?page=2&limit=12&subject=fiction&search=harry&sort=price_asc
   *  &minPrice=5&maxPrice=30&inStock=true`
   */
  @Get()
  findAll(@Query(queryPipe) query: QueryBooksDto) {
    return this.booksService.findAll(query);
  }

  /** Category tree with live book counts and a cover per category. */
  @Get('categories')
  getCategories() {
    return this.booksService.getCategories();
  }

  /** Everything the home page needs: newest books, best sellers, carousels, categories. */
  @Get('home')
  getHome() {
    return this.booksService.getHome();
  }

  /** Capped suggestions for the search box. Use `GET /api/books?search=` for full results. */
  @Get('search')
  search(@Query('title') title?: string, @Query('limit') limit?: string) {
    return this.booksService.searchSuggestions(title, limit ? Number(limit) : undefined);
  }

  @Get(':id')
  getBookById(@Param('id') id: string) {
    return this.booksService.getBookById(id);
  }

  @Post()
  @UseGuards(AdminGuard)
  addBook(@Body() dto: CreateBookDto) {
    return this.booksService.addBook(dto);
  }

  @Put(':id')
  @UseGuards(AdminGuard)
  updateBook(@Param('id') id: string, @Body() dto: UpdateBookDto) {
    return this.booksService.updateBook(id, dto);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  deleteBook(@Param('id') id: string) {
    return this.booksService.deleteBook(id);
  }
}
