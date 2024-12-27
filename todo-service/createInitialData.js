const mongoose = require("mongoose");
const dotenv = require("dotenv");
const TagModel = require("./models/Tag");

dotenv.config();

async function addTags() {
  try {
    const tagsToAdd = [
      { name: "Technology" },
      { name: "Health" },
      { name: "Business" },
      { name: "Science" },
    ];
    await TagModel.insertMany(tagsToAdd);
    console.log("Tags added successfully!");
  } catch (error) {
    console.error("Error adding tags:", error);
  } finally {
    mongoose.connection.close();
  }
}

const init = async () => {
  await mongoose.connect(process.env.MONGODB_CONNECTION_URL);
  addTags();
};

init();
