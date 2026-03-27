import mongoose from "mongoose";

// function to connect to the mongodb database

export const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () => {
      console.log(" Database Connected ");
    });
    // Use the full connection string from .env, including the database name
    await mongoose.connect(process.env.MONGO_URI);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};
