const jwt=require('jsonwebtoken');
const User = require('../models/user');
const redisClient = require('../config/redis');
// this middleware will check whether the user is authenticated or not by verifying the JWT token and also check whether the token is blocked or not by checking in redis
const adminMiddleware=async(req,res,next)=>{
  try{
    const {token}=req.cookies;
    if(!token)
      throw new Error("Unauthorized Access");

    const payload=jwt.verify(token,process.env.JWT_KEY);
    if(!payload)
      throw new Error("Invalid Token-No Payload");

    const {id}=payload;
    if(!id)
      throw new Error("Invalid Token-No ID");

    if(payload.role!=='admin')
      throw new Error("Invalid Token-Not an admin");
    
    const result=await User.findById(id);
    if(!result)
      throw new Error("admin Not Found");

    if(result.role!=='admin')
      throw new Error("Invalid Token-User is not an admin");

    const isBlocked=await redisClient.exists(`token:${token}`);
    if(isBlocked)
      throw new Error("Invalid Token");
    
    req.result=result;
    next();
  }catch(err){
    res.status(401).send("Error: "+err.message);
  }
};
module.exports=adminMiddleware;
