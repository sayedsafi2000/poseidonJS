const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const { ApiError } = require('../middleware/errorHandler');

const getWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('wishlist').lean();
    const ids = (user?.wishlist || []).map((id) => String(id));
    if (!ids.length) {
      return res.json({ success: true, data: { items: [] } });
    }

    const products = await Product.find({
      _id: { $in: ids },
      isActive: true,
    })
      .populate('collection', 'name slug')
      .populate('brand', 'name slug')
      .populate('categories', 'name slug')
      .populate('category', 'name slug')
      .populate('collections', 'name slug');

    const map = new Map(products.map((p) => [String(p._id), p]));
    const items = [];
    for (const id of ids) {
      const p = map.get(id);
      if (p) items.push({ _id: p._id, product: p });
    }

    res.json({ success: true, data: { items } });
  } catch (err) {
    next(err);
  }
};

const addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;
    if (!mongoose.isValidObjectId(productId)) {
      throw new ApiError(400, 'Invalid product id');
    }
    const product = await Product.findOne({ _id: productId, isActive: true });
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }
    await User.findByIdAndUpdate(req.user.id, {
      $addToSet: { wishlist: productId },
    });
    res.json({ success: true, message: 'Added to wishlist' });
  } catch (err) {
    next(err);
  }
};

const removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { wishlist: productId },
    });
    res.json({ success: true, message: 'Removed from wishlist' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
};
