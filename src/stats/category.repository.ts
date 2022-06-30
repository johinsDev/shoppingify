import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { DateTime } from 'luxon';
import { Op } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Category } from 'src/categories/entities/category.model';
import { Item } from 'src/items/entities/item.model';
import { ShoppingListItem } from 'src/shopping-list-items/entities/shopping-list-item.model';
import { ShoppingList } from 'src/shopping-list/entities/shopping-list.model';

export interface CategoryDto {
  categoryId: number;
  id: number;
  name: string;
  total: string;
}

@Injectable()
export class CategoryRepository {
  constructor(
    @InjectModel(Category) private readonly category: typeof Category,
  ) {}

  topThreeByYear(userId: number): Promise<CategoryDto[]> {
    const startDate = DateTime.now();

    const endDate = startDate.plus({ years: 1 });

    return this.category
      .findAll({
        where: {
          userId,
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
              where: Sequelize.where(
                Sequelize.fn(
                  'DATE_PART',
                  'year',
                  Sequelize.literal('"items->shoppingListItem"."created_at"'),
                ),
                Op.between,
                [startDate.get('year'), endDate.get('year')],
              ),
              include: [
                {
                  attributes: [],
                  model: ShoppingList,
                  where: {
                    userId,
                  },
                },
              ],
            },
          ],
        },
        limit: 3,
        subQuery: false,
        order: [[Sequelize.col('total'), 'DESC']],
      })
      .then((r) => {
        return r.map((c) => c.toJSON());
      });
  }
}
