import mongoose from "mongoose";

// import every model to register them
import "@/models/User";
import "@/models/Trip";
import "@/models/Activity";
import "@/models/Expense";

const connectMongoDB = async () => {
  try {
    if (process.env.MONGO_URL) {
      mongoose.connect(process.env.MONGO_URL);
      console.log("MongoDB connection successful!");
    } else {
      throw new Error("MONGO_URL is not defined in the environment variables");
    }
  } catch (error) {
    console.log(error);
  }
};

export default connectMongoDB;
