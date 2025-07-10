import { NextFunction, Request, Response } from "express";
import { JWT_PASSWORD } from "./config";
import  jwt  from "jsonwebtoken";
export const userauth =async (req: Request, res: Response , next : NextFunction)=>{
const header = req.headers["authorization"];
//@ts-ignore
const decoded = jwt.verify(header as string, JWT_PASSWORD)
if(decoded){
    //@ts-ignore
req.userId = decoded.id;
next()
}else{
    res.status(403).json({
        message: "you are not loggedin"
    })
}
}
