require("dotenv").config();

module.exports = {
  dbUrl: process.env.DATABASE_URL,
  passwordSecretKey:process.env.TOKEN_KEY
};
