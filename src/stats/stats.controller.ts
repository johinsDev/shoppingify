import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { StatsService } from './stats.service';

@Controller('stats')
@UseGuards(AuthGuard)
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('/top-categories')
  topCategories() {
    return this.statsService.topCategories();
  }

  @Get('/top-items')
  topItems() {
    return this.statsService.topItems();
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get('/quantity-by-month')
  stats() {
    return this.statsService.quantityByMonth();
  }
}
