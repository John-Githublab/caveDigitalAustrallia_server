let request = require("request");
const returnCode = require("../../../config/responseCode").returnCode;
const Task = require("../models/Task");
const UtilController = require("../../../api/controller/services/UtilController");

module.exports = {
  list: async (req, res, next) => {
    try {
      const queryObj = {};

      queryObj["operatedBy"] = req.user?._id;

      const sortOrder = {
        updatedAt: -1,
      };

      let result = await Task.find(queryObj)
        .sort(sortOrder)
        .select("title description priority status")
        ?.lean();

      UtilController.sendSuccess(req, res, next, {
        responseCode: returnCode.validSession,
        result,
      });
    } catch (err) {
      UtilController.sendError(req, res, next, err);
    }
  },
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

      taskObj["operatedBy"] = req.user?._id;

      const result = await Task.create(taskObj);

      UtilController.sendSuccess(req, res, next, {
        responseCode: returnCode.validSession,
        result,
      });
    } catch (err) {
      UtilController.sendError(req, res, next, err);
    }
  },
  update: async (req, res, next) => {
    try {
      const body = req.body;
      const taskObj = {};
      const recordId = req.params?.id;
      // title is a mandatory field
      if (UtilController.isEmpty(recordId)) {
        return UtilController.throwError("Id is a required field");
      }
      if (taskObj?.title) {
        taskObj["title"] = body?.title;
      }
      if (taskObj?.title) {
        taskObj["description"] = body?.description;
      }

      if (body?.priority) {
        taskObj["priority"] = body?.priority;
      }
      if (body?.status) {
        taskObj["status"] = body?.status;
      }

      taskObj["operatedBy"] = req.user?._id;
      taskObj["updated_at"] = Math.floor(Date.now() / 1000);

      const result = await Task.findByIdAndUpdate(recordId, taskObj);

      UtilController.sendSuccess(req, res, next, {
        responseCode: returnCode.validSession,
        result,
      });
    } catch (err) {
      UtilController.sendError(req, res, next, err);
    }
  },
  view: async (req, res, next) => {
    try {
      const recordId = req.params?.id;
      // title is a mandatory field
      if (UtilController.isEmpty(recordId)) {
        return UtilController.throwError("Task Id is a required field");
      }

      const viewObj = { _id: recordId };

      const result = await Task.findOne(viewObj)
        .select("title description priority status")
        ?.lean();

      UtilController.sendSuccess(req, res, next, {
        responseCode: returnCode.validSession,
        result,
      });
    } catch (err) {
      UtilController.sendError(req, res, next, err);
    }
  },
  delete: async (req, res, next) => {
    try {
      const recordId = body?.recordId;
      // title is a mandatory field
      if (UtilController.isEmpty(recordId)) {
        return UtilController.throwError("Task Id is a required field");
      }

      const deleteObj = { _id: recordId };

      await Task.findOneAndDelete(deleteObj);

      UtilController.sendSuccess(req, res, next, {
        responseCode: returnCode.validSession,
        message: "Successfully deleted the Task",
      });
    } catch (err) {
      UtilController.sendError(req, res, next, err);
    }
  },
};
