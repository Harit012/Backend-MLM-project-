import express, { Router } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import { validateRequest } from "../../../middlewares/validation.middleware";
import { uploadImage } from "../../../middlewares/multerConfig";
import { authenticateJWT } from "../../../middlewares/auth.middleware";
import { approveUser, getProfile, UpdateUserDetails } from "../controller/user.controller";
import { UserParams } from "../config/userRequired.params";

const User: Router = express.Router();

User.get('/getProfile',getProfile)

User.patch('/approve',validateRequest(UserParams.approveUserValidator),approveUser)

User.put('/update/:id',uploadImage.single("profilePhoto"),validateRequest(UserParams.updateUserDetails),UpdateUserDetails)

export default User 