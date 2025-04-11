import { Request, Response } from "express";
import User, { IUser } from "../../user/model/user.model";
import path from "path";
import fs from "fs";

export const getProfile = async (req: Request, res: Response): Promise<void> => {
    const userId = req.headers.id;
    try {
        const user = await User.findById(userId);
        if (!user) {
            res.status(404).send({success:false , message: "User not found" });
            return;
        }
        res.status(200).send({success:true , data:user});
    } catch (err:any) {
        res.status(500).send({success:false , message: err.message });
    }
};