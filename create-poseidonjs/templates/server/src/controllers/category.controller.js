const Category = require('../models/Category');
const { ApiError } = require('../middleware/errorHandler');

const getAllCategories = async (req, res, next) => {
  try {
    const { isActive, search, collection } = req.query;
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

    // Filter by collection if provided
    if (collection) {
      query.collection = collection;
    }

    const Product = require('../models/Product');
    const categoriesData = await Category.find(query)
      .populate('collection', 'name slug')
      .sort({ sortOrder: 1, name: 1 });

    // Add product count for each category
    const categories = await Promise.all(
      categoriesData.map(async (category) => {
        const productCount = await Product.countDocuments({
          $or: [
            { category: category._id },
            { categories: category._id }
          ],
          isActive: true
        });
        return {
          ...category.toObject(),
          productCount
        };
      })
    );

    res.json({
      success: true,
      data: {
        categories,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate('collection', 'name slug');

    if (!category) {
      throw new ApiError(404, 'Category not found');
    }

    res.json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const { name, description, image, collection, isActive = true } = req.body;

    if (!name) {
      throw new ApiError(400, 'Category name is required');
    }

    if (!collection) {
      throw new ApiError(400, 'Collection ID is required');
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check if slug already exists
    const existingCategory = await Category.findOne({ slug });
    if (existingCategory) {
      throw new ApiError(400, 'Category with this name already exists');
    }

    const category = new Category({
      name,
      slug,
      description,
      image,
      collection,
      isActive,
    });

    await category.save();
    await category.populate('collection', 'name slug');

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category,
    });
  } catch (error) {
    if (error.code === 11000) {
      return next(new ApiError(400, 'Category with this slug already exists'));
    }
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('collection', 'name slug');

    if (!category) {
      throw new ApiError(404, 'Category not found');
    }

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: category,
    });
  } catch (error) {
    if (error.code === 11000) {
      return next(new ApiError(400, 'Category with this slug already exists'));
    }
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      throw new ApiError(404, 'Category not found');
    }

    res.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
