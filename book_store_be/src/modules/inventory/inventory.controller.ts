import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AdminGuard } from '../../common/guards/admin.guard';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import {
  AdjustStockDto,
  QueryMovementsDto,
  QueryStockDto,
} from './dto/inventory.dto';
import { InventoryService } from './inventory.service';

@Controller('inventory')
@UseGuards(AdminGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('summary')
  getSummary() {
    return this.inventoryService.getSummary();
  }

  @Get('stock')
  listStock(@Query() query: QueryStockDto) {
    return this.inventoryService.listStock(query);
  }

  @Get('movements')
  listMovements(@Query() query: QueryMovementsDto) {
    return this.inventoryService.listMovements(query);
  }

  @Post(':bookId/adjust')
  adjust(
    @CurrentUser() user: JwtPayload,
    @Param('bookId') bookId: string,
    @Body() dto: AdjustStockDto,
  ) {
    return this.inventoryService.adjust(bookId, dto, user.id);
  }
}
