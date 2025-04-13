import express from "express";
import cors from "cors";
import path from "path";

const logger = require("morgan");
const app = express();

app.use(cors());
app.use(express.json());
app.use(logger('dev'))
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../../uploads/images')));

// app.use(multer)

export default app; 
    