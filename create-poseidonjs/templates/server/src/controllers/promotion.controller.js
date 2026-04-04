const Promotion = require('../models/Promotion');
const { ApiError } = require('../middleware/errorHandler');

const getAllPromotions = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, isActive, search, status } = req.query;
    const query = {};

    // Search filter
    if (search) {
      query.$or = [
        { code: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Status filter
    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    } else if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const promotions = await Promotion.find(query)
      .populate('applicableProducts', 'name sku')
      .populate('applicableCategories', 'name slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Promotion.countDocuments(query);

    res.json({
      success: true,
      data: {
        promotions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
          total,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const getPromotionById = async (req, res, next) => {
  try {
    const promotion = await Promotion.findById(req.params.id)
      .populate('applicableProducts', 'name sku')
      .populate('applicableCategories', 'name slug');

    if (!promotion) {
      throw new ApiError(404, 'Promotion not found');
    }

    res.json({ success: true, data: promotion });
  } catch (error) {
    next(error);
  }
};

const createPromotion = async (req, res, next) => {
  try {
    const promotionData = req.body;

    // Check if code already exists
    const existingPromotion = await Promotion.findOne({ code: promotionData.code.toUpperCase() });
    if (existingPromotion) {
      throw new ApiError(400, 'Promotion code already exists');
    }

    // Ensure code is uppercase
    promotionData.code = promotionData.code.toUpperCase();

    const promotion = new Promotion(promotionData);
    await promotion.save();

    const populatedPromotion = await Promotion.findById(promotion._id)
      .populate('applicableProducts', 'name sku')
      .populate('applicableCategories', 'name slug');

    res.status(201).json({
      success: true,
      message: 'Promotion created successfully',
      data: populatedPromotion,
    });
  } catch (error) {
    if (error.code === 11000) {
      return next(new ApiError(400, 'Promotion code already exists'));
    }
    next(error);
  }
};

const updatePromotion = async (req, res, next) => {
  try {
    const promotionData = req.body;

    // If code is being updated, check for duplicates
    if (promotionData.code) {
      promotionData.code = promotionData.code.toUpperCase();
      const existingPromotion = await Promotion.findOne({
        code: promotionData.code,
        _id: { $ne: req.params.id },
      });
      if (existingPromotion) {
        throw new ApiError(400, 'Promotion code already exists');
      }
    }

    const promotion = await Promotion.findByIdAndUpdate(req.params.id, promotionData, {
      new: true,
      runValidators: true,
    })
      .populate('applicableProducts', 'name sku')
      .populate('applicableCategories', 'name slug');

    if (!promotion) {
      throw new ApiError(404, 'Promotion not found');
    }

    res.json({
      success: true,
      message: 'Promotion updated successfully',
      data: promotion,
    });
  } catch (error) {
    if (error.code === 11000) {
      return next(new ApiError(400, 'Promotion code already exists'));
    }
    next(error);
  }
};

const deletePromotion = async (req, res, next) => {
  try {
    const promotion = await Promotion.findByIdAndDelete(req.params.id);

    if (!promotion) {
      throw new ApiError(404, 'Promotion not found');
    }

    res.json({
      success: true,
      message: 'Promotion deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllPromotions,
  getPromotionById,
  createPromotion,
  updatePromotion,
  deletePromotion,
};
