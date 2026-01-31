require('dotenv').config(); 
const mongoose=require('mongoose');

async function main(){
  await mongoose.connect(process.env.DB_CONNECT_STRING);
  console.log("connected");
}

module.exports=main;