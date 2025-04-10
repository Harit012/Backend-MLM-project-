import express, { Router } from "express";
import Auth from "../modules/auth/routes/auth.routes";


let router = express.Router();

router.use("/", Auth)



export default router