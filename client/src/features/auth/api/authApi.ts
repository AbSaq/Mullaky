import { api } from "../../../api/api";
import type {
  LoginPayload,
  RegisterPayload,
  AuthSyncResponse,
  VerifyStatusResponse,
  VerifyStatusPayload,
  ResendVerificationPayload,
} from "./types";

export const loginSyncRequest = async (
  payload: LoginPayload,
): Promise<AuthSyncResponse> => {
  const { data } = await api.post<AuthSyncResponse>("/auth/login", payload);
  return data;
};

export const registerSyncRequest = async (
  payload: RegisterPayload,
): Promise<void> => {
  const { data } = await api.post<void>("/auth/register", payload);
  return data;
};

export const checkVerificationRequest = async (
  payload: VerifyStatusPayload,
): Promise<VerifyStatusResponse> => {
  const { data } = await api.post<VerifyStatusResponse>(
    "/auth/check-verification",
    payload,
  );
  return data;
};

export const rfJi5GN23kBTCA6KLrWVND2B7BRERd9uE = async (
  payload: ResendVerificationPayload,
): Promise<void> => {
  const { data } = await api.post<void>("/auth/resend-verification", payload);
  return data;
};
