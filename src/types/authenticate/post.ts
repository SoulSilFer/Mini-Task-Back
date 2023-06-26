export type AuthenticateTypePost = {
  email: string;
  password: string;
};

export type AuthenticateTypePostSuccess = {
  access_token: string;
  refresh_token: string;
  email: string;
  userName: string;
  id: string;
};
