import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { AuthService } from 'src/auth/auth.service';
import { Item } from 'src/items/entities/item.model';
import { PaginationDto, PaginationMetaDto } from 'src/shared/pagination.dto';
import { ShoppingListItem } from 'src/shopping-list-items/entities/shopping-list-item.model';
import { ShoppingList } from 'src/shopping-list/entities/shopping-list.model';
import { CategoryDto } from './dto/category.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Category } from './entities/category.model';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category) private readonly category: typeof Category,
    private readonly auth: AuthService,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const category = await this.category.create({
      name: createCategoryDto.name,
      userId: this.auth.user.id,
    });

    return new CategoryDto(category.toJSON());
  }

  async findAll({ page, perPage }: PaginationDto) {
    const { data: categories, meta } = await this.category
      .where({
        where: {
          userId: this.auth.user.id,
        },
        include: [
          {
            model: Item,
            limit: 15,
            include: [
              {
                model: ShoppingListItem,
                include: [
                  {
                    model: ShoppingList,
                    where: {
                      userId: this.auth.user.id,
                      completedAt: null,
                      cancelledAt: null,
                    },
                  },
                ],
              },
            ],
          },
        ],
        subQuery: false,
      })
      .paginate(page, perPage);

    return new PaginationMetaDto({
      data: categories.map((i) => {
        return new CategoryDto(i.toJSON());
      }),
      meta,
    });
  }
}
