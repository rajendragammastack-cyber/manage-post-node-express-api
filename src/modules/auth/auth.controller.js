const jwt = require('jsonwebtoken');
const authService = require('./auth.service');
const { generateAccessToken, generateRefreshToken } = require('../../utils/generateToken');
const { sendResponse } = require('../../utils/apiResponse');

exports.register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body);

    const payload = { id: user._id };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    const safeUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      accessToken,
      refreshToken
    };

    sendResponse(res, {
      statusCode: 201,
      message: 'User registered successfully',
      data: safeUser
    });

  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const user = await authService.login(req.body);

    const payload = { id: user._id };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    sendResponse(res, {
      message: 'Login successful',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        accessToken,
        refreshToken
      }
    });

  } catch (err) {
    next(err);
  }
};

exports.me = async (req, res, next) => {
  try {
    const User = require('./auth.model');
    const user = await User.findById(req.user.id).select('name email');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    sendResponse(res, {
      message: 'OK',
      data: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Exchange a valid refresh token for a new access token (and optionally a new refresh token).
 * No auth header required – only the refresh token in the body.
 */
exports.refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ success: false, message: 'Refresh token is required' });
    }
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const payload = { id: decoded.id };
    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);
    sendResponse(res, {
      message: 'Token refreshed',
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
    }
    next(err);
  }
};
