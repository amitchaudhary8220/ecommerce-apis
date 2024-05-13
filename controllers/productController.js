const Product = require("../models/Product");
const CustomError = require("../errors");
const { StatusCodes } = require("http-status-codes");
const { isNullOrUndefined } = require("../util");
const path = require("path");
const Review = require("../models/Review");

const createProduct = async (req, res) => {
  req.body.user = req.user.userId;
  const product = await Product.create(req.body);
  res.status(StatusCodes.CREATED).json({ product });
};

const getAllProducts = async (req, res) => {
  const products = await Product.find({});
  res.status(StatusCodes.OK).json({ products });
};

const getSingleProduct = async (req, res) => {
  const { id: productId } = req.params;
  if (isNullOrUndefined(productId)) {
    throw new CustomError.NotFoundError("Please provide product_id");
  }
  const product = await Product.findById({ _id: productId }).populate({
    path: "reviews",
    select: "title comment rating", // or select:{title:1,comment:1,rating:1}
  });
  res.status(StatusCodes.OK).json({ product });
};

const updateProduct = async (req, res) => {
  const { id: productId } = req.params;
  if (!productId) {
    throw new CustomError.NotFoundError("Please provide product_id");
  }
  const updatedProduct = await Product.findOneAndUpdate(
    { _id: productId },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(StatusCodes.OK).json({ updatedProduct });
};

const deleteProduct = async (req, res) => {
  const { id: productId } = req.params;
  if (!productId) {
    throw new CustomError.NotFoundError(
      "Please provide the product_id of product to be deleted"
    );
  }
  const product = await Product.findOne({ _id: productId });
  if (!product) {
    throw new CustomError.NotFoundError("No product found with given id");
  }

  await product.remove();

  res.status(StatusCodes.OK).json({ msg: "Success! product removed" });
};

const uploadImage = async (req, res) => {
  if (!req?.files) {
    throw new CustomError.BadRequestError("No image uploaded");
  }
  const productImage = req?.files?.image;

  if (!productImage?.mimetype?.startsWith("image")) {
    throw new CustomError.BadRequestError("Please upload image");
  }

  const maxSize = 1024 * 1024;

  if (productImage.size > maxSize) {
    throw new CustomError.BadRequestError(
      "Please upload image smaller than 1MB"
    );
  }

  const imagePath = path.join(
    __dirname,
    "../public/uploads/",
    `${productImage?.name}`
  );

  await productImage.mv(imagePath); //moves the upload file to provided path

  res.status(StatusCodes.OK).json({ image: `/uploads/${productImage.name}` });
};

const getSingleProductReviews = async (req, res) => {
  const { id: productId } = req.params;

  const reviews = await Review.find({ product: productId });

  res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
};

module.exports = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
  getSingleProductReviews,
};
