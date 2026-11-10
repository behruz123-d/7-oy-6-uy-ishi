const nodemailer = require("nodemailer")

const emailSender = async (email, code) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GOOGLE_EMAIL,
      pass: process.env.GOOGLE_PASS
    }
  })

  const info = await transporter.sendMail({
    from: process.env.GOOGLE_EMAIL,
    to: email,
    subject: "Hello",
    text: "Verification code",
    html: `<b>Your code: ${code}</b>`
  })

  console.log("Message sent:", info.messageId);
  console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
}

module.exports = emailSender
