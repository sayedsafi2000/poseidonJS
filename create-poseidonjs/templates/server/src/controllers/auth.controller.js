const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { ApiError } = require('../middleware/errorHandler');
const {
  sendPasswordResetEmail,
  sendPasswordResetSuccessEmail,
  sendEmailVerificationEmail,
  sendEmailVerificationSuccessEmail,
} = require('../config/email');

/** Storefront base URL for email verification — never use FRONTEND_URL (often the admin app, e.g. :3001). */
function storefrontVerifyEmailUrl(verificationToken, email) {
  const base = process.env.STOREFRONT_URL || 'http://localhost:3000';
  const qs = new URLSearchParams();
  qs.set('token', verificationToken);
  const em = email && String(email).trim().toLowerCase();
  if (em) qs.set('email', em);
  return `${String(base).replace(/\/$/, '')}/verify-email?${qs.toString()}`;
}

/** Compare incoming link token to DB value (raw secret or legacy SHA-256 hex). */
function storedVerificationTokenMatches(stored, normalizedToken64) {
  if (stored == null) return false;
  let raw =
    typeof stored === 'string'
      ? stored
      : Buffer.isBuffer(stored)
        ? stored.toString('utf8')
        : String(stored);
  if (!raw) return false;
  const s = raw.replace(/^[^a-fA-F0-9]+|[^a-fA-F0-9]+$/g, '').toLowerCase();
  const t = normalizedToken64;
  if (s.length !== 64 || t.length !== 64) return false;
  const hashedIncoming = crypto.createHash('sha256').update(t, 'utf8').digest('hex');
  try {
    if (s === t) {
      return crypto.timingSafeEqual(Buffer.from(s, 'utf8'), Buffer.from(t, 'utf8'));
    }
    if (s === hashedIncoming) {
      return crypto.timingSafeEqual(Buffer.from(s, 'utf8'), Buffer.from(hashedIncoming, 'utf8'));
    }
  } catch {
    return s === t || s === hashedIncoming;
  }
  return false;
}

/**
 * Generate JWT token
 */
const generateToken = (userId, email, role) => {
  const secret = process.env.JWT_SECRET || 'your-secret-key-change-this';
  const options = {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  };
  
  return jwt.sign(
    { id: userId, email, role },
    secret,
    options
  );
};

/**
 * Generate refresh token
 */
