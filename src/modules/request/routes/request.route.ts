import express, { Router } from "express";
import { validateRequest } from "../../../middlewares/validation.middleware";
import { addRequests, getRequests, UpdateRequest } from "../controller/request.controller";
import { RequestParams } from "../config/requestRequire.params";


const Request: Router = express.Router();

Request.get('/getRequests',getRequests);

Request.post('/addRequest',validateRequest(RequestParams.addRequest), addRequests)

Request.patch('/updateRequest',validateRequest(RequestParams.updateRequest), UpdateRequest)

export default Request 
