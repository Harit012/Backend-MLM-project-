import express from "express";
import cors from "cors";

const logger = require("morgan");
const app = express();

app.use(cors());
app.use(express.json());
app.use(logger('dev'))
app.use(express.urlencoded({ extended: true }));

// app.use(multer)

export default app; 
    