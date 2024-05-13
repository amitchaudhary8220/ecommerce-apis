require("dotenv").config();
const jwt = require("jsonwebtoken");

const secretKey = process.env.JWT_SECRET;
const validTime = process.env.JWT_LIFETIME;

const generateToken = ({ payload }) => {
  const token = jwt.sign(payload, secretKey);
  return token;
};

const isValidToken = (token) => jwt.verify(token, secretKey); //will return the payload

const attachCookieToResponse = ({ res, user, refreshToken }) => {
  const accessTokenJWT = generateToken({ payload: { user } });
  const refreshTokenJWT = generateToken({ payload: { user, refreshToken } });

  const oneDay = 1000 * 60 * 60 * 24;
  const longExp = 1000 * 60 * 60 * 24 * 10;

  res.cookie("accessToken", accessTokenJWT, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    signed: true,
    expires: new Date(Date.now() + oneDay),
  });

  res.cookie("refreshToken", refreshTokenJWT, {
    httpOnly: true,
    expires: new Date(Date.now() + longExp),
    secure: process.env.NODE_ENV === "production",
    signed: true,
  });
};

// const attachSingleCookieToResponse = ({ res, user }) => {
//   const token = generateToken({ payload: user });

//   const oneDay = 1000 * 60 * 60 * 24;

//   res.cookie("token", token, {
//     httpOnly: true,
//     expires: new Date(Date.now() + oneDay),
//     // secure: process.env.NODE_ENV === "production",
//     // signed: true,
//   });
// };

module.exports = {
  generateToken,
  isValidToken,
  attachCookieToResponse,
};
