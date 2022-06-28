import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { CreateShoppingListItemDto } from './dto/create-shopping-list-item.dto';
import { UpdateShoppingListItemDto } from './dto/update-shopping-list-item.dto';
import { ShoppingListItemsService } from './shopping-list-items.service';

@UseGuards(AuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('shopping-lists/:shoppingListId/items')
export class ShoppingListItemsController {
  constructor(
    private readonly shoppingListItemsService: ShoppingListItemsService,
  ) {}

  @Post(':id')
  create(
    @Param('id', ParseIntPipe) id: number,
    @Param('shoppingListId', ParseIntPipe) shoppingListId: number,
    @Body() createShoppingListItemDto: CreateShoppingListItemDto,
  ) {
    return this.shoppingListItemsService.create(
      id,
      shoppingListId,
      createShoppingListItemDto,
    );
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Param('shoppingListId', ParseIntPipe) shoppingListId: number,
    @Body() updateShoppingListItemDto: UpdateShoppingListItemDto,
  ) {
    return this.shoppingListItemsService.update(
      id,
      shoppingListId,
      updateShoppingListItemDto,
    );
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Param('shoppingListId', ParseIntPipe) shoppingListId: number,
  ) {
    return this.shoppingListItemsService.remove(id, shoppingListId);
  }
}
