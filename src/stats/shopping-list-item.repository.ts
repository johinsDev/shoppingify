import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { ShoppingListItem } from 'src/shopping-list-items/entities/shopping-list-item.model';
import { ShoppingList } from 'src/shopping-list/entities/shopping-list.model';

@Injectable()
export class ShoppingListItemRepository {
  constructor(
    @InjectModel(ShoppingListItem)
    private readonly shoppingListItem: typeof ShoppingListItem,
  ) {}

  totalQuantityByYear(userId: number): Promise<string> {
    return this.shoppingListItem
      .findAll({
        include: {
          model: ShoppingList,
          attributes: [],
          where: {
            userId,
          },
        },
        attributes: [
          [
            Sequelize.fn(
              'DATE_PART',
              'year',
              Sequelize.col('ShoppingListItem.created_at'),
            ),
            'date',
          ],
          [
            Sequelize.fn(
              'COALESCE',
              Sequelize.fn('sum', Sequelize.col('quantity')),
              0,
            ),
            'total',
          ],
        ],
        group: ['date'],
      })
      .then((result) => {
        return result?.[0]?.toJSON?.()?.total ?? '0';
      });
  }
}
