import mongoose from "mongoose";

// function to connect to the mongodb database

export const connectDB = async () => {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/chat-nova";

  try {
    mongoose.connection.on("connected", () => {
      console.log("Database connected to MongoDB");
    });

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
  } catch (error) {
    if (uri !== "mongodb://127.0.0.1:27017/chat-nova") {
      console.warn("Remote MongoDB failed, attempting local MongoDB fallback...");
      try {
        await mongoose.connect("mongodb://127.0.0.1:27017/chat-nova", {
          serverSelectionTimeoutMS: 5000,
        });
        console.log("Database connected to local MongoDB fallback successfully");
        return;
      } catch (localErr) {
        console.error("Local fallback also failed:", localErr.message);
      }
    }
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
};
