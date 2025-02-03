import type { Request, Response } from 'express';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import path from 'path';
import fs from 'fs';

const s3 = new S3Client({ region: 'us-west-2' });

/**
 * Handles file uploads to S3.
 * @param req - Express request object
 * @param res - Express response object
 */
export const uploadFileToS3 = async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  // Define file path and S3 parameters
  const filePath = req.file.path;
  const bucketName = 'your-bucket-name'; // Replace with your actual bucket name
  const fileName = path.basename(filePath);  // Get the file name

  const uploadParams = {
    Bucket: bucketName,
    Key: fileName, // S3 file name (you might want to generate a unique name)
    Body: fs.createReadStream(filePath), // Read the file content
    ContentType: req.file.mimetype, // Content type (e.g., image/jpeg)
  };

  try {
    // Upload the file to S3
    await s3.send(new PutObjectCommand(uploadParams));

    // Optionally delete the local file after upload
    fs.unlinkSync(filePath);

    res.json({
      message: 'File uploaded successfully to S3',
      fileUrl: `https://${bucketName}.s3.amazonaws.com/${fileName}`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error uploading file to S3', error: err });
  }
};
