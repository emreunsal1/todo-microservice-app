const mongoose = require("mongoose");

const tagSchema = new mongoose.Schema({
  name: { type: String, required: true },
  isDelete: { type: Boolean, default: false },
});

module.exports = mongoose.model("Tag", tagSchema);
