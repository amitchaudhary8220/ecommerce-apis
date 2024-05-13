const express = require("express");
const router = express.Router();
const {
  authenticateUser,
  authorizePermissions,
} = require("../middleware/authentication");
const {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
} = require("../controllers/productController");

const { getSingleProductReviews } = require("../controllers/productController");

router.route("/").get(authenticateUser, getAllProducts);
router
  .route("/create")
  .post(authenticateUser, authorizePermissions("admin"), createProduct);

router
  .route("/:id")
  .get(authenticateUser, getSingleProduct)
  .patch([authenticateUser, authorizePermissions("admin")], updateProduct)
  .delete([authenticateUser, authorizePermissions("admin")], deleteProduct);
router.route("/:id/reviews").get(getSingleProductReviews);

router
  .route("/uploadImage")
  .post(authenticateUser, authorizePermissions("admin"), uploadImage);

module.exports = router;
