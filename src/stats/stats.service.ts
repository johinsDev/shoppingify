import { Injectable } from '@nestjs/common';
import { Info } from 'luxon';
import { AuthService } from 'src/auth/auth.service';
import { CategoryRepository } from './category.repository';
import { ItemRepository } from './item.repository';
import { ShoppingListItemRepository } from './shopping-list-item.repository';

@Injectable()
export class StatsService {
  constructor(
    private readonly shoppingListItem: ShoppingListItemRepository,
    private readonly category: CategoryRepository,
    private readonly item: ItemRepository,
    private readonly auth: AuthService,
  ) {}

  private transform(total: string) {
    return (data: any) => {
      return {
        id: data.id,
        name: data.name,
        quantity: Number(data.total),
        percent: Number(
          ((parseInt(data.total, 10) / parseInt(total, 10)) * 100).toFixed(2),
        ),
      };
    };
  }

  async topItems() {
    const [total, items] = await Promise.all([
      this.shoppingListItem.totalQuantityByYear(this.auth.user.id),
      this.item.topThreeByYear(this.auth.user.id),
    ]);

    return items.map(this.transform(total));
  }

  async quantityByMonth() {
    const quantitiesByMonth = await this.item.quantityByYear(this.auth.user.id);

    return Info.months().map((monthName, index) => {
      console.log(quantitiesByMonth);

      return {
        name: monthName,
        total: Number(
          quantitiesByMonth.find((month) => month.month === index + 1)?.total ??
            0,
        ),
        month: index,
      };
    });
  }

  async topCategories() {
    const [total, categories] = await Promise.all([
      this.shoppingListItem.totalQuantityByYear(this.auth.user.id),
      this.category.topThreeByYear(this.auth.user.id),
    ]);

    return categories.map(this.transform(total));
  }
}
