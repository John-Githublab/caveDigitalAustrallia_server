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
const { sendMail } = require("../../../api/controller/services/MailController");
const OTP = require("../../../models/OTP");

module.exports = {
  // this function is used to check the user login status, does their session is there or not before login

  accountLoginStatus: async function (req, res, next) {
    try {
      let responseCode = returnCode.invalidSession;
      console.log(req.user);

      if (UtilController.isEmpty(req.user._id)) {
        return UtilController.throwError("User id is not found");
      }
      const user = await User.findById(req.user._id)
        .select("first_name last_name email mobileNo userName userType ")
        .populate("permission")
        .lean();

      responseCode = returnCode?.validSession;

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
  triggerMail: async function (req, res, next) {
    try {
      let responseCode = returnCode.invalidSession;
      const userId = req.query?.email;

      if (UtilController.isEmpty(userId)) {
        return UtilController.throwError("Email id is not found");
      }
      const user = await User.count({ userName: userId });

      if (user === 0) {
        return UtilController.throwError("Email doesnt exist ");
      }
      // generates otp
      // triggers the mail to user and check any error occured
      const otp = Math.floor(100000 + Math.random() * 900000);

      const mailSend = await sendMail(userId, { otp });

      if (UtilController.isEmpty(mailSend?.success)) {
        return UtilController.throwError(
          "An error occured while sending mail. please try again"
        );
      }
      // remove existing otps for the same credentails
      await OTP.deleteMany({ userId });
      // store the otp and email in database
      await OTP.create({ otp, userId });

      responseCode = returnCode?.validSession;

      UtilController.sendSuccess(req, res, next, {
        responseCode,
        message: "The OTP has been successfully sent to your email.",
      });
    } catch (err) {
      UtilController.sendError(req, res, next, err);
    }
  },
  verifyOtp: async function (req, res, next) {
    try {
      let responseCode = returnCode.invalidSession;
      const otp = req.body?.otp;
      const userId = req.body?.email;

      if (UtilController.isEmpty(userId)) {
        return UtilController.throwError("Email id is not found");
      }

      if (UtilController.isEmpty(otp)) {
        return UtilController.throwError("Otp is empty");
      }

      const record = await OTP.findOne({ userId }).lean();

      const otpValue = record?.otp;
      if (Number(otp) !== Number(otpValue)) {
        return UtilController.throwError("OTP is not matching try again!");
      }

      await OTP.deleteOne({ userId });

      const user = await User.findOne({ userName: userId }).lean()

      console.log(user);
      

      const hash = UtilController.createToken({ ...user });

      responseCode = returnCode.validSession;

      UtilController.sendSuccess(req, res, next, {
        responseCode,
        message: "OTP verification successful",
        result: { temporaryToken: hash },
      });
    } catch (err) {
      UtilController.sendError(req, res, next, err);
    }
  },
  updatePassword: async (req, res, next) => {
    try {
      const password = req.body.password;
      const userId = req.user._id;

      if (UtilController.isEmpty(password)) {
        UtilController.throwError("Password is empty");
      }

      // password strength check
      const passwordStrength = UtilController.checkPasswordStrength(password);
      if (passwordStrength) {
        UtilController.throwError(passwordStrength);
      }

      // hash the password

      let userPassword = password;

      let hash = UtilController.hashPassword(userPassword);
      const hashedPassword = hash.toString();
      console.log(hashedPassword, req.user);

      await User.findByIdAndUpdate(userId, {
        $set: { password: hashedPassword },
      });

      UtilController.sendSuccess(req, res, next, {
        responseCode: returnCode.validSession,
        message: "User Password updated successfully please try logging in",
      });
    } catch (err) {
      UtilController.sendError(req, res, next, err);
    }
  },
};
