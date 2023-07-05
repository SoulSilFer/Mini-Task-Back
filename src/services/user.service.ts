import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

import { UserEntity } from 'src/entities';
import { AppError, PRE_ERRORS } from 'src/types';
import {
  GetUserByEmailType,
  UserPostType,
  UserSecurityQuestions
} from 'src/types/user';
import { ResetPasswordPostType } from 'src/types/user/reset.password.type';

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

    let formatedQuestions: UserSecurityQuestions[] = [];

    const formatAnswers = async () => {
      for (let i = 0; i < securityQuestions.length; i++) {
        const answer = await bcrypt.hash(
          securityQuestions[i].answer.toLowerCase(),
          10
        );

        const formatedQuestion = {
          id: securityQuestions[i].id,
          answer
        };

        formatedQuestions.push(formatedQuestion);
      }

      return formatedQuestions;
    };

    const formatedAnswers = await formatAnswers();

    const arrayLiteral = JSON.stringify(formatedAnswers);
    const formattedLiteral = arrayLiteral.replace(/"/g, "'");

    const user = new UserEntity();

    user.userName = userName;
    user.email = email;
    user.password = passwordHash;
    user.securityQuestions = formattedLiteral as any;

    const create = this.userRepository.create(user);
    return this.userRepository.save(create);
  }

  async getByEmail(email: string): Promise<GetUserByEmailType> {
    const user = await this.userRepository.findOne({ where: { email } });
    let formatedUser: GetUserByEmailType = {
      email: '',
      id: '',
      userName: ''
    };

    if (!user) {
      throw new AppError('userNotFound', 404);
    }

    formatedUser = {
      email: user.email,
      id: user.id,
      userName: user.userName
    };

    return formatedUser;
  }

  async resetPassword(resetPasswordBody: ResetPasswordPostType): Promise<any> {
    const { securityQuestions, email, newPassword } = resetPasswordBody;

    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) throw new AppError(PRE_ERRORS.userNotFound, 404);

    // pegar os id's das perguntas já salvas no banco de dados
    const userSecurity: string = user.securityQuestions as unknown as string;

    const getQuestionsUser = JSON.parse(userSecurity.replace(/'/g, '"')).map(
      (item: UserSecurityQuestions) => item.id
    ) as string[];

    // pegar os id's das perguntas envidas pelo usuário
    const getQuestionsBody = securityQuestions.map(
      (item: UserSecurityQuestions) => item.id
    );

    // verificar se os id's das perguntas enviadas pelo usuário são iguais aos id's das perguntas salvas no banco de dados
    const checkQuestions = getQuestionsBody.every((item: string) =>
      getQuestionsUser.includes(item)
    );

    if (!checkQuestions) {
      throw new AppError(PRE_ERRORS.invalidCredentials, 400);
    }

    // verificar se as respostas enviadas pelo usuário são iguais as respostas salvas no banco de dados
    const checkAnswers = async () => {
      for (let i = 0; i < securityQuestions.length; i++) {
        const answer = await bcrypt.compare(
          securityQuestions[i].answer.toLowerCase(),
          JSON.parse(userSecurity.replace(/'/g, '"'))[i].answer
        );

        if (!answer) {
          throw new AppError(PRE_ERRORS.invalidCredentials, 400);
        }
      }
    };

    await checkAnswers();

    // se tudo estiver correto, atualizar a senha do usuário
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    try {
      await this.userRepository.update(
        { email },
        { password: newPasswordHash }
      );
    } catch (error) {
      throw new AppError(error);
    }
  }
}
