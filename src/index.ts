import express from "express"
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { ContentModel, UserModel } from "./db";
import { JWT_PASSWORD } from "./config";
import { userauth } from "./middleware";

const app = express();
app.use(express.json())
app.post("/api/v1/signup",async(req , res)=>{
    //todos: Zod Validation and hash the password
 const username = req.body.username;
 const password = req.body.password;
 try {
    await UserModel.create({
        username: username,
        password: password
    })
    res.json({
        message: "user signed up"
    })
 } catch (err) {
    res.status(411).json({
        message: "user already exist"
    })
 }

})
app.post("/api/v1/signin",async(req , res)=>{
  const username = req.body.username;
 const password = req.body.password;

 const user = await UserModel.findOne({
    username,
    password
 })
 if(user){
    const token = jwt.sign({
        id: user._id
    }, JWT_PASSWORD)
    res.json({
        token
    })
 }else{
    res.status(403).json({
        message : "Incorrect credentials "
    })
 }
})
app.post("/api/v1/content",userauth,async(req , res)=>{
const link  = req.body.link;
const type = req.body.type;
await ContentModel.create({
    link,
    type,
    //@ts-ignore
    userId: req.userId,
    tags:[]
})
res.json({
    message: "content added"
})
})
app.get("/api/v1/content",userauth,async(req , res)=>{
    //@ts-ignore
const userId = req.userId;
const content = await ContentModel.find({
    userId:userId
}).populate("userId", "username")
res.json({
    content
})
})
app.delete("/api/v1/content",userauth,async(req , res)=>{
const contentId = req.body.contentId;

await ContentModel.deleteMany({
    contentId,
    //@ts-ignore
    userId: req.userId
})
res.json({
    message :"Deleted"
})
})
app.post("/api/v1/brain/share",(req , res)=>{

})
app.get("/api/v1/brain/:shareLink",(req , res)=>{

})


app.listen(3000,()=>{
    console.log("server is running on 3000")
});