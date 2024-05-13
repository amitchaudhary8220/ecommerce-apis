const mongoose = require("mongoose");
//package for validation
const validator = require("validator");
const bcrypt = require("bcryptjs");
const { string } = require("joi");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide name"],
    minlength: 3,
    maxlength: 50,
  },
  email: {
    type: String,
    unique: true, //its not the validator
    required: [true, "Please provide email"],
    validate: {
      //other ways of email validation , given in mongoose docs
      validator: validator.isEmail,
      message: "Please provide valid email",
    },
  },
  password: {
    type: String,
    required: [true, "Please provide password"],
    minlength: 6,
  },
  passwordToken: {
    type: String,
  },
  passwordTokenExpirationData: {
    type: Date,
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
  verificationToken: String,
  isVerified: {
    type: Boolean,
    default: false,
  },
  verified: Date,
});

//do this before saving
UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
  const isMatch = await bcrypt.compare(candidatePassword, this.password); //this refers to the instance on which this method will be called
  return isMatch;
};

module.exports = mongoose.model("User", UserSchema);
