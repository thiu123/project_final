import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../../common/guards/admin.guard';
import { BooksService } from './books.service';
import { CreateBookDto, UpdateBookDto } from './dto/book.dto';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get()
  getAllBooks(@Query('subject') subject?: string) {
    return this.booksService.getAllBooks(subject);
  }

  @Get('home')
  homeBooks() {
    return this.booksService.homeBooks();
  }

  @Get('search')
  searchBooksByTitle(@Query('title') title?: string) {
    return this.booksService.searchBooksByTitle(title);
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
