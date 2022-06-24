import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { AuthService } from 'src/auth/auth.service';
import { ItemDto } from 'src/shopping-list/dto/item.dto';
import { Item } from 'src/shopping-list/entities/item.model';
import { ShoppingList } from 'src/shopping-list/entities/shopping-list.model';
import { CreateShoppingListItemDto } from './dto/create-shopping-list-item.dto';
import { UpdateShoppingListItemDto } from './dto/update-shopping-list-item.dto';
import { ShoppingListItem } from './entities/shopping-list-item.model';

@Injectable()
export class ShoppingListItemsService {
  constructor(
    @InjectModel(ShoppingListItem)
    private readonly shoppingListItem: typeof ShoppingListItem,
    @InjectModel(ShoppingList)
    private readonly shoppingList: typeof ShoppingList,
    @InjectModel(Item) private readonly item: typeof Item,
    private readonly auth: AuthService,
  ) {}

  private itemAndShoppingList(id: number, shoppingListId: number) {
    return Promise.all([
      this.shoppingList.findByPk(shoppingListId, {
        attributes: ['name', 'userId', 'id', 'cancelledAt', 'completedAt'],
      }),
      this.item.findByPk(id, {
        attributes: ['note', 'image', 'name', 'id', 'userId'],
      }),
    ]);
  }

  // Repository function
  private async shoppingListItemByListAndItem(
    shoppingList: ShoppingList,
    item: Item,
  ) {
    const shoppingListItem = await this.shoppingListItem.findOne({
      where: {
        shoppingListId: shoppingList.id,
        itemId: item.id,
      },
    });

    return shoppingListItem;
  }

  private validate(shoppingList: ShoppingList, item: Item) {
    if (!shoppingList) throw new NotFoundException('Shopping list not found');

    if (shoppingList.userId !== this.auth.user.id)
      throw new ForbiddenException('You dont have access to this list');

    if (!!shoppingList.completedAt || !!shoppingList.cancelledAt)
      throw new BadRequestException(
        "You cannot list an item to a list if its status is not 'active'",
      );

    if (!item) throw new NotFoundException('Item not found');

    if (item.userId !== this.auth.user.id)
      throw new ForbiddenException('You dont have access to this item');
  }

  private itemDTO(item: Item, shoppingListItem: ShoppingListItem) {
    return new ItemDto({ ...item.toJSON(), ...shoppingListItem.toJSON() });
  }

  async create(
    id: number,
    shoppingListId: number,
    createShoppingListItemDto: CreateShoppingListItemDto,
  ) {
    const [shoppingList, item] = await this.itemAndShoppingList(
      id,
      shoppingListId,
    );

    this.validate(shoppingList, item);

    let shoppingListItem = await this.shoppingListItemByListAndItem(
      shoppingList,
      item,
    );

    if (shoppingListItem) throw new BadRequestException('Item already added');

    shoppingListItem = await this.shoppingListItem.create({
      quantity: createShoppingListItemDto.quantity,
      shoppingListId: shoppingList.id,
      itemId: item.id,
    });

    return this.itemDTO(item, shoppingListItem);
  }

  async findOne(id: number, shoppingListId: number) {
    const [shoppingList, item] = await this.itemAndShoppingList(
      id,
      shoppingListId,
    );

    this.validate(shoppingList, item);

    const shoppingListItem = await this.shoppingListItemByListAndItem(
      shoppingList,
      item,
    );

    if (!shoppingListItem) throw new NotFoundException('Item not found');

    return this.itemDTO(item, shoppingListItem);
  }

  async update(
    id: number,
    shoppingListId: number,
    updateShoppingListItemDto: UpdateShoppingListItemDto,
  ) {
    const [shoppingList, item] = await this.itemAndShoppingList(
      id,
      shoppingListId,
    );

    this.validate(shoppingList, item);

    const shoppingListItem = await this.shoppingListItemByListAndItem(
      shoppingList,
      item,
    );

    if (!shoppingListItem) throw new NotFoundException('Item not found');

    if (updateShoppingListItemDto.quantity === 0) {
      await shoppingListItem.destroy({
        force: true,
      });
    } else {
      await shoppingListItem.update({
        quantity: updateShoppingListItemDto.quantity,
        done: updateShoppingListItemDto.done,
      });
    }

    return this.itemDTO(item, shoppingListItem);
  }

  async remove(id: number, shoppingListId: number) {
    const [shoppingList, item] = await this.itemAndShoppingList(
      id,
      shoppingListId,
    );

    this.validate(shoppingList, item);

    const shoppingListItem = await this.shoppingListItemByListAndItem(
      shoppingList,
      item,
    );

    if (!shoppingListItem) throw new NotFoundException('Item not found');

    await shoppingListItem.destroy({
      force: true,
    });

    return this.itemDTO(item, shoppingListItem);
  }
}
