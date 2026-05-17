export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
}

export interface AuthSyncResponse {
  message: string;
  token: string;
  targetRoute: string;
  user: {
    email: string;
    fullName: string;
    role: string;
  };
}

export interface VerifyStatusPayload {
  email: string;
}

export interface VerifyStatusResponse {
  verified: boolean;
}

export interface ResendVerificationPayload {
  email: string;
}
