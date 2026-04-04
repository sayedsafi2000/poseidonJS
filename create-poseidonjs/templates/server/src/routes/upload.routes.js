const { Router } = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const controller = require('../controllers/upload.controller');
const { upload } = require('../config/multer');
const { ApiError } = require('../middleware/errorHandler');
const router = Router();

// Public route for signup image upload (no auth required)
router.post('/signup', (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      return handleMulterError(err, req, res, next);
    }
    next();
  });
}, controller.uploadImage);

// Protected routes require authentication (customers may upload e.g. profile photo)
router.use(authenticate, authorize('admin', 'vendor', 'user'));

// Multer error handler
const handleMulterError = (err, req, res, next) => {
  if (err) {
    console.error('Multer error:', err);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(new ApiError(400, 'File too large. Maximum size is 5MB'));
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return next(new ApiError(400, 'Unexpected file field'));
    }
    if (err.status === 400) {
      return next(new ApiError(400, err.message || 'Invalid file type'));
    }
    return next(new ApiError(400, err.message || 'File upload error'));
  }
  next();
};

/**
 * Upload single image (frontend sends 'file' field)
 */
router.post('/', (req, res, next) => {
  console.log('Upload route hit');
  console.log('Headers:', req.headers);
  console.log('Content-Type:', req.headers['content-type']);
  
  upload.single('file')(req, res, (err) => {
    if (err) {
      console.error('Multer error in route:', err);
      return handleMulterError(err, req, res, next);
    }
    console.log('File received:', req.file ? { 
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size 
    } : 'No file');
    next();
  });
}, controller.uploadImage);

/**
 * Upload multiple images
 */
router.post('/images', upload.array('images', 10), handleMulterError, controller.uploadImages);

/**
 * Delete image from Cloudinary
 */
router.delete('/image', controller.deleteImage);

module.exports = router;
