import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Headers
} from '@nestjs/common';

import { TaskEntity } from 'src/entities';
import { TaskService } from 'src/services';
import { BaseRes, TaskDeleteType, TaskPostType, TaskPutType } from 'src/types';

@Controller('task')
export class TaskController {
  constructor(private readonly taskRepository: TaskService) {}

  @Get()
  findAll(): Promise<TaskEntity[]> {
    return this.taskRepository.findAll();
  }

  @Post()
  create(
    @Headers('refresh_token') refresh_token: string,
    @Body() taskDto: TaskPostType
  ): Promise<TaskEntity | BaseRes> {
    return this.taskRepository.create(refresh_token, taskDto);
  }

  @Get('/user')
  getByUser(
    @Headers('refresh_token') refresh_token: string
  ): Promise<TaskEntity[]> {
    return this.taskRepository.getByUser(refresh_token);
  }

  @Get(':id')
  getById(@Param('id') id: string): Promise<TaskEntity> {
    return this.taskRepository.getById(id);
  }

  @Put()
  update(@Body() taskDto: TaskPutType): Promise<TaskEntity | BaseRes> {
    return this.taskRepository.update(taskDto);
  }

  @Post('batch-create')
  batchCreate(
    @Headers('refresh_token') refresh_token: string,
    @Body() taskDto: TaskPostType[]
  ): Promise<TaskEntity[] | BaseRes> {
    return this.taskRepository.batchCreate(refresh_token, taskDto);
  }

  @Put('batch-update')
  batchUpdate(@Body() taskDto: TaskPutType[]): Promise<TaskEntity[] | BaseRes> {
    return this.taskRepository.batchUpdate(taskDto);
  }

  @Delete(':id')
  delete(@Param('id') id: string): Promise<BaseRes> {
    return this.taskRepository.delete(id);
  }

  @Post('batch-delete')
  batchDelete(@Body() body: TaskDeleteType): Promise<BaseRes> {
    return this.taskRepository.batchDelete(body);
  }

  @Get('/user/date')
  getByUserAndDate(
    @Headers('refresh_token') refresh_token: string,
    @Headers('activity_date') activity_date: Date
  ): Promise<TaskEntity[] | BaseRes> {
    return this.taskRepository.getByUserAndDate(refresh_token, activity_date);
  }
}