const generateRefreshToken = (userId) => {
  const secret = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-this';
  const options = {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  };
  
  return jwt.sign(
    { id: userId },
    secret,
    options
  );
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      role,
      phone,
      address,
      avatar,
      vendorInfo,
    } = req.body;

    // Validate role - only vendor allowed via public registration
    if (!role || role !== 'vendor') {
      throw new ApiError(400, 'Invalid role. Must be vendor');
    }

    // Validate avatar for admin and vendor
    if (!avatar) {
      throw new ApiError(400, 'Profile image is required for admin and vendor accounts');
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ApiError(409, 'User with this email already exists');
    }

    // Generate email verification token (store raw secret; link uses same value)
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Create user
    const userRole = role;
    const isAdmin = userRole === 'admin';
    
    const userData = {
      firstName,
      lastName,
      email,
      password,
      role: userRole,
      phone,
      address,
      avatar,
      emailVerificationToken: verificationToken,
      emailVerificationExpire: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      isVerified: isAdmin, // Admin users are auto-verified
      isActive: true, // All new users are active by default
    };

    // Add vendor info if vendor
    if (userRole === 'vendor' && vendorInfo) {
      userData.vendorInfo = {
        businessName: vendorInfo.businessName,
        businessAddress: vendorInfo.businessAddress || address,
        taxId: vendorInfo.taxId,
        commissionRate: vendorInfo.commissionRate || 10,
      };
    }

    const user = await User.create(userData);

    // Generate tokens
    const token = generateToken(user._id.toString(), user.email, user.role);
    const refreshToken = generateRefreshToken(user._id.toString());

    // Send verification email (skip for admin users)
    if (!isAdmin) {
      try {
        const verificationUrl = storefrontVerifyEmailUrl(verificationToken, user.email);
        await sendEmailVerificationEmail(user.email, verificationToken, verificationUrl);
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
        // Don't fail registration if email fails
      }
    }

    res.status(201).json({
      success: true,
      message: isAdmin
        ? 'Admin account created successfully'
        : 'User registered successfully. Please check your email to verify your account.',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          phone: user.phone,
          address: user.address,
          avatar: user.avatar,
          isVerified: user.isVerified,
          isActive: user.isActive,
          vendorInfo: user.vendorInfo,
        },
        token,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Register a storefront customer (role: user)
 * @route   POST /api/auth/register-customer
 * @access  Public
 */
const registerCustomer = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, phone, avatar } = req.body;

    if (!firstName?.trim() || !lastName?.trim() || !email?.trim() || !password) {
      throw new ApiError(400, 'Please provide first name, last name, email, and password');
    }

    const emailNorm = String(email).trim().toLowerCase();
    const existingUser = await User.findOne({ email: emailNorm });
    if (existingUser) {
      throw new ApiError(409, 'An account with this email already exists');
    }

    const avatarUrl =
      typeof avatar === 'string' && avatar.trim() ? avatar.trim().slice(0, 2000) : null;

    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: emailNorm,
      password,
      role: 'user',
      phone: phone?.trim(),
      avatar: avatarUrl,
      isVerified: false,
      isActive: true,
      emailVerificationToken: verificationToken,
      emailVerificationExpire: Date.now() + 24 * 60 * 60 * 1000,
    });

    try {
      await sendEmailVerificationEmail(
        user.email,
        verificationToken,
        storefrontVerifyEmailUrl(verificationToken, user.email)
      );
    } catch (emailError) {
      console.error('Failed to send customer verification email:', emailError);
    }

    const token = generateToken(user._id.toString(), user.email, user.role);
    const refreshToken = generateRefreshToken(user._id.toString());

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          phone: user.phone,
          address: user.address,
          avatar: user.avatar,
          isVerified: user.isVerified,
          isActive: user.isActive,
        },
        token,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      throw new ApiError(400, 'Please provide email and password');
    }

    // Find user and include password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }

    // Ensure admin users are always active
    if (user.role === 'admin' && !user.isActive) {
      user.isActive = true;
      await user.save();
    }

    // Check if user is active (skip check for admin as they're always active)
    if (user.role !== 'admin' && !user.isActive) {
      throw new ApiError(403, 'Your account has been deactivated');
    }

    // Check if email is verified (admin always; vendors must verify; customers can be verified at signup)
    if (!user.isVerified && user.role === 'vendor') {
      throw new ApiError(403, 'Please verify your email before logging in. Check your inbox for the verification link.');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid email or password');
    }

    // Generate tokens
    const token = generateToken(user._id.toString(), user.email, user.role);
    const refreshToken = generateRefreshToken(user._id.toString());

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          phone: user.phone,
          address: user.address,
          avatar: user.avatar,
          isActive: user.isActive,
          isVerified: user.isVerified,
          vendorInfo: user.vendorInfo,
        },
        token,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Refresh access token
 * @route   POST /api/auth/refresh
 * @access  Public
 */
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new ApiError(400, 'Refresh token is required');
    }

    // Verify refresh token
    const secret = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-this';
    const decoded = jwt.verify(refreshToken, secret);

    // Find user
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      throw new ApiError(401, 'Invalid refresh token');
    }

    // Generate new tokens
    const newToken = generateToken(user._id.toString(), user.email, user.role);
    const newRefreshToken = generateRefreshToken(user._id.toString());

    res.status(200).json({
      success: true,
      data: {
        token: newToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user?.id);
    
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          phone: user.phone,
          address: user.address,
          avatar: user.avatar,
          isVerified: user.isVerified,
          isActive: user.isActive,
          vendorInfo: user.vendorInfo,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/update-profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, phone, address, avatar, vendorInfo } = req.body;

    const user = await User.findById(req.user?.id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Ensure admin users are always active
    if (user.role === 'admin' && !user.isActive) {
      user.isActive = true;
    }

    // Update fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (avatar) user.avatar = avatar;

    // Update vendor info if provided
    if (vendorInfo && user.role === 'vendor') {
      if (vendorInfo.businessName) user.vendorInfo.businessName = vendorInfo.businessName;
      if (vendorInfo.businessAddress) user.vendorInfo.businessAddress = vendorInfo.businessAddress;
      if (vendorInfo.taxId) user.vendorInfo.taxId = vendorInfo.taxId;
      if (vendorInfo.commissionRate !== undefined) user.vendorInfo.commissionRate = vendorInfo.commissionRate;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          phone: user.phone,
          address: user.address,
          avatar: user.avatar,
          isActive: user.isActive,
          isVerified: user.isVerified,
          vendorInfo: user.vendorInfo,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change user password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new ApiError(400, 'Please provide current and new password');
    }

    const user = await User.findById(req.user?.id).select('+password');
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      throw new ApiError(401, 'Current password is incorrect');
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Forgot password - send reset token to email
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new ApiError(400, 'Please provide your email address');
    }

    // Find user
    const user = await User.findOne({ email });
    
    // Don't reveal if user exists or not (security best practice)
    if (!user) {
      // Still return success to prevent email enumeration
      return res.status(200).json({
        success: true,
        message: 'If that email exists, a password reset link has been sent.',
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Save reset token to user
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save({ validateBeforeSave: false });

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/reset-password?token=${resetToken}`;

    try {
      // Send email
      await sendPasswordResetEmail(user.email, resetToken, resetUrl);

      res.status(200).json({
        success: true,
        message: 'Password reset email sent successfully',
      });
    } catch (error) {
      // If email fails, remove the token
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      throw new ApiError(500, 'Email could not be sent. Please try again later.');
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reset password using token
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      throw new ApiError(400, 'Please provide reset token and new password');
    }

    // Hash the token to compare with stored token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    }).select('+password');

    if (!user) {
      throw new ApiError(400, 'Invalid or expired reset token');
    }

    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Send success email
    try {
      await sendPasswordResetSuccessEmail(user.email);
    } catch (emailError) {
      console.error('Failed to send success email:', emailError);
      // Don't fail the request if email fails
    }

    res.status(200).json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify email with token
 * @route   GET /api/auth/verify-email
 * @access  Public
 */
const verifyEmail = async (req, res, next) => {
  try {
    const raw = req.query.token;
    let token =
      typeof raw === 'string'
        ? raw.trim()
        : Array.isArray(raw) && raw[0]
          ? String(raw[0]).trim()
          : '';

    if (!token) {
      throw new ApiError(400, 'Verification token is required');
    }

    try {
      token = decodeURIComponent(token);
    } catch {
      /* keep as-is */
    }

    // Strip non-hex (some mail clients append punctuation / line breaks)
    token = token.replace(/^[^a-fA-F0-9]+|[^a-fA-F0-9]+$/g, '').toLowerCase();
    if (!/^[a-f0-9]{64}$/.test(token)) {
      throw new ApiError(400, 'Invalid verification token. Please use the link from your latest email.');
    }

    const hashedToken = crypto.createHash('sha256').update(token, 'utf8').digest('hex');

    const tokenOrHash = {
      $or: [
        { emailVerificationToken: token },
        { emailVerificationToken: hashedToken },
      ],
    };

    // Use native collection so lookup is not affected by Mongoose casting / select:false quirks
    const coll = User.collection;
    let rawDoc = await coll.findOne(tokenOrHash);

    if (!rawDoc) {
      const rawEmail = req.query.email;
      const emailLookup =
        typeof rawEmail === 'string'
          ? rawEmail.trim().toLowerCase()
          : Array.isArray(rawEmail) && rawEmail[0]
            ? String(rawEmail[0]).trim().toLowerCase()
            : '';
      if (emailLookup) {
        const byEmail = await coll.findOne({ email: emailLookup });
        if (byEmail && storedVerificationTokenMatches(byEmail.emailVerificationToken, token)) {
          rawDoc = byEmail;
        }
      }
    }

    // Second click / duplicate request: token cleared but user is already verified
    if (!rawDoc && emailLookup) {
      const already = await coll.findOne({ email: emailLookup });
      if (already && already.isVerified === true) {
        return res.status(200).json({
          success: true,
          message: 'Email already verified',
          data: {
            user: {
              id: already._id,
              email: already.email,
              isVerified: true,
            },
          },
        });
      }
    }

    if (!rawDoc) {
      throw new ApiError(400, 'Invalid verification token. Please check your email and try again.');
    }

    const expRaw = rawDoc.emailVerificationExpire;
    const expMs =
      expRaw == null
        ? 0
        : expRaw instanceof Date
          ? expRaw.getTime()
          : new Date(expRaw).getTime();

    if (!expMs || Number.isNaN(expMs) || expMs <= Date.now()) {
      throw new ApiError(400, 'Verification token has expired. Please request a new verification email.');
    }

    const user = await User.findById(rawDoc._id);
    if (!user) {
      throw new ApiError(400, 'Invalid verification token. Please check your email and try again.');
    }

    // Verify email
    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save();

    // Send success email
    try {
      await sendEmailVerificationSuccessEmail(user.email);
    } catch (emailError) {
      console.error('Failed to send verification success email:', emailError);
      // Don't fail verification if email fails
    }

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          isVerified: user.isVerified,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Resend verification email
 * @route   POST /api/auth/resend-verification
 * @access  Private
 */
const resendVerificationEmail = async (req, res, next) => {
  try {
    const user = await User.findById(req.user?.id).select(
      '+emailVerificationToken +emailVerificationExpire'
    );
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    if (user.isVerified) {
      throw new ApiError(400, 'Email is already verified');
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');

    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    await user.save({ validateBeforeSave: false });

    // Send verification email
    try {
      const verificationUrl = storefrontVerifyEmailUrl(verificationToken, user.email);
      await sendEmailVerificationEmail(user.email, verificationToken, verificationUrl);
    } catch (emailError) {
      // If email fails, remove the token
      user.emailVerificationToken = undefined;
      user.emailVerificationExpire = undefined;
      await user.save({ validateBeforeSave: false });
      throw new ApiError(500, 'Email could not be sent. Please try again later.');
    }

    res.status(200).json({
      success: true,
      message: 'Verification email sent successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user email
 * @route   PUT /api/auth/update-email
 * @access  Private
 */
const updateEmail = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ApiError(400, 'Email and password are required');
    }

    const user = await User.findById(req.user?.id).select('+password');
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new ApiError(401, 'Password is incorrect');
    }

    // Check if new email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser._id.toString() !== user._id.toString()) {
      throw new ApiError(409, 'Email already in use');
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');

    user.email = email;
    user.isVerified = false; // Reset verification status
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    await user.save();

    // Send verification email to new address
    try {
      const verificationUrl = storefrontVerifyEmailUrl(verificationToken, user.email);
      await sendEmailVerificationEmail(user.email, verificationToken, verificationUrl);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Don't fail email update if email fails
    }

    res.status(200).json({
      success: true,
      message: 'Email updated successfully. Please verify your new email address.',
      data: {
        user: {
          id: user._id,
          email: user.email,
          isVerified: user.isVerified,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  registerCustomer,
  login,
  refreshToken,
  getCurrentUser,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
  updateEmail,
};

