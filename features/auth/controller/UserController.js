let request = require("request");
let mongoose = require("mongoose");
var CryptoJS = require("crypto-js");
const connection = require("../../../config/connection");
const returnCode = require("../../../config/responseCode").returnCode;
const User = require("../model/User");
const UtilController = require("../../../api/controller/services/UtilController");
const Common = require("../../../api/controller/Common");
const {
  addUserToHeader,
} = require("../../../api/controller/services/UtilController");

module.exports = {
  // this function is used to check the user login status, does their session is there or not before login

  accountLoginStatus: async function (req, res, next) {
    try {
      let responseCode = returnCode.invalidSession;

      if (UtilController.isEmpty(req.user._id)) {
        return UtilController.throwError("User id is not found");
      }
      const user = await User.findById(req.user._id)
        .select("first_name last_name email mobileNo userName userType ")
        .populate("permission")
        .lean();

      UtilController.sendSuccess(req, res, next, {
        responseCode,
        result: user,
      });
    } catch (err) {
      UtilController.sendError(req, res, next, err);
    }
  },
  emailLogin: async function (req, res, next) {
    try {
      let userCode = returnCode.validEmail;
      let userName = req.body.email?.trim();
      let password = req.body.password;

      // check the user name and password is found in body
      if (UtilController.isEmpty(userName)) {
        return UtilController.throwError("Username is empty");
      }
      if (UtilController.isEmpty(password)) {
        return UtilController.throwError("Password not found");
      }

      // check the email is found in database in same userName and userType only one acc be registered
      let emailCheck = await User.findOne({
        userName,
      })
        .select("first_name last_name email role id password")
        .lean();

      // checks the email already exist
      if (UtilController.isEmpty(emailCheck)) {
        return UtilController.throwError("Email is not registered");
      }
      //gets the password of the user
      //return password match or mismatch return code
      userCode = UtilController.comparePassword(
        emailCheck.password,
        password,
        connection.passwordSecretKey
      );

      // if the password didnt match send the error message
      if (userCode !== returnCode.passwordMatched) {
        await User.findOneAndUpdate(
          {
            userName,
          },
          {
            $inc: {
              passwordAttempt: 1, // adds the attempt
            },
          }
        );
        UtilController.throwError("Password mismatch please try again");
      }

      addUserToHeader(req, emailCheck);

      const result = await User.findOneAndUpdate(
        {
          userName,
        },
        {
          lastLogin: Math.floor(Date.now() / 1000),
        },
        {
          new: true,
        }
      ).lean();

      let token = UtilController.createToken(result, connection.tokenTime);

      UtilController.sendSuccess(req, res, next, {
        responseCode: userCode,
        result,
        token,
      });
    } catch (err) {
      UtilController.sendError(req, res, next, err);
    }
  },
  create: async (req, res, next) => {
    try {
      let createObj = req.body;
      createObj["userName"] = req.body.email;

      let user = {};
      let userCode = returnCode.validSession;

      let userResult = await User.countDocuments({
        userName: createObj?.userName, //either mobile no or email will be taken as unique value
      });

      if (userResult !== 0) {
        // it means already the account exists throw the error
        return UtilController.throwError(
          "Account already exists Please try logging in"
        );
      }
      // email verification
      if (!UtilController.isValidEmail(createObj?.email)) {
        return UtilController.throwError("Please provide a valid email");
      }
      // password strength check
      const passwordStrength = UtilController.checkPasswordStrength(
        createObj?.password
      );
      if (passwordStrength) {
        UtilController.throwError(passwordStrength);
      }

      // hash the password

      let userPassword = createObj["password"];
      let hash = UtilController.hashPassword(userPassword);
      createObj["password"] = hash.toString();

      // count the tag and increase the tag number so it is a unique value
      const tagResult = await Common.getTag("user");

      createObj["id"] = tagResult?.sequenceNo;

      createObj["lastLogin"] = Math.floor(Date.now() / 1000);

      userResult = await User.create(createObj);
      // check the user is created or not
      if (UtilController.isEmpty(userResult)) {
        UtilController.throwError("Error Occured while creating user");
      }

      user = await User.findById(userResult._id)
        .select("first_name last_name email  userName  role ")
        .lean();

      addUserToHeader(req, user);

      UtilController.sendSuccess(req, res, next, {
        responseCode: userCode,
        result: user,
        message: "User is Created successfully",
      });
    } catch (err) {
      UtilController.sendError(req, res, next, err);
    }
  },
};
