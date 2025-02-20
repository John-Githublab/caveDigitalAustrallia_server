"use strict";
const mongoose = require("mongoose");
const PrettyConsole = require("../utils/PrettyConsole.js");
const prettyConsole = new PrettyConsole();
// if there is not database then mongodb will not initialise. but if give db url then automatically create db instance
const dbConnection = (connection) => {
  var _a;
  if (
    (connection === null || connection === void 0
      ? void 0
      : connection.dbUrl) &&
    ((_a =
      connection === null || connection === void 0
        ? void 0
        : connection.dbUrl) === null || _a === void 0
      ? void 0
      : _a.length) >= 0
  ) {
    mongoose.set("debug", false);
    mongoose.Promise = require("bluebird");
    mongoose.Promise = global.Promise;
    console.log(connection.dbUrl);

    mongoose.connect(connection.dbUrl, {
      useNewUrlParser: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    });
    let db = mongoose.connection;
    db.once("open", function () {
      var _a;
      const url = new URL(
        connection === null || connection === void 0 ? void 0 : connection.dbUrl
      );
      // Extract the database name
      const dbName =
        (_a = url === null || url === void 0 ? void 0 : url.pathname) ===
          null || _a === void 0
          ? void 0
          : _a.replace(/^\//, "");
      prettyConsole.success("Db connnected on " + dbName);
    });
    db.on("error", function (err) {
      console.error(err);
    });
  }
};
module.exports = dbConnection;
