import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  AuthenticateController,
  QuestionController,
  TaskController,
  UserController
} from './controllers';
import {
  AuthenticateService,
  QuestionService,
  TaskService,
  UserService
} from './services';
import { QuestionEntity, TaskEntity, UserEntity } from './entities';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: process.env.DB_PORT as unknown as number,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: ['dist/**/*.entity{.ts,.js}'],
      synchronize: true
    }),

    TypeOrmModule.forFeature([UserEntity, TaskEntity, QuestionEntity])
  ],

  controllers: [
    UserController,
    TaskController,
    AuthenticateController,
    QuestionController
  ],

  providers: [UserService, TaskService, AuthenticateService, QuestionService]
})
export class AppModule {}
