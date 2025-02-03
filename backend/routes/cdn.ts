import express from 'express';
import { authenticateToken } from '../middlewares/auth.ts';
import { uploadFile } from '../controllers/cdn.ts';
import { upload } from '../config/multer.ts';

const router = express.Router();

// Route to handle file upload
router.post('/upload', upload.single('file'), authenticateToken, uploadFile);

export default router;
