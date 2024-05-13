const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const {
  createTokenUser,
  attachCookieToResponse,
  checkPermissions,
} = require("../util");

const getAllUsers = async (req, res) => {
  const users = await User.find({ role: "user" }).select("-password");
  res.status(StatusCodes.OK).json({ users });
};

const getSingleUser = async (req, res) => {
  const id = req?.params?.id;
  if (!id) {
    throw new CustomError.NotFoundError("user id is not found");
  }
  const user = await User.findById({ _id: id }).select("-password");

  if (!user) {
    throw new CustomError.NotFoundError(`User not found with id ${id}`);
  }

  checkPermissions(req.user, user._id);

  res.status(StatusCodes.OK).json({ user });
};

const showCurrentUser = async (req, res) => {
  res.status(StatusCodes.OK).json({ user: req.user });
};

const updateUser = async (req, res) => {
  const { email, name } = req.body;
  if (!email || !name) {
    throw new CustomError.UnauthenticatedError(
      "Please provide both email and name"
    );
  }

  // const user = await User.findOneAndUpdate(
  //   { _id: req.user.userId },
  //   { email, name },
  //   {
  //     new: true,  //it is used to return the new document , rather than giving the old document
  //     runValidators: true,
  //   }
  // );

  const user = await User.findById({ _id: req.user.userId });
  if (!user) {
    throw new CustomError.NotFoundError("no user found to update");
  }

  user.email = email;
  user.name = name;

  user.save();

  const userJson = createTokenUser(user);
  attachCookieToResponse({ res, user: userJson });

  res.status(StatusCodes.OK).json({ user: userJson });
  // res.send("update user");
};

const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    throw new CustomError.UnauthenticatedError("Both password must present");
  }
  const user = await User.findById({ _id: req.user.userId });

  const isPasswordValid = user.comparePassword(oldPassword);
  if (!isPasswordValid) {
    throw new CustomError.UnauthenticatedError("Invalid credentials");
  }

  user.password = newPassword;
  user.save();

  res.status(StatusCodes.OK).json({ msg: "password updated successfully" });
};

module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
};
