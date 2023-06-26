import { Module } from '@nestjs/common';
import {
  AuthenticateController,
  TaskController,
  UserController
} from './controllers';
import { AuthenticateService, TaskService, UserService } from './services';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskEntity, UserEntity } from './entities';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'babar.db.elephantsql.com',
      port: 5432,
      username: 'dbcipotg',
      password: '5v3WdURm8Gi5T3r5JAPETy_-4QwCQehC',
      database: 'dbcipotg',
      entities: ['dist/**/*.entity{.ts,.js}'],
      synchronize: true
    }),
    TypeOrmModule.forFeature([UserEntity, TaskEntity])
  ],
  controllers: [UserController, TaskController, AuthenticateController],
  providers: [UserService, TaskService, AuthenticateService]
})
export class AppModule {}
// TypeOrmModule.forRoot({
//   type: 'postgres',
//   host: 'localhost',
//   port: 5432,
//   username: 'postgres',
//   password: 'silfer',
//   database: 'postgres',
//   entities: ['dist/**/*.entity{.ts,.js}'],
//   synchronize: true
// }),
// TypeOrmModule.forRoot({
//   type: 'postgres',
//   host: 'babar.db.elephantsql.com',
//   port: 5432,
//   username: 'dbcipotg',
//   password: '5v3WdURm8Gi5T3r5JAPETy_-4QwCQehC',
//   database: 'dbcipotg',
//   entities: ['dist/**/*.entity{.ts,.js}'],
//   synchronize: true
// }),

// {
//   "type": "postgres",
//   "host": "babar.db.elephantsql.com",
//   "port": 5432,
//   "username": "dbcipotg",
//   "password": "5v3WdURm8Gi5T3r5JAPETy_-4QwCQehC",
//   "database": "dbcipotg",
//   "entities": ["dist/**/*.entity{.ts,.js}"],
//   "synchronize": true
// }
