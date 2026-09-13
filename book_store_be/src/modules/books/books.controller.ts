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
} from '@nestjs/common';
import { AdminGuard } from '../../common/guards/admin.guard';
import { BooksService } from './books.service';
import { CreateBookDto, UpdateBookDto } from './dto/book.dto';
import { QueryBooksDto } from './dto/query-books.dto';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get()
  findAll(@Query() query: QueryBooksDto) {
    return this.booksService.findAll(query);
  }

  @Get('categories')
  getCategories() {
    return this.booksService.getCategories();
  }

  @Get('home')
  getHome() {
    return this.booksService.getHome();
  }

  @Get('search')
  search(@Query('title') title?: string, @Query('limit') limit?: string) {
    return this.booksService.searchSuggestions(
      title,
      limit ? Number(limit) : undefined,
    );
  }

  // Keep last: it also matches /categories, /home and /search.
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
