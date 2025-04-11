import express, { Router } from "express";
import Auth from "../modules/auth/routes/auth.routes";
import User from "../modules/user/routes/user.route";


let router = express.Router();

router.use("/auth", Auth)

router.use("/user", User)

router.use("*", (req, res) => { 
    res.status(404).send({success:false , message: "Route not found" });
})

export default router