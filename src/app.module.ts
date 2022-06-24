import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ShoppingListModule } from './shopping-list/shopping-list.module';
import { ShoppingListItemsModule } from './shopping-list-items/shopping-list-items.module';
import app from './config/app';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [app],
    }),
    SequelizeModule.forRootAsync({
      useFactory() {
        return {
          dialect: 'postgres',
          host: 'database',
          port: 5432,
          username: 'shoppingify',
          password: 'shoppingify',
          database: 'shoppingify',
          models: [],
          logging: true,
          autoLoadModels: true,
          sync: {
            force: false,
            alter: true,
          },
        };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    ShoppingListModule,
    ShoppingListItemsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
