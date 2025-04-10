import mongoose from "mongoose";
import chalk from "chalk";


const connectDB = async () => {
    // Detect current environment
    const ENV = process.env.ENVIRONMENT || "development";
    
    // Set MongoDB URI based on environment
    const MONGO_URI = process.env.MAIN_DB_URL || process.env[`MONGO_URI_${ENV.toUpperCase()}`] || "";
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as mongoose.ConnectOptions);
    console.log(chalk.green("✅ MongoDB Connected Successfully"));
  } catch (error) {
    console.error(chalk.red("❌ MongoDB Connection Failed:"), error);
    process.exit(1); // Exit the process on failure
  }
};

export default connectDB;
