import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { AuthService } from 'src/auth/auth.service';
import { Category } from 'src/categories/entities/category.model';
import { PaginationMetaDto } from 'src/shared/pagination.dto';
import { ShoppingListItem } from 'src/shopping-list-items/entities/shopping-list-item.model';
import { ShoppingList } from 'src/shopping-list/entities/shopping-list.model';
import { CreateItemDto } from './dto/create-item.dto';
import { ItemFiltersDto } from './dto/item-filters.dto';
import { ItemDto } from './dto/item.dto';
import { Item } from './entities/item.model';

@Injectable()
export class ItemsService {
  constructor(
    @InjectModel(Item) private readonly item: typeof Item,
    @InjectModel(Category) private readonly category: typeof Category,
    private readonly auth: AuthService,
  ) {}

  async create(createItemDto: CreateItemDto) {
    const category = await this.category.findByPk(createItemDto.categoryId);

    if (!category) throw new NotFoundException('Category not found');

    if (category.userId !== this.auth.user.id)
      throw new UnauthorizedException('Ypu dont have access to this category');

    const item = await this.item.create({
      name: createItemDto.name,
      note: createItemDto.note,
      image: createItemDto.image,
      categoryId: createItemDto.categoryId,
      userId: this.auth.user.id,
    });

    return new ItemDto(item.toJSON());
  }

  async findAll({
    page = 1,
    perPage = 10,
    categoryId,
    inCart,
  }: ItemFiltersDto) {
    const { data: items, meta } = await this.item
      .where({
        where: {
          userId: this.auth.user.id,
          ...(categoryId && { categoryId }),
        },
        include: {
          model: ShoppingListItem,
          ...(inCart && { required: true }),
          include: [
            {
              model: ShoppingList,
              ...(inCart && { required: true }),
              where: {
                userId: this.auth.user.id,
                completedAt: null,
                cancelledAt: null,
              },
            },
          ],
        },
      })
      .paginate(page, perPage);

    return new PaginationMetaDto({
      data: items.map((i) => {
        return new ItemDto(i.toJSON());
      }),
      meta,
    });
  }
}
