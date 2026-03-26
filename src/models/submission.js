const mongoose=require('mongoose');
const {Schema}=mongoose;

const submissionSchema=new Schema({
  userId:{
    type:Schema.Types.ObjectId,
    ref:"user",
    required:true
  },
  problemId:{
    type:Schema.Types.ObjectId,
    ref:"Problem",
    required:true
  },
  code:{
    type:String,
    required:true
  },
  language:{
    type:String,
    enum:["c++","java","javascript"],
    required:true
  },
  status:{
    type:String,
    enum:["pending","accepted","wrong","error"],
    default:"pending"
  },
  runtime:{
    type:Number,
    default:0
  },
  memory:{  
    type:Number,
    default:0
  },
  testCasesPassed:{
    type:Number,
    default:0
  },
  testCasesTotal:{
    type:Number,
    default:0
  }
},
{
  timestamps:true
}
);

// index the combination of userId and problem id which will help to get userSubmissions for a problem 1 1 for ascending order 
submissionSchema.index({userId:1,problemId:1});

const Submission=mongoose.model("submission",submissionSchema);
module.exports=Submission;                                          