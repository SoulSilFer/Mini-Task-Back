import { SecurityQuestionsEnum } from './questions.enum';

export type UserSecurityQuestions = {
  question: SecurityQuestionsEnum;
  answer: string;
};

export class UserPostType {
  userName: string;
  email: string;
  password: string;
  securityQuestions: UserSecurityQuestions[];
}
