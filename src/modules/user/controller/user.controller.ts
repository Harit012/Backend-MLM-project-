import { Request, Response } from "express";
import User, { IUser } from "../../user/model/user.model";
import path from "path";
import fs from "fs";
import { updateFields } from "../../../utils/updateFunc";

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

export const approveUser = async (req:Request,res:Response):Promise<void> =>{
    try{
        const { userId } = req.body;
        let user = await User.findById(userId);
        if(!user){
            res.status(404).send({success:false, message:"No user exist with that id"})
        }
        // let fullPath = user?.parentPath;
        let parentArray:any = user?.parentPath?.split("/");
        parentArray =parentArray?.slice(1,parentArray.length)
        parentArray = parentArray?.map((ele:any)=>{
            return Number(ele);
        });
        console.log(parentArray)
        res.send({success:true, data:parentArray})
    }catch(err:any){
        res.status(500).send({success:false , message: err.message });
    }
}

export const UpdateUserDetails = async (req:Request,res:Response):Promise<any> =>{
    try{
        let { id } = req.params;
        let { firstName , lastName , email , phone  , isSuperUser = false} = req.body
        let profilePath :any = null
        if(req.file){
            profilePath = req.file.filename
        }
        firstName = firstName?.trim();
        lastName = lastName?.trim();
        phone = phone?.trim();
        email = email?.trim().toLowerCase();
        let existUser:any = await User.findById(id);
        if(!existUser){
            res.status(404).send({success:false , message:"User you want to update does not exist in records"})
        }
        if(email){
            let usr = await User.findOne({ email })
            if(usr){
                if(profilePath){
                    fs.unlinkSync(path.join(__dirname,"../../../../uploads/images",profilePath))
                }
                return res.status(409).send({
                    success: false,
                    message: "User with same email already exists",
                  });
            }
        }
        if(phone){
            let usr = await User.findOne({ phone })
            if(usr){
                if(profilePath){
                    fs.unlinkSync(path.join(__dirname,"../../../../uploads/images",profilePath))
                }
                return res.status(409).send({
                    success: false,
                    message: "User with same Phone number already exists",
                  });
            }
        }
        let update = updateFields({ firstName , lastName , email , phone, profilePath  , isSuperUser})
        console.log(update)
        let user = await User.findByIdAndUpdate(id, update,{new:true});
        if(existUser?.profilePath != "no-File" && user?.profilePath != existUser?.profilePath){
            fs.unlinkSync(path.join(__dirname,"../../../../uploads/images",existUser?.profilePath))
        }
        return res.status(200).send({success:true, user})
    }catch(err:any){
        res.status(500).send({success:false , message: err.message });
    }
}