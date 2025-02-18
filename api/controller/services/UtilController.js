var CryptoJS = require("crypto-js");
const responseCode = require("../../../config/responseCode").returnCode;
const PrettyConsole = require("../../../utils/PrettyConsole");
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
const connection = require("../../../config/connection");
const prettyConsole = new PrettyConsole();

module.exports = {
  sendSuccess: async (req, res, next, data) => {
    if (module.exports.isEmpty(data.responseCode)) {
      data["responseCode"] = responseCode.validSession;
    }
    res.status(200).send({
      message: "success",
      code: responseCode.success,
      data: data,
    });
  },
  sendError: async (req, res, next, err) => {
    prettyConsole.error(
      "Error message: " +
        err?.message +
        ".   " +
        err.stack.split("\n")[1] +
        " " +
        err.stack.split("\n")[2]
    ); // remove in production
    const message = err?.message || "failure Occured";
    res.status(500).send({
      message,
      code: responseCode.error,
    });
  },
  isEmpty: (data) => {
    let returnObj = false;
    if (
      typeof data === "undefined" ||
      data === null ||
      data === "" ||
      data.length === 0
    ) {
      returnObj = true;
    }
    return returnObj;
  },
  throwError: (errorMessage) => {
    throw new Error(errorMessage);
  },

  comparePassword: (passwordHash, userPassword) => {
    let returnObj = responseCode.passwordMismatch;
    try {
      // Decrypt
      const isMatching = bcrypt.compareSync(userPassword, passwordHash);
      if (isMatching) {
        returnObj = responseCode.passwordMatched;
      }
    } catch (err) {
      returnObj = responseCode.userException;
    } finally {
      return returnObj;
    }
  },
  createToken: (data, expiresIn = 36000) => {
    try {
      return jwt.sign({ ...data }, connection.passwordSecretKey, {
        expiresIn, //sec
      });
    } catch (error) {
      return null;
    }
  },
  verifyToken: (token) => {
    try {
      var decoded = jwt.verify(token, connection.passwordSecretKey);
      return decoded;
    } catch (err) {
      return null;
    }
  },
  /**
   * Validates if the provided email format is correct.
   * @param {string} email - The email address to validate.
   * @returns {boolean} `true` if the email format is valid, otherwise `false`.
   */
  isValidEmail: function (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  checkPasswordStrength: (password) => {
    // Regular expression for password strength criteria
    const lengthRegex = /^.{8,}$/; // Password must be at least 8 characters long
    const upperCaseRegex = /[A-Z]/; // Password must contain at least one uppercase letter
    const lowerCaseRegex = /[a-z]/; // Password must contain at least one lowercase letter
    const numberRegex = /[0-9]/; // Password must contain at least one number
    const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/; // Password must contain at least one special character

    // Check password strength and returns the text accrdingly
    if (!lengthRegex.test(password)) {
      return "Password must be at least 8 characters long";
    }
    if (!upperCaseRegex.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!lowerCaseRegex.test(password)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!numberRegex.test(password)) {
      return "Password must contain at least one number";
    }
    if (!specialCharRegex.test(password)) {
      return "Password must contain at least one special character";
    }

    return false;
  },
  hashPassword: (password) => {
    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(password, salt);
    return hash;
  },
  addUserToHeader: (req, userObj) => {
    req.user = { ...req?.user, ...userObj };
  },
};
