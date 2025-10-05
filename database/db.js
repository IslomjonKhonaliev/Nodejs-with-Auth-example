const mongoose = require("mongoose");

const connectToDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Database is connected successfully");
  } catch (error) {
    console.error("Connecting database is failed");
    process.exit(1);
  }
};
module.exports = connectToDB;