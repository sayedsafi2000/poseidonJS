const Collection = require('../models/Collection');
const { ApiError } = require('../middleware/errorHandler');

const getAllCollections = async (req, res, next) => {
  try {
    const { isActive, search, isFeatured, limit } = req.query;
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

    if (isFeatured !== undefined) {
      query.isFeatured = isFeatured === 'true';
    }

    const Product = require('../models/Product');
    let findQuery = Collection.find(query).sort({ sortOrder: 1, name: 1 });

    if (limit !== undefined) {
      const n = parseInt(String(limit), 10);
      if (!Number.isNaN(n) && n > 0) {
        findQuery = findQuery.limit(Math.min(n, 100));
      }
    }

    const collectionsData = await findQuery;

    // Add product count for each collection
    const collections = await Promise.all(
      collectionsData.map(async (collection) => {
        const productCount = await Product.countDocuments({
          $or: [
            { collection: collection._id },
            { collections: collection._id }
          ],
          isActive: true
        });
        return {
          ...collection.toObject(),
          productCount
        };
      })
    );

    res.json({
      success: true,
      data: {
        collections,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getCollectionById = async (req, res, next) => {
  try {
    const collection = await Collection.findById(req.params.id);

    if (!collection) {
      throw new ApiError(404, 'Collection not found');
    }

    res.json({ success: true, data: collection });
  } catch (error) {
    next(error);
  }
};

const createCollection = async (req, res, next) => {
  try {
    const { name, description, image, isActive = true } = req.body;

    if (!name) {
      throw new ApiError(400, 'Collection name is required');
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check if slug already exists
    const existingCollection = await Collection.findOne({ slug });
    if (existingCollection) {
      throw new ApiError(400, 'Collection with this name already exists');
    }

    const collection = new Collection({
      name,
      slug,
      description,
      image,
      isActive,
    });

    await collection.save();

    res.status(201).json({
      success: true,
      message: 'Collection created successfully',
      data: collection,
    });
  } catch (error) {
    if (error.code === 11000) {
      return next(new ApiError(400, 'Collection with this slug already exists'));
    }
    next(error);
  }
};

const updateCollection = async (req, res, next) => {
  try {
    const collection = await Collection.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!collection) {
      throw new ApiError(404, 'Collection not found');
    }

    res.json({
      success: true,
      message: 'Collection updated successfully',
      data: collection,
    });
  } catch (error) {
    if (error.code === 11000) {
      return next(new ApiError(400, 'Collection with this slug already exists'));
    }
    next(error);
  }
};

const deleteCollection = async (req, res, next) => {
  try {
    const collection = await Collection.findByIdAndDelete(req.params.id);

    if (!collection) {
      throw new ApiError(404, 'Collection not found');
    }

    res.json({
      success: true,
      message: 'Collection deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCollections,
  getCollectionById,
  createCollection,
  updateCollection,
  deleteCollection,
};
