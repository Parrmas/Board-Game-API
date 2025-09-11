export interface IUser {
  id: string;
  username: string;
  email: string;
  password: string;
  savedGameIds: number[];
  isLoggedIn: boolean;
}

export interface ILoginRequest {
  email: string;
  password: string;
}

export interface IAuthResponse {
  token: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
}

export interface ProfileGameResponse {
  success: boolean;
  data?: number[];
  message?: string;
}
