import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Transform } from 'class-transformer';
import { DateTime } from 'luxon';
import { Attributes, FindOptions, Op } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Item } from 'src/items/entities/item.model';
import { ShoppingListItem } from 'src/shopping-list-items/entities/shopping-list-item.model';
import { ShoppingList } from 'src/shopping-list/entities/shopping-list.model';

export interface ItemDto {
  categoryId: number;
  name: string;
  total: string;
  id: number;
}

export class TotalByMonth {
  month: number;

  @Transform(({ value }) => parseInt(value ?? '0', 10))
  total: number;

  constructor(partial: Partial<TotalByMonth>) {
    Object.assign(this, partial);
  }
}

@Injectable()
export class ItemRepository {
  constructor(@InjectModel(Item) private readonly item: typeof Item) {}

  private defaultQuery(userId: number): FindOptions<Attributes<Item>> {
    const startDate = DateTime.now();

    const endDate = startDate.plus({ years: 1 });

    return {
      where: {
        userId,
      },
      attributes: [
        [
          Sequelize.fn(
            'COALESCE',
            Sequelize.fn('sum', Sequelize.literal('quantity')),
            0,
          ),
          'total',
        ],
      ],
      include: {
        model: ShoppingListItem,
        attributes: [],
        where: Sequelize.where(
          Sequelize.fn(
            'DATE_PART',
            'year',
            Sequelize.literal('"shoppingListItem"."created_at"'),
          ),
          Op.between,
          [startDate.get('year'), endDate.get('year')],
        ),
        include: [
          {
            attributes: [],
            model: ShoppingList,
          },
        ],
      },
      subQuery: false,
      order: [[Sequelize.col('total'), 'DESC']],
    };
  }

  quantityByYear(userId: number): Promise<TotalByMonth[]> {
    return this.item
      .findAll({
        ...this.defaultQuery(userId),
        attributes: [
          [
            Sequelize.fn(
              'DATE_PART',
              'month',
              Sequelize.literal('"shoppingListItem"."created_at"'),
            ),
            'month',
          ],
          [
            Sequelize.fn(
              'COALESCE',
              Sequelize.fn('sum', Sequelize.literal('quantity')),
              0,
            ),
            'total',
          ],
        ],
        group: ['month'],
        raw: true,
      })
      .then((r) => {
        return r.map((m) => new TotalByMonth(m as unknown));
      });
  }

  topThreeByYear(userId: number): Promise<ItemDto[]> {
    return this.item
      .findAll({
        ...this.defaultQuery(userId),
        limit: 3,
        group: ['"Item"."id"'],
      })
      .then((r) => {
        return r.map((c) => c.toJSON());
      });
  }
}
