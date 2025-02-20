var express = require("express");
var path = require("path");
var multer = require("multer");
var session = require("express-session");
var cors = require("cors");
var xss = require("xss-clean");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var logger = require("morgan");
// mongodb configuration
const dbConnection = require("./bin/DbConnection.js");
const connection = require("./config/connection");
// connection related
const corsOptions = require("./bin/CorsOptions.js");
//error related
const errorHandler = require("./bin/ErroHandler.js");
// routes
const auth = require("./routes/Routes.js");
//controllers
const AuthController = require("./api/controller/services/AuthorizationController.js");

//env
require("dotenv").config();

//root of express
var app = express();
//db connection with mongoose

dbConnection(connection);

app.use(cors(corsOptions));
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(xss());
app.use(multer());
app.use(cookieParser());

// authentication for each request
app.get("/", function (req, res, next) {
  res.send("Welcome to Backend");
});

app.use("/", AuthController.checkRequestAuth);
// routes for path
app.use("/api", auth);

// catch 404 and forward to error handler
app.use(errorHandler.error400);

// error handler
app.use(errorHandler.error500);

module.exports = app;
