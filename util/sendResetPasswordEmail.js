const sendEmail = require("./sendEmail");

const sendResetPasswordEmail = async ({
  email,
  name,
  passwordToken,
  origin,
}) => {
  const verifyEmail = `${origin}/user/reset-password?token=${passwordToken}&email=${email}`;
  const message = `<p>Please click on the following link to reset your password <a href="${verifyEmail}">Verify email</a></p>`;

  console.log("verifyemail is ", verifyEmail);
  await sendEmail({
    to: email,
    html: `<h1>Hello ${name}</h1>
    ${message}`,
    subject: "Reset password",
  });
};

module.exports = sendResetPasswordEmail;
