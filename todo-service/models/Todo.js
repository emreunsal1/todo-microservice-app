const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  tags: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tag" }],
  dueDate: Date,
  assignees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  isDelete: { type: Boolean, default: false },
});

module.exports = mongoose.model("Todo", todoSchema);
