import type { Request, Response } from 'express';

export const getHomePage = (req: Request, res: Response) => {
  res.render('index', { title: 'Welcome to the Blog App!' });
};

export const getRegisterPage = (req: Request, res: Response) => {
  res.render('register', { title: 'Register' });
};

export const getLoginPage = (req: Request, res: Response) => {
  res.render('login', { title: 'Login' });
};
