import { Body, Controller, Get, Post } from '@nestjs/common';

import { QuestionEntity } from 'src/entities';
import { QuestionService } from 'src/services';
import { GetQuestionByIdsGetType, GetQuestionByIdsPostType } from 'src/types';

@Controller('question')
export class QuestionController {
  constructor(private readonly userService: QuestionService) {}

  @Get()
  findAll(): Promise<QuestionEntity[]> {
    return this.userService.findAll();
  }

  @Post()
  getByIds(
    @Body() body: GetQuestionByIdsPostType
  ): Promise<GetQuestionByIdsGetType[]> {
    return this.userService.getByIds(body.ids);
  }
}
