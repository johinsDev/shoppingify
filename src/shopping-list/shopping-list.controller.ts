import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { CreateShoppingListDto } from './dto/create-shopping-list.dto';
import { ShoppingListFiltersDto } from './dto/shopping-list-filters.dto';
import { UpdateShoppingListDto } from './dto/update-shopping-list.dto';
import { ShoppingListService } from './shopping-list.service';

@UseGuards(AuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('shopping-lists')
export class ShoppingListController {
  constructor(private readonly shoppingListService: ShoppingListService) {}

  @Post()
  create(@Body() createShoppingListDto: CreateShoppingListDto) {
    return this.shoppingListService.create(createShoppingListDto);
  }

  @Get()
  findAll(@Query() params: ShoppingListFiltersDto) {
    return this.shoppingListService.findAll(params);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.shoppingListService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateShoppingListDto: UpdateShoppingListDto,
  ) {
    return this.shoppingListService.update(+id, updateShoppingListDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.shoppingListService.remove(+id);
  }
}
