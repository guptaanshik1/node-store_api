const nodemailer = require("nodemailer");

const mailHelper = async (option) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER, // generated ethereal user
      pass: process.env.SMTP_PASS, // generated ethereal password
    },
  });

  const message = {
    from: 'anshikg2021@gmail.com', // sender address
    to: option.email, // list of receivers
    subject: option.subject, // Subject line
    text: option.message, // plain text body

    // these fields are coming from option
  };

  await transporter.sendMail(message);
};

module.exports = mailHelper;