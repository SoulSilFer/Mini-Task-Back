import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import * as yup from 'yup';

import { UserEntity } from 'src/entities';
import { UserService } from 'src/services';
import { GetUserByEmailType, UserPostType } from 'src/types/user';
import { AppError, PRE_ERRORS } from 'src/types';
import { ResetPasswordPostType } from 'src/types/user/reset.password.type';

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
            id: yup.string().required(),
            answer: yup.string().required()
          })
        )
        .min(3)
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

  @Get(':email')
  getByEmail(@Param('email') email: string): Promise<GetUserByEmailType> {
    return this.userService.getByEmail(email);
  }

  @Post('reset-password')
  async resetPassword(
    @Body() resetPasswordBody: ResetPasswordPostType
  ): Promise<any> {
    const schema = yup.object().shape({
      newPassword: yup.string().min(8).required(),
      email: yup.string().email().required(),
      securityQuestions: yup
        .array()
        .of(
          yup.object().shape({
            id: yup.string().required(),
            answer: yup.string().required()
          })
        )
        .min(1)
        .max(3)
    });

    try {
      schema.validateSync(resetPasswordBody);
    } catch (error) {
      throw new AppError(error.errors);
    }

    try {
      await this.userService.resetPassword(resetPasswordBody);

      return {
        statusCode: 200,
        message: 'Password updated successfully.'
      };
    } catch (error) {
      if (error.message === PRE_ERRORS.invalidCredentials) {
        throw new AppError(PRE_ERRORS.invalidCredentials);
      }

      throw new AppError(error);
    }
  }
}
