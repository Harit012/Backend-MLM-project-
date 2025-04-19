import express, { Router } from "express";
import Auth from "../modules/auth/routes/auth.routes";
import User from "../modules/user/routes/user.route";
import { authenticateJWT } from "../middlewares/auth.middleware";
import { AuthapiLimiter } from "../middlewares/rateLimiter";
import Request from "../modules/request/routes/request.route";


let router = express.Router();

router.use("/auth", AuthapiLimiter ,Auth)

router.use("/user",authenticateJWT, User)

router.use("/request",authenticateJWT, Request)

router.use("*", (req, res) => { 
    res.status(404).send({success:false , message: "Route not found" });
})

export default router