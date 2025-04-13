import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import chalk from "chalk";
import app from "./config/express";
import connectDB from "./config/databaseConnection";
import router from "./config/routes";

// Set default environment if not provided
process.env.ENVIRONMENT = process.env.ENVIRONMENT || "development";

const envFile = process.env.ENVIRONMENT;
console.info(chalk.blue(`Environment: ${chalk.yellow(envFile)}`));

// Resolve correct path for .env file
const envFilePath = path.resolve(__dirname, `../environment/.env.${envFile}`);

// Load environment variables only if the file exists
if (fs.existsSync(envFilePath)) {
    dotenv.config({ path: envFilePath });
    console.log(chalk.green(`✅ Loaded environment file: .env.${envFile}`));
} else {
    console.error(chalk.red(`❌ Environment file .env.${envFile} does not exist!`));
    process.exit(1);
}

// Check if PORT is loaded correctly
// console.log(chalk.blue(`Loaded PORT: ${process.env.PORT || "Not Found"}`));

connectDB().then(()=>{
    const PORT = process.env.PORT || 5000;
    
    // Routes
    app.use("/",router);
    
    // Start Server
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
}).catch((error)=>{
    console.log(error)
})

