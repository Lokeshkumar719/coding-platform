const User=require('../models/user');
const validate=require('../utils/validate');
const bcrypt=require('bcrypt');
const jwt = require('jsonwebtoken');

// REGISTER
const register=async (req,res)=>{
  try{
    // validate the Data
    validate(req.body);
    const {password}=req.body;
    // hash the password
    req.body.password= await bcrypt.hash(password,10);
    const user=await User.create(req.body);
    
    // send the JWT
    const token=jwt.sign({id:user._id,emailId:user.emailId},process.env.JWT_KEY,{expiresIn:60*60});
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
    // send the JWT
    const token=jwt.sign({id:user._id,emailId:user.emailId},process.env.JWT_KEY,{expiresIn:60*60});
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

module.exports={register,login};