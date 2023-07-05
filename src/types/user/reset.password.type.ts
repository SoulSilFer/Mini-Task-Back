import { UserSecurityQuestions } from './create.type';

export class ResetPasswordPostType {
  email: string;
  securityQuestions: UserSecurityQuestions[];
  newPassword: string;
}
