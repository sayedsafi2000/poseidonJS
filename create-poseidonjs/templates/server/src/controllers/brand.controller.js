const Brand = require('../models/Brand');
const { ApiError } = require('../middleware/errorHandler');

const getAllBrands = async (req, res, next) => {
  try {
    const { isActive, search } = req.query;
    const query = {};

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const Product = require('../models/Product');
    const brandsData = await Brand.find(query).sort({ sortOrder: 1, name: 1 });

    // Add product count for each brand
    const brands = await Promise.all(
      brandsData.map(async (brand) => {
        const productCount = await Product.countDocuments({
          brand: brand._id,
          isActive: true
        });
        return {
          ...brand.toObject(),
          productCount
        };
      })
    );

    res.json({
      success: true,
      data: {
        brands,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getBrandById = async (req, res, next) => {
  try {
    const brand = await Brand.findById(req.params.id);

    if (!brand) {
      throw new ApiError(404, 'Brand not found');
    }

    res.json({ success: true, data: brand });
  } catch (error) {
    next(error);
  }
};

const createBrand = async (req, res, next) => {
  try {
    const { name, description, image, website, isActive = true } = req.body;

    if (!name) {
      throw new ApiError(400, 'Brand name is required');
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check if slug already exists
    const existingBrand = await Brand.findOne({ slug });
    if (existingBrand) {
      throw new ApiError(400, 'Brand with this name already exists');
    }

    const brand = new Brand({
      name,
      slug,
      description,
      image,
      website,
      isActive,
    });

    await brand.save();

    res.status(201).json({
      success: true,
      message: 'Brand created successfully',
      data: brand,
    });
  } catch (error) {
    if (error.code === 11000) {
      return next(new ApiError(400, 'Brand with this slug already exists'));
    }
    next(error);
  }
};

const updateBrand = async (req, res, next) => {
  try {
    const brand = await Brand.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!brand) {
      throw new ApiError(404, 'Brand not found');
    }

    res.json({
      success: true,
      message: 'Brand updated successfully',
      data: brand,
    });
  } catch (error) {
    if (error.code === 11000) {
      return next(new ApiError(400, 'Brand with this slug already exists'));
    }
    next(error);
  }
};

const deleteBrand = async (req, res, next) => {
  try {
    const brand = await Brand.findByIdAndDelete(req.params.id);

    if (!brand) {
      throw new ApiError(404, 'Brand not found');
    }

    res.json({
      success: true,
      message: 'Brand deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand,
};

