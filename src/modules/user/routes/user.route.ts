import express, { Router } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import { validateRequest } from "../../../middlewares/validation.middleware";
import { uploadImage } from "../../../middlewares/multerConfig";
import { authenticateJWT } from "../../../middlewares/auth.middleware";
import { getProfile } from "../controller/user.controller";

const User: Router = express.Router();

User.get('/getProfile',getProfile)

export default User