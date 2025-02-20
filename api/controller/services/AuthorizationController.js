const authorization = require("../../../config/authorization");
const UtilController = require("./UtilController");
const { returnCode } = require("../../../config/responseCode");

const authList = [];

for (var i = 0; i < authorization.user.authNotRequire.length; i++) {
  authList.push("/api" + authorization.user.authNotRequire[i]);
}

module.exports = {
  checkRequestAuth: async function (req, res, next) {
    // checks the url is admin and private then goes for verification

    try {
      if (req.path.startsWith("/api") && authList.indexOf(req.path) <= -1) {
        module.exports.checkAuthenticated(req, res, next);
      } else {
        next();
      }
    } catch (err) {
      console.error(err);
    }
  },
  checkAuthenticated: async function (req, res, next) {
    try {
      const bearerHeader = req.headers["authorization"]?.split(" ")?.pop();
      let authtoken = req.headers.authtoken || bearerHeader;

      if (UtilController.isEmpty(authtoken)) {
        return UtilController.sendSuccess(req, res, next, {
          responseCode: returnCode.invalidSession,
        });
      }
      // retrieves data from token and if the token is expired it throws and error
      let authTokenData = UtilController.verifyToken(authtoken);
      UtilController.addUserToHeader(req, authTokenData);
      console.log(req);

      next();
    } catch (err) {
      UtilController.sendError(req, res, next, err);
    }
  },
};
