import { ValidationParam, createValidationParams } from "../../../middlewares/validation.middleware";
import { RequestReasons, RequestStatus } from "../../../utils/constants";


export const RequestParams = createValidationParams({
  addRequest:[
    // { name: "customerId", type: "ObjectId", required:true },
    // { name: "customerName", type: "string", required:true },
    { name: "reason", type: "string",enum: Object.values(RequestReasons), required:true },
    { name: "amountToWithdraw", type: "number", requiredWhen:{reason:RequestReasons.WITHDRAW}, validate:true },
    { name: "message", type: "string" },
  ],
  updateRequest:[
    { name: "requestId", type: "ObjectId", required:true },
    { name: "status", type: "string",enum: Object.values(RequestStatus), required:true },
]
});
