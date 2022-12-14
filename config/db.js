const mongoose = require("mongoose"); 
const config = require("config");
const db = config.get("mongoURI"); 

const connectDB = async () => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Database connection successfully established");
  } catch (err) {
    console.error(err.message);
    console.log("Fatal Database Error");
    process.exit(1);
  }
};

module.exports = connectDB;
