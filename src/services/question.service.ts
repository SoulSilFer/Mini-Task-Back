import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { QuestionEntity } from 'src/entities';
import { AppError, GetQuestionByIdsGetType } from 'src/types';

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(QuestionEntity)
    private readonly questionRepo: Repository<QuestionEntity>
  ) {}

  async findAll(): Promise<QuestionEntity[]> {
    return this.questionRepo.find();
  }

  async getByIds(ids: string[]): Promise<GetQuestionByIdsGetType[]> {
    let questions: GetQuestionByIdsGetType[] = [];

    for (let i = 0; i < ids.length; i++) {
      const question = await this.questionRepo.findOne({
        where: { id: ids[i] }
      });

      if (!question) {
        throw new AppError('questionNotFound');
      }

      const questionToPush = {
        id: question.id,
        question: question.question
      };

      questions.push(questionToPush);
    }

    return questions;
  }
}
