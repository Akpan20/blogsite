export interface AuthResponse {
    success: boolean;
    message: string;
    data?: {
      user: UserData;
      token?: string;
    };
  }
  
  export interface UserData {
    id: string;
    email: string;
    username: string;
    name?: string;
    role: 'ADMIN' | 'EDITOR' | 'AUTHOR';
    twoFactorEnabled: boolean;
    avatar?: string;
  }
  
  export interface PasswordResetToken {
    email: string;
    token: string;
    expires: Date;
  }
  
  export interface TwoFactorSecret {
    secret: string;
    otpauth_url: string;
    qr_code: string;
  }