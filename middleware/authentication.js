const CustomError = require("../errors");
const { StatusCodes } = require("http-status-codes");
const { isValidToken, attachCookieToResponse } = require("../util");
const { ref } = require("joi");
const Token = require("../models/Token");
const authenticateUser = async (req, res, next) => {
  const { accessToken, refreshToken } = req.signedCookies;
  try {
    if (accessToken) {
      const payload = isValidToken(accessToken);
      req.user = payload.user;
      next();
      return;
    }
    const payload = isValidToken(refreshToken);
    const existingToken = await Token.findOne({
      user: payload?.user?.userId,
      refreshToken: payload?.refreshToken,
    });

    if (!existingToken || !existingToken?.isValid) {
      throw new CustomError.UnauthenticatedError("Authentication failed");
    }

    attachCookieToResponse({
      res,
      user: payload.user,
      refreshToken: existingToken?.refreshToken,
    });
    req.user = payload.user;
    next();
  } catch (error) {
    throw new CustomError.UnauthenticatedError("Authentication failed");
  }
};

const authorizePermissions = (...roles) => {
  return function (req, res, next) {
    const role = req?.user?.role;
    if (!roles.includes(role)) {
      throw new CustomError.Unauthorized("Not authorized to access this route");
    }
    next();
  };
};

module.exports = {
  authenticateUser,
  authorizePermissions,
};
