export type UserSecurityQuestions = {
  id: string;
  answer: string;
};

export class UserPostType {
  userName: string;
  email: string;
  password: string;
  securityQuestions: UserSecurityQuestions[];
}
