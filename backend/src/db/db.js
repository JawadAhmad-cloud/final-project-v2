const mongoose = require("mongoose");

async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.DATABASE_URI);
    console.log("Succeffuly connected to database");
  } catch (error) {
    console.log("Error connecting to database " + error.message);
  }
}

module.exports = connectToDatabase;
