import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../../common/guards/admin.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  ApplyVoucherDto,
  CreateVoucherDto,
  UpdateVoucherDto,
  ValidateVoucherDto,
} from './dto/voucher.dto';
import { VouchersService } from './vouchers.service';

@Controller('voucher')
export class VouchersController {
  constructor(private readonly vouchersService: VouchersService) {}

  @Post('validate')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  validateVoucher(@Body() dto: ValidateVoucherDto) {
    return this.vouchersService.validateVoucher(dto);
  }

  @Post('apply')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  applyVoucher(@Body() dto: ApplyVoucherDto) {
    return this.vouchersService.applyVoucher(dto);
  }

  @Get('all')
  getAllVouchers(@Query('activeOnly') activeOnly?: string) {
    return this.vouchersService.getAllVouchers(activeOnly);
  }

  @Post()
  @UseGuards(AdminGuard)
  createVoucher(@Body() dto: CreateVoucherDto) {
    return this.vouchersService.createVoucher(dto);
  }

  @Put(':id')
  @UseGuards(AdminGuard)
  updateVoucher(@Param('id') id: string, @Body() dto: UpdateVoucherDto) {
    return this.vouchersService.updateVoucher(id, dto);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  deleteVoucher(@Param('id') id: string) {
    return this.vouchersService.deleteVoucher(id);
  }
}
