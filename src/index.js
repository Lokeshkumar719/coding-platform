require('dotenv').config(); 
const express = require('express');
const main=require('./config/db');
const cookieParser=require('cookie-parser');
const authRouter=require('./routes/userAuth');
const redisClient=require('./config/redis');

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use('/user',authRouter);

const initialiseConnection=async()=>{
  try{
    Promise.all([main(),redisClient.connect()]);
    console.log("DB connected");
    app.listen(process.env.PORT, () => {
      console.log("Server is listening at port " + process.env.PORT);
    });
  }catch(err){
    console.log("Error Occurred: "+err);
  }
};

initialiseConnection();