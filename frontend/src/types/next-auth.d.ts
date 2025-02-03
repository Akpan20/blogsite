import 'next-auth';

declare module 'next-auth' {
  interface Session {
    accessToken: string;
    user: {
      id: string;
      email: string;
      name?: string;
      username: string;
      role: string;
    }
  }

  interface User {
    id: string;
    email: string;
    name?: string;
    username: string;
    role: string;
    token: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken: string;
    id: string;
    username: string;
    role: string;
  }
}