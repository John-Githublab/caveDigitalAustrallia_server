var express = require("express");
var router = express.Router();

const UserController = require("../features/auth/controller/UserController");
const TaskController = require("../features/task/controller/TaskController");

router.use(function (req, res, next) {
  // middleware specifc for auth route
  next();
});

// user authentication apis
router.route("/auth/signup").post(UserController.create);
router.route("/auth/login").post(UserController.emailLogin);
router.route("/islogin").get(UserController.accountLoginStatus);
router.route("/trigger/email").get(UserController.triggerMail);
router.route("/verify/otp").post(UserController.verifyOtp);

// task route
router.route("/tasks").post(TaskController.create);
router.route("/tasks").get(TaskController.list);
router.route("/tasks/:id").get(TaskController.view);
router.route("/tasks/:id").put(TaskController.update);
router.route("/tasks/:id").delete(TaskController.delete);

module.exports = router;
