import { ValidationParam, createValidationParams } from "../../../middlewares/validation.middleware";

const commonValidationParams: ValidationParam[] = [{ name: "id", type: "ObjectId", isParam: true, required: true }];

export const UserParams = createValidationParams({
  approveUserValidator: [
    { name: "userId", type: "ObjectId", required:true },
  ],
  updateUserDetails:[
    {name:"id", type:"ObjectId", required:true,isParam:true}
  ],
  register: [
    { name: "lastName", type: "string", required: true },
    { name: "phone", type: "string", required:true , validate:true },
    { name:"email", type:"string",required:true , validate:true},
    { name:"password", type:"string", required:true},
    { name:"referalCode", type:"string", required:true}
  ],
});
