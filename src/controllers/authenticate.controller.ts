import { Controller, Post, Body } from '@nestjs/common';
import * as yup from 'yup';

import { AuthenticateService } from 'src/services';
import {
  AppError,
  AuthenticateTypePost,
  AuthenticateTypePostSuccess,
  BaseRes,
  RefreshTokenPostType
} from 'src/types';
import { UserEntity } from 'src/entities';

@Controller('authenticate')
export class AuthenticateController {
  constructor(private readonly authenticateService: AuthenticateService) {}

  @Post()
  async authenticate(
    @Body() credentials: AuthenticateTypePost
  ): Promise<AuthenticateTypePostSuccess> {
    const schema = yup.object().shape({
      password: yup.string().required(),
      email: yup.string().email().required()
    });

    try {
      schema.validateSync(credentials);
    } catch (_error) {
      throw new AppError('Nickname/email or password is incorrect.', 401);
    }

    try {
      const { access_token, refresh_token, userName, email, id } =
        await this.authenticateService.authenticate(credentials);

      return {
        access_token,
        refresh_token,
        email: email,
        userName: userName,
        id: id
      };
    } catch (error) {
      throw new AppError('Nickname/email or password is incorrect.', 401);
    }
  }

  @Post('refresh-token')
  async refreshToken(@Body() body: RefreshTokenPostType): Promise<BaseRes> {
    const { refresh_token } = body;

    try {
      const { access_token, refresh_token: new_refresh_token } =
        await this.authenticateService.refreshToken(refresh_token);

      return {
        message:
          'Refresh token generated successfully. Use this token to generate a new access token.',
        statusCode: 200,
        description: {
          access_token,
          refresh_token: new_refresh_token
        }
      };
    } catch (error) {
      throw new AppError(error);
    }
  }
}
