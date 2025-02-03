import type { Request, Response } from 'express';
import { uploadFileToS3 } from '../config/aws.ts';

/**
 * Handles file uploads by delegating to the S3 upload function.
 * @param req - Express request object
 * @param res - Express response object
 */
export const uploadFile = async (req: Request, res: Response) => {
  await uploadFileToS3(req, res);
};
