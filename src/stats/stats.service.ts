import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize';
import { AuthService } from 'src/auth/auth.service';
import { Category } from 'src/categories/entities/category.model';
import { Item } from 'src/items/entities/item.model';
import { ShoppingListItem } from 'src/shopping-list-items/entities/shopping-list-item.model';
import { ShoppingList } from 'src/shopping-list/entities/shopping-list.model';
import { CreateStatDto } from './dto/create-stat.dto';
import { UpdateStatDto } from './dto/update-stat.dto';

@Injectable()
export class StatsService {
  constructor(
    @InjectModel(Category) private readonly category: typeof Category,
    private readonly auth: AuthService,
  ) {}

  create(createStatDto: CreateStatDto) {
    return 'This action adds a new stat';
  }

  // filter by year
  // top items
  // total per month
  findAll() {
    return this.category.findAll({
      where: {
        userId: this.auth.user.id,
      },
      attributes: [
        ['id', 'categoryId'],
        'name',
        [
          Sequelize.fn(
            'COALESCE',
            Sequelize.fn('sum', Sequelize.literal('quantity')),
            0,
          ),
          'total',
        ],
      ],
      group: ['categoryId'],
      include: {
        model: Item,
        attributes: [],
        include: [
          {
            model: ShoppingListItem,
            attributes: [],
            include: [
              {
                attributes: [],
                model: ShoppingList,
                where: {
                  userId: this.auth.user.id,
                },
              },
            ],
          },
        ],
      },
      limit: 3,
      subQuery: false,
      order: [[Sequelize.literal('"total"'), 'DESC']],
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} stat`;
  }

  update(id: number, updateStatDto: UpdateStatDto) {
    return `This action updates a #${id} stat`;
  }

  remove(id: number) {
    return `This action removes a #${id} stat`;
  }
}
