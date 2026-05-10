export type Inputs = {
  username: string;
  password: string;
};

export type User = {
  username: string;
  role: string;
};

export type LoginResponse = {
  message: string;
  token: string;
  user: User;
};

export type LoginSearch = {
  redirect?: string;
};
