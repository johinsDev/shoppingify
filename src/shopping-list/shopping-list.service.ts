import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { DateTime } from 'luxon';
import { Attributes, Op } from 'sequelize';
import { WhereOptions } from 'sequelize/types';
import { AuthService } from 'src/auth/auth.service';
import { CreateShoppingListDto } from './dto/create-shopping-list.dto';
import {
  ShoppingListFiltersDto,
  ShoppingListFilterStatus,
} from './dto/shopping-list-filters.dto';
import { ShoppingListDto } from './dto/shopping-list.dto';
import { UpdateShoppingListDto } from './dto/update-shopping-list.dto';
import { Item } from './entities/item.model';
import { ShoppingList } from './entities/shopping-list.model';

@Injectable()
export class ShoppingListService {
  constructor(
    @InjectModel(ShoppingList)
    private readonly shoppingList: typeof ShoppingList,
    private readonly authService: AuthService,
  ) {}

  async create(createShoppingListDto: CreateShoppingListDto) {
    const shoppingList = await this.shoppingList.create({
      name: createShoppingListDto.name,
      userId: this.authService.user.id,
    });

    return new ShoppingListDto(shoppingList);
  }

  async findAll({
    page = 1,
    perPage = 10,
    status = ShoppingListFilterStatus.active,
  }: ShoppingListFiltersDto) {
    page = Math.max(page, 1);

    perPage = Math.max(perPage, 1);

    const total = await this.shoppingList.count({
      where: {
        userId: this.authService.user.id,
      },
    });

    page = Math.min(total, page);

    let where: WhereOptions<Attributes<ShoppingList>> = {
      userId: this.authService.user.id,
    };

    switch (status) {
      case ShoppingListFilterStatus.active:
        where = {
          ...where,
          completedAt: null,
          cancelledAt: null,
        };
        break;
      case ShoppingListFilterStatus.cancelled:
        where = {
          ...where,
          cancelledAt: {
            [Op.not]: null,
          },
        };
        break;
      case ShoppingListFilterStatus.completed:
        where = {
          ...where,
          completedAt: {
            [Op.not]: null,
          },
        };
        break;
    }

    const shoppingList = await this.shoppingList.findAll({
      where,
      limit: perPage,
      offset: (page - 1) * perPage,
      attributes: ['id', 'name'],
      include: [
        {
          model: Item,
          attributes: ['name', 'note', 'image'],
        },
      ],
    });

    return shoppingList.map((s) => new ShoppingListDto(s));
  }

  findOne(id: number) {
    return `This action returns a #${id} shoppingList`;
  }

  async update(id: number, updateShoppingListDto: UpdateShoppingListDto) {
    const shoppingList = await this.shoppingList.findByPk(id);

    if (!shoppingList) throw new NotFoundException('Shopping list not found');

    if (shoppingList.userId !== this.authService.user.id)
      throw new ForbiddenException('You dont have access to this list');

    switch (updateShoppingListDto.status) {
      case ShoppingListFilterStatus.cancelled:
        shoppingList.cancelledAt = DateTime.now().toJSDate();
        shoppingList.completedAt = null;
        break;
      case ShoppingListFilterStatus.completed:
        shoppingList.cancelledAt = null;
        shoppingList.completedAt = DateTime.now().toJSDate();
        break;
      case ShoppingListFilterStatus.active:
        shoppingList.cancelledAt = null;
        shoppingList.completedAt = null;
        break;
      default:
        break;
    }

    await shoppingList.update({
      name: updateShoppingListDto.name,
      ...shoppingList,
    });

    return new ShoppingListDto(shoppingList);
  }

  async remove(id: number) {
    const shoppingList = await this.shoppingList.findByPk(id);

    if (!shoppingList) throw new NotFoundException('Shopping list not found');

    if (shoppingList.userId !== this.authService.user.id)
      throw new ForbiddenException('You dont have access to this list');

    await shoppingList.destroy();
    return new ShoppingListDto(shoppingList);
  }
}
