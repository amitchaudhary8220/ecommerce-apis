const sendEmail = require("./sendEmail");

const sendVerificationEmail = async ({
  email,
  name,
  verificationToken,
  origin,
}) => {
  const verifyEmail = `${origin}/user/verify-email?token=${verificationToken}&email=${email}`;
  const message = `<p>Please click on the following link to verify your email <a href="${verifyEmail}">Verify email</a></p>`;

  await sendEmail({
    to: email,
    html: `<h1>Hello ${name}</h1>
    ${message}`,
    subject: "Email verification",
  });
};

module.exports = sendVerificationEmail;
