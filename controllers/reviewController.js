const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const Product = require("../models/Product");
const Review = require("../models/Review");
const { checkPermissions } = require("../util");

const getAllReviews = async (req, res) => {
  const reviews = await Review.find({})
    .populate({ path: "product", select: "name company price" })
    .populate({ path: "user", select: "name" });

  res.status(StatusCodes.OK).json({ reviews });
};

const createReview = async (req, res) => {
  const { product: productId } = req.body;

  const isValidProduct = await Product.findOne({ _id: productId });
  if (!isValidProduct) {
    throw new CustomError.NotFoundError(
      `No product found with id ${productId}`
    );
  }

  const alreadySubmitted = await Review.findOne({
    product: productId,
    user: req.user.userId,
  });

  if (alreadySubmitted) {
    throw new CustomError.BadRequestError(
      "Already submitted review for this product"
    );
  }

  req.body.user = req.user.userId;

  const review = await Review.create(req.body);

  res.status(StatusCodes.CREATED).json({ review });
};

const getSingleReview = async (req, res) => {
  const { id: reviewId } = req.params;

  const review = await Review.findOne({ _id: reviewId })
    .populate({
      path: "product",
      select: "name company price",
    })
    .populate({ path: "user", select: "name" });
  if (!review) {
    throw new CustomError.NotFoundError(`No review found with id ${reviewId}`);
  }
  res.status(StatusCodes.OK).json({ review });
};

const updateReview = async (req, res) => {
  const { id: reviewId } = req.params;
  const { title, comment, rating } = req.body;

  const review = await Review.findOne({ _id: reviewId });

  if (!review) {
    throw new CustomError.NotFoundError(`No review found with id ${reviewId}`);
  }

  checkPermissions(req.user, review.user);
  review.title = title;
  review.comment = comment;
  review.rating = rating;

  await review.save();

  res.status(StatusCodes.OK).json({ review });
};

const deleteReview = async (req, res) => {
  const { id: reviewId } = req.params;

  const review = await Review.findOne({ _id: reviewId });
  if (!review) {
    throw new CustomError.NotFoundError(`No review found with id ${reviewId}`);
  }

  checkPermissions(req.user, review.user);

  await review.remove();

  res.status(StatusCodes.OK).json({ msg: "Success! Review removed" });
};

module.exports = {
  getAllReviews,
  createReview,
  getSingleReview,
  updateReview,
  deleteReview,
};
