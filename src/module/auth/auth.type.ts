export interface ILoginRequest {
  email: string;
  password: string;
}

export interface IAuthResponse {
  token: string;
  message?: string;
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

export interface IRegisterRequest {
  email: string;
  password: string;
  username: string;
  firstName: string;
  lastName: string;
}

export interface IRefreshTokenRequest {
  refreshToken: string;
}
