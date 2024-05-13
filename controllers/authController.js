const User = require("../models/User");
const mongoose = require("mongoose");
const { attachCookieToResponse, createTokenUser } = require("../util");

const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendVerificationEmail = require("../util/sendVerificationEmail");
const Token = require("../models/Token");
const sendResetPasswordEmail = require("../util/sendResetPasswordEmail.js");

const register = async (req, res) => {
  const { email, name, password } = req.body;

  const emailAlreadyExists = await User.findOne({ email });
  if (emailAlreadyExists) {
    throw new CustomError.BadRequestError("Email already exits");
  }

  //   const isFirstAccount=(await User.countDocuments({}))===0;

  //   const role=isFirstAccount?'admin':'user';

  const verificationToken = crypto.randomBytes(40).toString("hex");
  const user = await User.create({ email, name, password, verificationToken });
  await sendVerificationEmail({
    email: user.email,
    name: user.name,
    verificationToken: user.verificationToken,
    origin: req.get("origin"),
  });
  //only sending back the token to test

  res.status(StatusCodes.CREATED).json({
    msg: "Please verify your email",
  });

  // const jsonUser = createTokenUser(user);

  // //instead of sending back the token to client we can set token in cookies so that we can get them without passing in every request

  // attachCookieToResponse({ res, user: jsonUser });
  // res.status(StatusCodes.CREATED).json({ user: jsonUser });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    throw new CustomError.BadRequestError("Please register before login");
  }
  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    throw new CustomError.BadRequestError("Invalid credential");
  }

  if (!user.isVerified) {
    throw new CustomError.UnauthenticatedError("Please verify your email");
  }

  const tokenUser = createTokenUser(user);

  let refreshToken = "";

  //check for existing token

  const existingToken = await Token.findOne({ user: user._id });

  if (existingToken) {
    const { isValid } = existingToken;
    if (!isValid) {
      throw new CustomError.UnauthenticatedError("Invalid credentials");
    }
    refreshToken = existingToken.refreshToken;
    attachCookieToResponse({ res, user: tokenUser, refreshToken });

    res.status(StatusCodes?.ACCEPTED).json({
      success: true,
      user: tokenUser,
      message: "user login successfully",
    });

    return;
  }

  //create refresh token

  refreshToken = crypto.randomBytes(40).toString("hex");
  const ip = req.ip;
  const userAgent = req.headers["user-agent"];

  const userToken = { refreshToken, ip, userAgent, user: user._id };

  await Token.create(userToken);

  attachCookieToResponse({ res, user: tokenUser, refreshToken });

  res.status(StatusCodes?.ACCEPTED).json({
    success: true,
    user: tokenUser,
    message: "user login successfully",
  });
};

const logout = async (req, res) => {
  await Token.findOneAndDelete({ user: req.user.userId });
  res.cookie("accessToken", "logout", {
    httpOnly: true,
    expires: new Date(Date.now + 1 * 1000),
  });
  res.cookie("refreshToken", "logout", {
    httpOnly: true,
    expires: new Date(Date.now + 1 * 1000),
  });

  res.status(StatusCodes.OK).json({ msg: "user loggedout !" });
};

const verifyEmail = async (req, res) => {
  const { verificationToken, email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw new CustomError.UnauthenticatedError("Verification failed");
  }
  if (verificationToken !== user.verificationToken) {
    throw new CustomError.UnauthenticatedError("Verification failed");
  }
  user.isVerified = true;
  user.verificationToken = "";
  await user.save();
  res.status(StatusCodes.OK).json({ msg: "Email verified succuessfully" });
};

const forgetPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new CustomError.BadRequestError("Please provide a valid email");
  }
  const user = await User.findOne({ email });

  if (user) {
    const passwordToken = crypto.randomBytes(40).toString("hex");
    console.log("req", req);
    sendResetPasswordEmail({
      origin: req.get("origin"),
      email: user.email,
      name: user.name,
      passwordToken: passwordToken,
    });
    const tenMin = 1000 * 60 * 10;
    const passwordTokenExpirationData = new Date(Date.now() + tenMin);

    user.passwordToken = passwordToken;
    user.passwordTokenExpirationData = passwordTokenExpirationData;

    await user.save();
  }

  res
    .status(StatusCodes.OK)
    .json({ msg: "Please check your email to reset your password" });
};

const resetPassword = async (req, res) => {
  const { email, password, token } = req.body;
  const user = await User.findOne({ email });
  console.log("user is ", user);
  if (!user) {
    throw new CustomError.BadRequestError("Invalid credentials");
  }
  const currentTime = new Date(Date.now());
  if (
    token !== user.passwordToken &&
    currentTime < user.passwordTokenExpirationData
  ) {
    throw new CustomError.BadRequestError("Invalid credentials");
  }
  user.password = password;
  user.passwordToken = null;
  await user.save();

  res
    .status(StatusCodes.OK)
    .json({ msg: "Password reset successfully", success: true });
};

module.exports = {
  register,
  login,
  logout,
  verifyEmail,
  forgetPassword,
  resetPassword,
};
