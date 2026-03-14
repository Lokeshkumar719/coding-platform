const {getLanguageById,submitBatch,submitToken} = require('../utils/problemUtility');
const Problem=require('../models/problems');


const createProbelm=async (req,res)=>{

  const {title,description,difficulty,tags,visibleTestcases,hiddenTestcases,startCode,problemCreater,referenceSolution}=req.body;

  try{
    for(const {language,completeCode} of referenceSolution){
      const languageId=getLanguageById(language);
      if(!languageId){
        return res.status(400).json({error:`Unsupported language: ${language}`});
      }

      // batch submission to judge0 for reference solution and store the results
      const submission=visibleTestcases.map((testCase)=>({
        source_code: completeCode,
        language_id: languageId,
        stdin: testCase.input,
        expected_output: testCase.output,
      }));

      // console.log(submission);

      const submitResult=await submitBatch(submission);
      // get the tokens from the subminResult
      const resultTokens=submitResult.map(result=>result.token);

      const testResult=await submitToken(resultTokens);

      for(const test of testResult){
        if(test.status_id!==3){
          return res.status(400).send("Error Occured");
        }
      }
    }
    // if all the reference solutions are correct then we will create the problem in the database
    await Problem.create({
      ... req.body,
      // we will get the problemCreater from the adminMiddleware(stored in request itself) and it will be the id of the admin who is creating the problem
      problemsCreater:req.result._id,
    });

    res.send("Problem Created Successfully");
  }catch(err){
    res.status(500).json({error:"Error Occured: "+err.message});
  }
}

const updateProblem=async(req,res)=>{
  const {id}=req.params;
  const {title,description,difficulty,tags,visibleTestcases,hiddenTestcases,startCode,problemCreater,referenceSolution}=req.body;

  try{
    if(!id) 
      return res.status(400).json({error:"Problem id is required"});

    const dsaProblem=await Problem.findById(id);
    if(!dsaProblem)
      return res.status(404).json({error:"Problem not found"});


    for(const {language,completeCode} of referenceSolution){
      const languageId=getLanguageById(language);
      if(!languageId){
        return res.status(400).json({error:`Unsupported language: ${language}`});
      }

      // batch submission to judge0 for reference solution and store the results
      const submission=visibleTestcases.map((testCase)=>({
        source_code: completeCode,
        language_id: languageId,
        stdin: testCase.input,
        expected_output: testCase.output,
      }));

      // console.log(submission);

      const submitResult=await submitBatch(submission);
      // get the tokens from the subminResult
      const resultTokens=submitResult.map(result=>result.token);

      const testResult=await submitToken(resultTokens);

      for(const test of testResult){
        if(test.status_id!==3){
          return res.status(400).send("Error Occured");
        }
      }
    }
    // if all the reference solutions are correct then we will update the problem in the database;
    const newProblem=await Problem.findByIdAndUpdate(id,{...req.body},{runValidators:true,new:true});
    res.status(200).send(newProblem);
  }catch(err){
    res.status(500).json({error:"Error Occured: "+err.message});
  }
};

const deleteProblem=async(req,res)=>{
  const {id}=req.params;
  try{
    if(!id)
      return res.status(400).json({error:"Problem id is required"});

    const problemToDelete=await Problem.findById(id);
    if(!problemToDelete)
      return res.status(404).json({error:"Problem not found"});
    
    await Problem.findByIdAndDelete(id);
    return res.status(200).send('problem deleted successfully');
  }catch(err){
    return res.status(500).send("Error Occured: "+err.message);
  }
};

const getProblemById=async(req,res)=>{
  const {id}=req.params;
  try{
    if(!id)
      return res.status(400).json({error:"Problem id is required"});

    const reqdProblem=await Problem.find(id);
    if(!reqdProblem)
      return res.status(404).json({error:"Problem not found"});

    return res.status(200).send(reqdProblem);
  }catch(err){
    return res.status(500).send("Error Occured: "+err.message);
  }
};

const getAllProblems=async(req,res)=>{
  try{
    const allProblems=await Problem.find({});
    if(!allProblems || allProblems.length===0)
      return res.status(404).json({error:"No problems found"});
    
    return res.status(200).send(allProblems);
  }catch(err){
    return res.status(500).send("Error Occured: "+err.message);
  }
};
module.exports={createProbelm,updateProblem,deleteProblem,getProblemById,getAllProblems};