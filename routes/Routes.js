var express = require("express");
var router = express.Router();

const UserController = require("../features/auth/controller/UserController");

router.use(function (req, res, next) {
  // middleware specifc for auth route
  next();
});

// user authentication apis
router.route("/auth/register").post(UserController.create);
router.route("/auth/login").post(UserController.emailLogin);
router.route("/users/profile").get(UserController.profileInfo);
router.route("/islogin").get(UserController.accountLoginStatus);

module.exports = router;
