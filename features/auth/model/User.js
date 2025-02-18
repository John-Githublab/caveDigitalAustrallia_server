let mongoose = require("mongoose");

let userSchema = mongoose.Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
    },
    first_name: {
      type: String,
      default: "",
    },
    last_name: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      default: "",
    }, // use email as unique user access
    userName: {
      type: String,
      default: "",
    }, //his is unique key and use for login
    password: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user", // this will be admin,user,
    },
    passwordAttempt: {
      type: Number, // this is avoid mulfuction of login. if wrong password is exceed this value then don't allow then to login
      default: 0,
    },
    lastLogin: {
      type: Number,
      default: () => Math.floor(Date.now() / 1000),
    },
    operatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    updated_at: {
      type: Number,
      default: () => Math.floor(Date.now() / 1000),
    },
    created_at: {
      type: Number,
      default: () => Math.floor(Date.now() / 1000),
    },
  },
  {
    // this block will use when do we need to specify collection name. collection name should be case sensitive
    //otherwise model plural name consider as collection name
    collection: "users",
  }
);
module.exports = mongoose.model("User", userSchema);
