import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Multer to store files temporarily in 'uploads' folder
const upload = multer({
  dest: path.join(__dirname, '../uploads'), // Temporarily store files locally
  limits: { fileSize: 10 * 1024 * 1024 }, // Max file size: 10MB
});

export { upload };
