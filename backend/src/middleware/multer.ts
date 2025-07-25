import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Define the absolute path for the uploads directory.
const uploadDir = path.resolve(__dirname, '../../../uploads');

// Ensure the destination directory exists, creating it if necessary.
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/**
 * Multer disk storage configuration.
 * This determines where files are stored and how they are named.
 */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // All files will be stored in the 'uploads' directory.
    cb(null, uploadDir); 
  },
  filename: function (req, file, cb) {
    // Generate a unique filename to prevent overwrites and naming conflicts.
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
});

/**
 * Multer middleware instance configured for handling file uploads.
 * It expects an array of files from a form field named 'files'.
 * 
 * - `storage`: Uses the disk storage configuration defined above.
 * - `limits`: Sets a limit of 5 files per upload request.
 */
export const upload = multer({ 
    storage: storage,
    limits: { files: 5 } // Allow up to 5 files per request.
}).array('files', 5); // The field name in the form-data should be 'files'.

