const redisClient = require('../config/redis');
const User=require('../models/user');
const validate=require('../utils/validate');
const bcrypt=require('bcrypt');
const jwt = require('jsonwebtoken');

// REGISTER
const register=async (req,res)=>{
  try{
    // validate the request body
    validate(req.body);

    // important to set the role before creating the user because admin will not be registered through this route and we are not allowing users to set their role by themselves so we will set the role as "user" by default
    req.body.role="user";

    // extract the password from request body and hash it before saving to database
    const {password}=req.body;
    // hash the password
    req.body.password= await bcrypt.hash(password,10);
    const user=await User.create(req.body);
    
    // send the JWT and assign the role to the user in the JWT payload so that we can use it in the future for authorization
    const token=jwt.sign({id:user._id,emailId:user.emailId,role:'user'},process.env.JWT_KEY,{expiresIn:60*60});
    res.cookie('token', token, {
      maxAge: 60 * 60 * 1000,
      httpOnly: true,
      sameSite: 'strict'
    });
    res.status(201).send("User Registered Successfully");
  }catch(err){
    res.status(400).send("Error "+err);
  }
};

// LOGIN
const login=async (req,res)=>{
  try{
    const {emailId,password}=req.body;
    if(!emailId || !password)
      throw new Error("Invalid Credentials");
    // match the password
    const user=await User.findOne({emailId});
    if(!user) 
      throw new Error("Invalid Credentials");
    const match=bcrypt.compare(password, user.password);
    if(!match)
      throw new Error("Invalid Credentials");
    // send the JWT and assign the role to the user in the JWT payload so that we can use it in the future for authorization
    const token=jwt.sign({id:user._id,emailId:user.emailId,role:user.role},process.env.JWT_KEY,{expiresIn:60*60});
    //Always add these two to ensure frontend don't access JWT and Cookie is sent ONLY when request comes from your own site.
    res.cookie('token', token, {
      maxAge: 60 * 60 * 1000,
      httpOnly: true,
      sameSite: 'strict'
    });   
    res.status(200).send("Logged In Successfully");
  }catch(err){
    res.status(401).send("Error: "+err);
  }
};

// LOGOUT
const logout=async (req,res)=>{
  try{
    const {token}=req.cookies;
    const payload=jwt.decode(token);
    await redisClient.set(`token:${token}`,'blocked');
    redisClient.expireAt(`token:${token}`,payload.exp);
    res.cookie('token',null,{expires:new Date(Date.now())});
    res.status(200).send("Logged Out Successfully");
  }catch(err){
    res.status(503).send("Error: "+err);
  }
};

// only allow existing admins to register new admins and also validate the request body for admin registration and hash the password before saving to database and send the JWT with role as "admin" in the payload
const adminRegister=async (req,res)=>{
  try{
    // validate the request body
    validate(req.body);

    // important to set the role before creating the user because admin will not be registered through this route and we are not allowing users to set their role by themselves so we will set the role as "admin" by default
    req.body.role="admin";

    // extract the password from request body and hash it before saving to database
    const {password}=req.body;
    // hash the password
    req.body.password= await bcrypt.hash(password,10);
    const user=await User.create(req.body);
    
    // send the JWT and assign the role to the user in the JWT payload so that we can use it in the future for authorization
    const token=jwt.sign({id:user._id,emailId:user.emailId,role:'admin'},process.env.JWT_KEY,{expiresIn:60*60});
    res.cookie('token', token, {
      maxAge: 60 * 60 * 1000,
      httpOnly: true,
      sameSite: 'strict'
    });
    res.status(201).send("Admin Registered Successfully");
  }catch(err){
    res.status(400).send("Error "+err);
  }
};

module.exports={register,login,logout,adminRegister};