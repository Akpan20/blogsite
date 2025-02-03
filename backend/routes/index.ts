import express from 'express';
import { getHomePage, getRegisterPage, getLoginPage } from '../controllers/index.ts';

const router = express.Router();

router.get('/', getHomePage);
router.get('/register', getRegisterPage);
router.get('/login', getLoginPage);

export default router;
