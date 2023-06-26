import { Controller, Get, Post, Body } from '@nestjs/common';
import * as yup from 'yup';

import { UserEntity } from 'src/entities';
import { UserService } from 'src/services';
import { UserPostType } from 'src/types/user';
import { AppError } from 'src/types';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  findAll(): Promise<UserEntity[]> {
    return this.userService.findAll();
  }

  @Post()
  async create(@Body() createUserDto: UserPostType): Promise<any> {
    const { email, password, securityQuestions, userName } = createUserDto;

    const schema = yup.object().shape({
      userName: yup.string().max(25).required(),
      password: yup.string().min(8).required(),
      email: yup.string().email().required(),
      securityQuestions: yup
        .array()
        .of(
          yup.object().shape({
            question: yup.string().required(),
            answer: yup.string().required()
          })
        )
        .min(1)
        .max(3)
    });

    try {
      schema.validateSync(createUserDto);
    } catch (error) {
      throw new AppError(error.errors);
    }

    try {
      const user = await this.userService.create({
        email,
        password,
        securityQuestions,
        userName
      });

      return {
        statusCode: 201,
        message: 'User created successfully.',
        description: {
          id: user.id,
          userName: user.userName,
          email: user.email
        }
      };
    } catch (error) {
      if (error.message === 'emailAlreadyInUse') {
        throw new AppError('emailAlreadyInUse');
      }

      throw new AppError(error);
    }
  }
}
