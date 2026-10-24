import mongoose from "mongoose";

const connectDb = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not set");
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log("MongoDB connected (chat)");
};

export default connectDb;