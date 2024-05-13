const mongoose = require("mongoose");
const { aggregate } = require("./Product");

const ReviewSchema = mongoose.Schema(
  {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, "Please provide rating"],
    },
    title: {
      type: String,
      trim: true,
      required: [true, "Please provide review title"],
      maxlength: 100,
    },
    comment: {
      type: String,
      required: [true, "Please provide review text"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

ReviewSchema.index({ product: 1, user: 1 }, { unique: 1 }); //user can have only one review for the product

//The line ReviewSchema.index({ product: 1, user: 1 }, { unique: 1 }); is creating a compound index on the "product" and "user" fields

//This compound index ensures that the combination of "product" and "user" values must be unique in the Review collection
//means a userId can not present twice with a same productId, it means same user can review twice the same product, to review again product must be different if user is same

ReviewSchema.statics.averageRating = async function (productId) {
  const result = await this.aggregate([
    // Stage 1: Filter reviews  documents by product
    {
      $match: {
        product: productId,
      },
    },
    // Stage 2: Group remaining documents by product and calculate average rating and numOfReviews
    {
      $group: {
        _id: "$product",
        averageRating: { $avg: "$rating" },
        numOfReviews: { $sum: 1 },
      },
    },
  ]);

  try {
    await mongoose.model("Product").findOneAndUpdate(
      { _id: productId },
      {
        numOfReviews: result[0]?.numOfReviews,
        averageRating: Math.ceil(result[0]?.averageRating),
      }
    );
  } catch (e) {result
    console.log(e);
  }
};
ReviewSchema.post("save", async function () {
  await this.constructor.averageRating(this.product); //this.constructor is used to access the model associated with a particular document.  and then accessing the static method of that perticular model
});

ReviewSchema.post("remove", async function () {
  await this.constructor.averageRating(this.product);
});
module.exports = mongoose.model("Review", ReviewSchema);
