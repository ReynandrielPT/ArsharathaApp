import express from 'express';
import { isValidObjectId } from 'mongoose';
import { authMiddleware, IAuthRequest } from '../middleware/auth';
import { upload } from '../middleware/multer';
import { File } from '../models/File';
import { Message } from '../models/Message';

const router = express.Router();
const MAX_SESSION_FILES = 5;

/**
 * @route   POST /api/upload
 * @desc    Uploads one or more files.
 * @access  Private
 */
router.post('/', authMiddleware, (req: IAuthRequest, res) => {
  upload(req, res, async (err: any) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    const files = req.files as Express.Multer.File[];
    const { sessionId } = req.body;

    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded.' });
    }

    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized.' });
    }

    try {
      // Server-side validation for total files in a session
      if (sessionId && isValidObjectId(sessionId)) {
        const messages = await Message.find({ sessionId: sessionId });
        const existingFileCount = messages.reduce((sum, msg) => sum + (msg.fileIds?.length || 0), 0);
        
        if (existingFileCount + files.length > MAX_SESSION_FILES) {
          return res.status(400).json({ 
            message: `Uploading these ${files.length} file(s) would exceed the session limit of ${MAX_SESSION_FILES} files.` 
          });
        }
      }

      const savedFiles = await Promise.all(files.map(async (file) => {
        const newFile = new File({
          filename: file.filename,
          originalFilename: file.originalname,
          path: file.path,
          mimetype: file.mimetype,
          size: file.size,
          userId: req.userId,
        });
        await newFile.save();
        return {
          fileId: newFile._id,
          filename: newFile.originalFilename,
        };
      }));

      res.status(201).json({
        message: 'Files uploaded successfully.',
        files: savedFiles,
      });

    } catch (error) {
      console.error('Error saving files to database:', error);
      res.status(500).json({ message: 'Error saving file information.' });
    }
  });
});

export default router;