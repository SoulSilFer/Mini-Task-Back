import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

import { UserEntity } from 'src/entities';
import { AppError } from 'src/types';
import { UserPostType } from 'src/types/user';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>
  ) {}

  async findAll(): Promise<UserEntity[]> {
    return this.userRepository.find();
  }

  async create(createUserDto: UserPostType): Promise<any> {
    const { securityQuestions, userName, email, password } = createUserDto;

    const userWithThisEmail = await this.userRepository.findOne({
      where: { email }
    });

    if (userWithThisEmail) {
      throw new AppError('emailAlreadyInUse');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const answerOne = await bcrypt.hash(securityQuestions[0].answer, 10);

    securityQuestions[0].answer = answerOne;

    const arrayLiteral = JSON.stringify(securityQuestions);
    const formattedLiteral = arrayLiteral.replace(/"/g, "'");

    const user = new UserEntity();

    user.userName = userName;
    user.email = email;
    user.password = passwordHash;
    user.securityQuestions = formattedLiteral as any;

    const create = this.userRepository.create(user);
    return this.userRepository.save(create);
  }
}
