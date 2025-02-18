let request = require("request");
const returnCode = require("../../../config/responseCode").returnCode;
const Task = require("../models/Task");
const UtilController = require("../../../api/controller/services/UtilController");

module.exports = {
  create: async (req, res, next) => {
    try {
      const body = req.body;
      const taskObj = {};
      // title is a mandatory field
      if (UtilController.isEmpty(body?.title)) {
        return UtilController.throwError("Title is a required field");
      }

      taskObj["title"] = body?.title;
      taskObj["description"] = body?.description;

      if (body?.priority) {
        taskObj["priority"] = body?.priority;
      }
      if (body?.status) {
        taskObj["status"] = body?.status;
      }

      result = await Task.create(taskObj);

      UtilController.sendSuccess(req, res, next, {
        responseCode: returnCode.validSession,
        result,
      });
    } catch (err) {
      UtilController.sendError(req, res, next, err);
    }
  },
};
