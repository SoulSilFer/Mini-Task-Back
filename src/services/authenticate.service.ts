import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';

import { UserEntity } from 'src/entities';
import {
  AppError,
  AuthenticateTypePost,
  AuthenticateTypePostSuccess
} from 'src/types';

interface RefreshToken {
  id: string;
  jwtid: string;
}

@Injectable()
export class AuthenticateService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>
  ) {}

  private generateAccessToken(userId: string) {
    return jwt.sign(
      {
        id: userId,
        typ: 'access'
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: '5m'
      }
    );
  }

  private generateRefreshToken(userId: string, refreshTokenId: string) {
    return jwt.sign(
      {
        id: userId,
        typ: 'refresh',
        jwtid: refreshTokenId
      },
      process.env.JWT_SECRET as string
    );
  }

  async authenticate(
    credentials: AuthenticateTypePost
  ): Promise<AuthenticateTypePostSuccess> {
    const { email, password } = credentials;

    const user = await this.userRepository.findOne({ where: { email: email } });

    if (!user) {
      throw new AppError('Nickname/email or password is incorrect.', 401);
    }

    const passwordIsValid = await bcrypt.compare(password, user.password);

    if (!passwordIsValid) {
      throw new AppError('Nickname/email or password is incorrect.', 401);
    }

    const access_token = this.generateAccessToken(user.id);

    const refreshTokenId = uuid();
    const refresh_token = this.generateRefreshToken(user.id, refreshTokenId);

    user.refresh_token = refreshTokenId;

    await this.userRepository.save(user);

    return {
      access_token,
      refresh_token,
      email: user.email,
      userName: user.userName,
      id: user.id
    };
  }

  async refreshToken(refresh_token: string) {
    let decodedToken: RefreshToken;

    try {
      decodedToken = jwt.verify(
        refresh_token,
        process.env.JWT_SECRET as string
      ) as RefreshToken;
    } catch (error) {
      throw new AppError('Invalid refresh_token.');
    }

    const user = await this.userRepository.findOne({
      where: { id: decodedToken.id }
    });

    if (!user) {
      throw new AppError('Invalid refresh_token.');
    }

    if (user.refresh_token !== decodedToken.jwtid) {
      throw new AppError('Invalid refresh_token.');
    }

    const access_token = this.generateAccessToken(user.id);

    const refreshTokenId = uuid();
    const new_refresh_token = this.generateRefreshToken(
      user.id,
      refreshTokenId
    );

    user.refresh_token = refreshTokenId;

    await this.userRepository.save(user);

    return {
      refresh_token: new_refresh_token,
      access_token
    };
  }

  async validateUser(refresh_token: string) {
    let decodedToken: RefreshToken;

    try {
      decodedToken = jwt.verify(
        refresh_token,
        process.env.JWT_SECRET as string
      ) as RefreshToken;
    } catch (error) {
      throw new AppError('InvalidRefresh_token');
    }

    const user = await this.userRepository.findOne({
      where: { id: decodedToken.id }
    });

    if (!user) {
      throw new AppError('InvalidRefresh_token');
    }

    if (user.refresh_token !== decodedToken.jwtid) {
      throw new AppError('InvalidRefresh_token');
    }

    return user;
  }
}
