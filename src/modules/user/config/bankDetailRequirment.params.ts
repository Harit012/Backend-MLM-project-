import { ValidationParam, createValidationParams } from "../../../middlewares/validation.middleware";

export const BankDetailParams = createValidationParams({
    addBankDetail: [
        {
            name: "accountNumber",
            type: "string",
            required: true,
            validate: true,
        },
        { name: "ifscCode", type: "string", required: true , validate: true},
        { name: "BankName", type: "string", required: true },
        { name: "BranchName", type: "string", required: true },
        { name: "accountHolderName", type: "string", required: true },
    ],
    editBankDetail: [
        {
            name: "accountNumber",
            type: "string",
            validate: true,
        },
        { name: "ifscCode", type: "string", validate: true},
        { name: "BankName", type: "string" },
        { name: "BranchName", type: "string" },
        { name: "accountHolderName", type: "string" },
    ],
});