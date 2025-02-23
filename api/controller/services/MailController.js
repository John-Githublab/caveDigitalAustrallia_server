const nodemailer = require("nodemailer");
const { mailCredentials } = require("../../../config/connection");
module.exports = {
  transporter: nodemailer.createTransport(mailCredentials.gmailTransaporter),
  OtpTemplate: (to, data) => {
    const { otp } = data;
    return {
      from: mailCredentials.from,
      to,
      subject: "Hello from Application",
      text: `Here is your otp ${otp} and will expire in 2 minutes.`,
    };
  },
  sendMail: async (to, data) => {
    try {
      const mailOptions = module.exports.OtpTemplate(to, data);
      const info = await module.exports.transporter.sendMail(mailOptions);
      return { success: true, data: info.response };
    } catch (error) {
      return { success: false, data: error };
    }
  },
};
