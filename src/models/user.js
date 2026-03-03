const validator=require('validator');
const mongoose=require('mongoose');
const {Schema}=mongoose;
const userSchema=new Schema({
  firstName:{
    type:String,
    required:true,
    minLength:3,
    maxLength:20,
    trim:true
  },
  lastName:{
    type:String,
    minLength:3,
    maxLength:20,
    trim:true
  },
  emailId:{
    type:String,
    required:true,
    unique:true,
    trim:true,
    lowercase:true,
    immutable:true,
    // never believe just on controllers we should always add index and this in email check
    validate: {
      validator: validator.isEmail,
      message: 'Invalid email format'
    },
    // this will increase it's search speed in DB in a query
    index:true
  },
  age:{
    type:Number,
    min:5,
    max:80
  },
  role:{
    type:String,
    enum:["user","admin"],
    default:"user"
  },
  problemSolved:{
    type:[String],
    default:[]
  },
  password:{
    type:String,
    required:true,
  },
},
{
  timestamps:true
}
);
const User=mongoose.model("user",userSchema);
// Export the Use
module.exports=User;