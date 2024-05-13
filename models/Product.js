const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Please provide product name"],
      maxlength: [100, "Name can not be more than 100 characters"],
    },
    price: {
      type: Number,
      required: [true, "Please provide product name"],
      default: 0,
    },
    description: {
      type: String,
      required: [true, "Please provide product description"],
      maxlength: [1000, "Description can not be more than 1000 characters"],
    },
    image: {
      type: String,
      default: "/uploads/example.jpg",
    },
    category: {
      type: String,
      required: [true, "Please provide product category"],
      enum: {
        values: ["office", "kitchen", "bedroom"],
        message: "{Value} is not supported",
      },
    },
    company: {
      type: String,
      required: [true, "Please provide company"],
      enum: {
        values: ["ikea", "liddy", "marcos"],
        message: "{Value} is not supported",
      },
    },
    colors: {
      type: [String],
      requied: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    freeShipping: {
      type: Boolean,
      default: false,
    },
    inventory: {
      type: Number,
      required: true,
      default: 15,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    numOfReviews: {
      type: String,
      default: 0,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true, //By default, Mongoose does not include virtuals when you convert a document to JSON. For example, if you pass a document to Express' res.json() function, virtuals will not be included by default.
    },
    toObject: {
      virtuals: true, //By default, Mongoose does not include virtuals in console.log() output. To include virtuals in console.log(), you need to set the toObject schema option to { virtuals: true }, or use toObject() before printing the object.
    },
  }
);

//Mongoose also supports populating virtuals. A populated virtual contains documents from another collection
ProductSchema.virtual("reviews", {
  ref: "Review", // from which model this virtual belongs to
  localField: "_id",
  foreignField: "product",
  justOne: false,
  //can also provided match here
});

//since these are virtuals , we can not query it

ProductSchema.pre("remove", async function (next) {
  //next is now optional in current version of mongoose
  await this.model("Review").deleteMany({ product: this._id }); // In Mongoose, the this.model function is used to access the Mongoose model associated with a particular document.
});

module.exports = mongoose.model("Product", ProductSchema);
