import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';

import { TaskEntity, UserEntity } from 'src/entities';
import {
  AppError,
  BaseRes,
  TaskDeleteType,
  TaskPostType,
  TaskPutType
} from 'src/types';
import { AuthenticateService } from './authenticate.service';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(TaskEntity)
    private readonly taskRepository: Repository<TaskEntity>,
    private readonly authenticateService: AuthenticateService
  ) {}

  async findUser(refresh_token: string): Promise<UserEntity> {
    let user: UserEntity = {
      id: '',
      sinceDate: undefined,
      lastModified: undefined,
      userName: '',
      email: '',
      password: '',
      securityQuestions: [],
      refresh_token: ''
    };

    const getUser = await this.authenticateService.validateUser(refresh_token);

    user = getUser;

    return user;
  }

  async findAll(): Promise<TaskEntity[]> {
    const query = await this.taskRepository
      .createQueryBuilder('ts')
      .select([
        'ts.id',
        'ts.name',
        'ts.userId',
        'ts.description',
        'ts.checked',
        'ts.endDate',
        'ts.createdAt',
        'ts.updatedAt'
      ])
      .orderBy('ts.updatedAt', 'DESC')
      .getRawMany();

    return query;
  }

  async create(
    refresh_token: string,
    taskDto: TaskPostType
  ): Promise<TaskEntity | BaseRes> {
    const { checked, name, description, endDate } = taskDto;

    const user = await this.findUser(refresh_token);

    const task = new TaskEntity();

    task.name = name;
    task.userId = user.id;
    task.checked = checked;
    description ? (task.description = description) : null;
    endDate ? (task.endDate = endDate) : null;

    return this.taskRepository.save(task);
  }

  async getByUser(refresh_token: string): Promise<TaskEntity[]> {
    const { id } = await this.findUser(refresh_token);

    return await this.taskRepository.findBy({ userId: id });
  }

  async getById(id: string): Promise<TaskEntity> {
    return await this.taskRepository.findOne({ where: { id } });
  }

  async update(updateBody: TaskPutType): Promise<TaskEntity | BaseRes> {
    const { id, checked, description, endDate, name } = updateBody;

    const query = await this.taskRepository.findOneBy({ id: id });

    if (!query) {
      return {
        message: 'taskNotFound',
        statusCode: 404
      };
    }

    const task = new TaskEntity();

    task.name = name;
    task.userId = query.userId;
    task.checked = checked;
    description ? (task.description = description) : null;
    endDate ? (task.endDate = endDate) : null;

    const updated = await this.taskRepository.update({ id }, task);

    if (updated.affected) {
      return this.getById(id);
    }
  }

  async batchCreate(
    refresh_token: string,
    taskDtoArray: TaskPostType[]
  ): Promise<TaskEntity[] | BaseRes> {
    const user = await this.findUser(refresh_token);

    const taskArray = taskDtoArray.map((taskDto) => {
      const { checked, name, description, endDate } = taskDto;

      const task = new TaskEntity();

      task.name = name;
      task.userId = user.id;
      task.checked = checked;
      description ? (task.description = description) : null;
      endDate ? (task.endDate = endDate) : null;

      return task;
    });

    return this.taskRepository.save(taskArray);
  }

  async batchUpdate(
    taskDtoArray: TaskPutType[]
  ): Promise<TaskEntity[] | BaseRes | any> {
    taskDtoArray.map(async (body) => {
      const { id } = body;

      const databaseTask = await this.taskRepository.findOneBy({ id: id });

      if (!databaseTask) {
        return {
          message: 'taskNotFound',
          statusCode: 404
        };
      }

      const task = new TaskEntity();

      task.name = body.name ? body.name : databaseTask.name;
      task.userId = databaseTask.userId;
      task.checked = body.checked ? body.checked : databaseTask.checked;
      task.description = body.description
        ? body.description
        : databaseTask.description;
      task.endDate = body.endDate ? body.endDate : databaseTask.endDate;

      return await this.taskRepository.update({ id }, task);
    });
  }

  async delete(id: string): Promise<BaseRes> {
    const task = await this.taskRepository.findOneBy({ id: id });

    if (!task) {
      return {
        message: 'taskNotFound',
        statusCode: 404
      };
    }

    const query = await this.taskRepository.delete({ id });

    if (query.affected && query.affected > 0) {
      return {
        message: 'taskDeleted',
        statusCode: 200
      };
    }
  }

  async batchDelete(body: TaskDeleteType): Promise<BaseRes> {
    const tasks = body.ids.map(async (id) => {
      const task = await this.taskRepository.findOneBy({ id: id });

      return task;
    });

    const tasksArray = await Promise.all(tasks);

    const tasksNotFound = tasksArray.filter((task) => {
      return !task;
    });

    if (tasksNotFound.length > 0) {
      return {
        message: 'taskNotFound',
        statusCode: 404
      };
    }

    const query = await this.taskRepository.delete(body.ids);
    if (query.affected && query.affected > 0) {
      return {
        message: 'taskDeleted',
        statusCode: 200
      };
    }
  }

  async getByUserAndDate(
    refresh_token: string,
    activity_date: Date
  ): Promise<TaskEntity[] | BaseRes> {
    const { id } = await this.findUser(refresh_token);

    if (!activity_date) {
      return new AppError('missingDateField');
    }

    const newDate = new Date(activity_date);
    if (newDate.toString() === 'Invalid Date') {
      return new AppError('invalidDate');
    }

    return await this.taskRepository.find({
      where: { endDate: activity_date, userId: id }
    });
  }
}
