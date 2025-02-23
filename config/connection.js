require("dotenv").config();

module.exports = {
  dbUrl: process.env.DATABASE_URL,
  passwordSecretKey: process.env.TOKEN_KEY,
  tokenTime: 36000,
  mailCredentials: {
    from: "john986310@gmail.com",
    gmailTransaporter: {
      service: "Gmail",
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: "john986310@gmail.com",
        pass: process.env.GMAIL_PASSWORD,
      },
    },
  },
};
