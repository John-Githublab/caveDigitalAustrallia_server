let mongoose = require("mongoose");

let taskSchema = mongoose.Schema(
  {
    title: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "low",
    },
    status: {
      type: String,
      enum: ["pending", "completed", "cancelled"],
      default: "pending",
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
  { collection: "tasks" }
);
module.exports = mongoose.model("Task", taskSchema);
