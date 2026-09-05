import { Body, Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { FavoritesService } from './favorites.service';

@Controller('favorite')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post('toggle')
  @HttpCode(200)
  toggleFavorite(@CurrentUser() user: JwtPayload, @Body('bookId') bookId?: string) {
    return this.favoritesService.toggleFavorite(user.id, bookId);
  }

  @Get()
  getFavorites(@CurrentUser() user: JwtPayload) {
    return this.favoritesService.getFavoritesForUser(user.id);
  }
}
