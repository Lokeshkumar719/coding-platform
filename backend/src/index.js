require('dotenv').config(); 
const express = require('express');
const main=require('./config/db');
const cookieParser=require('cookie-parser');
const authRouter=require('./routes/userAuth');
const redisClient=require('./config/redis');
const problemRouter=require('./routes/problemCreator');
const submitRouter=require('./routes/submit');
const cors=require('cors');

const app = express();

app.use(cors({
  origin:'http://localhost:5173',
  credentials:true
}));

app.use(express.json());
app.use(cookieParser());

app.use('/user',authRouter);
app.use('/problem',problemRouter);
app.use('/submission',submitRouter);

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