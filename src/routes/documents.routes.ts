import { Router } from 'express';
import multer from 'multer';
import { DocumentsController } from '../controllers/documents.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const upload = multer({
  limits: {
    fileSize: 30 * 1024 * 1024 // 30MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
      'image/jpeg',
      'image/png',
      'text/plain'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, Excel, CSV, and images are supported.'));
    }
  }
});

// Upload document
router.post('/upload', [
  authMiddleware,
  upload.single('file')
], DocumentsController.uploadDocument);

// Get document
router.get('/:document_id', [
  authMiddleware
], DocumentsController.getDocument);

// Delete document
router.delete('/:document_id', [
  authMiddleware
], DocumentsController.deleteDocument);

export default router;
