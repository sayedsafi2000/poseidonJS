const Notification = require('../models/Notification');
const { ApiError } = require('../middleware/errorHandler');

/**
 * @desc    Get all notifications (filtered by user if vendor)
 * @route   GET /api/notifications
 * @access  Private
 */
const getAllNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    const query = {};

    // If vendor, only show their notifications
    // If admin, show all notifications (userId is null or matches)
    if (req.user.role === 'vendor') {
      query.$or = [
        { userId: req.user.id },
        { userId: null }, // Global notifications
      ];
    } else if (req.user.role === 'admin') {
      query.$or = [
        { userId: null }, // Global notifications for all admins
        { userId: req.user.id }, // Personal notifications
      ];
    }

    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ ...query, isRead: false });

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
          total,
        },
        unreadCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a notification
 * @route   POST /api/notifications/create
 * @access  Private (Admin only)
 */
const createNotification = async (req, res, next) => {
  try {
    const { title, message, type, category, userId, relatedId, relatedType, metadata } = req.body;

    if (!title || !message) {
      throw new ApiError(400, 'Title and message are required');
    }

    const notification = await Notification.create({
      title,
      message,
      type: type || 'info',
      category: category || 'general',
      userId: userId || null,
      relatedId: relatedId || null,
      relatedType: relatedType || null,
      metadata: metadata || {},
    });

    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      data: { notification },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark notification as read
 * @route   PATCH /api/notifications/mark-read
 * @access  Private
 */
const markAsRead = async (req, res, next) => {
  try {
    const { notificationIds } = req.body;

    if (!notificationIds || !Array.isArray(notificationIds)) {
      throw new ApiError(400, 'notificationIds array is required');
    }

    const query = { _id: { $in: notificationIds } };

    // Ensure user can only mark their own notifications as read
    if (req.user.role === 'vendor') {
      query.$or = [
        { userId: req.user.id },
        { userId: null },
      ];
    }

    await Notification.updateMany(query, { isRead: true });

    res.json({
      success: true,
      message: 'Notifications marked as read',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark all notifications as read
 * @route   PATCH /api/notifications/mark-all-read
 * @access  Private
 */
const markAllAsRead = async (req, res, next) => {
  try {
    const query = { isRead: false };

    if (req.user.role === 'vendor') {
      query.$or = [
        { userId: req.user.id },
        { userId: null },
      ];
    } else if (req.user.role === 'admin') {
      query.$or = [
        { userId: null },
        { userId: req.user.id },
      ];
    }

    await Notification.updateMany(query, { isRead: true });

    res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get unread count
 * @route   GET /api/notifications/unread-count
 * @access  Private
 */
const getUnreadCount = async (req, res, next) => {
  try {
    const query = { isRead: false };

    if (req.user.role === 'vendor') {
      query.$or = [
        { userId: req.user.id },
        { userId: null },
      ];
    } else if (req.user.role === 'admin') {
      query.$or = [
        { userId: null },
        { userId: req.user.id },
      ];
    }

    const count = await Notification.countDocuments(query);

    res.json({
      success: true,
      data: { unreadCount: count },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllNotifications,
  createNotification,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
};

