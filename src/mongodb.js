// Import the Mongoose library
const mongoose = require("mongoose");

// Connect to the MongoDB database named "Urlshortner" on localhost:27017
mongoose.connect("mongodb://localhost:27017/Urlshortner")
    .then(() => {
        console.log("MongoDB connected successfully");
    })
    .catch(() => {
        console.log("Failed to connect to MongoDB");
    });

// Define the schema for the "Collection1" collection
const LogInSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    urls: [{
      longUrl: {
        type: String,
        required: true,
      },
      shortId: {
        type: String,
        required: true,
      },
    }],
  });
  

// Create a Mongoose model named "Collection1" based on the defined schema
const collection = new mongoose.model("Collection1", LogInSchema);

// Export the Mongoose model to be used in other files
module.exports = collection;
