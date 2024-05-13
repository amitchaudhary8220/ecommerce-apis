require("dotenv").config();
require("express-async-errors");
const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const cors = require("cors");

const app = express();

// database
const connectDB = require("./db/connect.js");

//routes

const authRouter = require("./routes/authRoutes.js");
const userRouter = require("./routes/userRoutes.js");
const productRouter = require("./routes/productRoutes.js");
const reviewRouter = require("./routes/reviewRoutes.js");
const orderRouter = require("./routes/orderRoutes.js");

//middlewares

const notFoundMiddleware = require("./middleware/not-found.js");
const errorHandlerMiddleware = require("./middleware/error-handler.js");

//allow cross-origin request

app.use(cors());

app.use(morgan("tiny"));
// app.use(cookieParser()); // unsigned cookie
app.use(express.static("./public"));
app.use(fileUpload());
app.use(cookieParser(process.env.JWT_SECRET)); //  signed cookie

//convert req in json format
app.use(express.json());

app.get("/", (req, res) => {
  console.log("token in cookie", req.cookies);
  res.send("accessed get at /");
});

app.get("/api/v1", (req, res) => {
  // console.log("req is ", req.cookies);

  // console.log(req.signedCookies);
  res.send("accessed get at /");
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/orders", orderRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URL);
    app.listen(port, console.log(`Server listening to port ${port}`));
  } catch (error) {
    console.log("error occurred during db connection");
  }
};

start();
