import express from "express"
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { ContentModel, LinkModel, UserModel } from "./db";
import { JWT_PASSWORD } from "./config";
import { userauth } from "./middleware";
import { random } from "./utils";

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
app.post("/api/v1/brain/share",userauth,async(req , res)=>{
const share = req.body.share;
if(share){

    const existingLink = await LinkModel.findOne({
        //@ts-ignore
        userId: req.userId
    });
    if(existingLink){
          res.json({
    hash : existingLink.hash
  })
  return;
    }
    const hash = random(10)
   await LinkModel.create({
            //@ts-ignore
        userId: req.userId,
        hash: hash
    })
  res.json({
    mesage : "/share"  + hash
  })
}
  else{
    await    LinkModel.deleteOne({
            //@ts-ignore
            userId: req.userId
        })
    }
    res.json({
        message: "removed link"
    })
})
app.get("/api/v1/brain/:shareLink",async(req , res)=>{
     const hash = req.params.shareLink;
     const link = await LinkModel.findOne({
        hash
     })
     if(!link){
        res.status(411).json({
            message:"Sorry incorrect input"
        })
        return;
     }
     const content = await ContentModel.find({
        userId :link.userId
     })
     const user = await UserModel.findOne({
        _id: link.userId
     })
     if(!user){
        res.status(411).json({
            message: "user not found , error should  ideally not happen"
        })
        return;
     }
     res.json({
        usrname:user?.username,
        content: content
     })
})


app.listen(3000,()=>{
    console.log("server is running on 3000")
});