const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');
const { ApiError } = require('../middleware/errorHandler');

// Configure Cloudinary if credentials are available
const isCloudinaryConfigured = 
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_API_KEY && 
  process.env.CLOUDINARY_API_SECRET;

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('✅ Cloudinary configured');
} else {
  console.warn('⚠️  Cloudinary not configured. Image uploads will fail.');
}

/**
 * Upload buffer to Cloudinary
 */
const uploadToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    const readableStream = new Readable();
    readableStream.push(buffer);
    readableStream.push(null);
    readableStream.pipe(uploadStream);
  });
};

/**
 * Upload single image
 */
const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new ApiError(400, 'Please upload an image'));
    }

    // Check if Cloudinary is configured
    if (!isCloudinaryConfigured) {
      console.error('⚠️  Cloudinary configuration missing');
      console.error('Please add these to your .env file:');
      console.error('CLOUDINARY_CLOUD_NAME=your_cloud_name');
      console.error('CLOUDINARY_API_KEY=your_api_key');
      console.error('CLOUDINARY_API_SECRET=your_api_secret');
      
      // Return a base64 data URL as fallback for development
      const base64 = req.file.buffer.toString('base64');
      const dataUrl = `data:${req.file.mimetype};base64,${base64}`;
      
      return res.status(200).json({
        success: true,
        message: 'Image uploaded (using base64 fallback - configure Cloudinary for production)',
        data: {
          url: dataUrl,
          publicId: null,
          warning: 'Cloudinary not configured. Using base64 encoding. This is not recommended for production.',
        },
      });
    }

    const result = await uploadToCloudinary(req.file.buffer, 'poseidonjs');

    if (!result || !result.secure_url) {
      return next(new ApiError(500, 'Failed to upload image to cloud storage'));
    }

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url: result.secure_url,
        publicId: result.public_id,
      },
    });
  } catch (error) {
    console.error('Upload error:', error.message);
    if (error instanceof ApiError) {
      return next(error);
    }
    next(new ApiError(500, error.message || 'Failed to upload image'));
  }
};

/**
 * Upload multiple images
 */
const uploadImages = async (req, res, next) => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      throw new ApiError(400, 'Please upload at least one image');
    }

    const uploadPromises = req.files.map((file) =>
      uploadToCloudinary(file.buffer, 'poseidonjs')
    );

    const results = await Promise.all(uploadPromises);

    const images = results.map((result) => ({
      url: result.secure_url,
      publicId: result.public_id,
    }));

    res.status(200).json({
      success: true,
      message: 'Images uploaded successfully',
      data: { images },
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error);
    }
    next(new ApiError(500, error.message || 'Failed to upload images'));
  }
};

/**
 * Delete image from Cloudinary
 */
const deleteImage = async (req, res, next) => {
  try {
    const { publicId } = req.body;

    if (!publicId) {
      throw new ApiError(400, 'Public ID is required');
    }

    await cloudinary.uploader.destroy(publicId);

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully',
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error);
    }
    next(new ApiError(500, error.message || 'Failed to delete image'));
  }
};

module.exports = {
  uploadImage,
  uploadImages,
  deleteImage,
};
