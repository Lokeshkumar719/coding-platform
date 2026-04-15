const Problem=require('../models/problems');
const Submission=require('../models/submission');
const {getLanguageById,submitBatch,submitToken} = require('../utils/problemUtility');

const submitCode=async (req,res)=>{
  try{
    // as middleware added the user(it's id and all info) so we can extract that to use here
    const userId=req.result._id;
    const problemId=req.params.id;
    const {code,language}=req.body;
    if(!userId || !problemId || !code || !language)
      return res.status(400).send("Some field missing");

    const problem = await Problem.findById(problemId);
    // console.log(problem);

    // Combine both visible and hidden test cases for submission
    const allTestcases = [...problem.visibleTestcases, ...problem.hiddenTestcases];

    const submittedResult=await Submission.create({
      userId,
      problemId,
      code,
      language,
      testCasesPassed:0,
      status:'pending',
      testCasesTotal:allTestcases.length
    });
    // console.log(submittedResult);

    const languageId=getLanguageById(language);
    // console.log(languageId);

    const submissions=allTestcases.map((testcase)=>({
      source_code: code,
      language_id: languageId,
      stdin: testcase.input,
      expected_output: testcase.output,
    }));

    // console.log(submissions.source_code);

    
    const submitResult=await submitBatch(submissions);

    // console.log(submitResult);

    const resultToken=submitResult.map((value)=>value.token);

    const testResult=await submitToken(resultToken);

    // console.log(testResult);

    let testCasesPassed=0;
    let runtime=0;
    let memory=0;
    let status='accepted';
    let errorMessage='null';
    
    for(const test of testResult){
      if(test.status.id==3){
        testCasesPassed++;
        if(test.time){
          runtime += parseFloat(test.time);
        }
        memory = Math.max(memory, test.memory || 0);
      }else{
        if(test.status.id==4){
          status='error';
          errorMessage=test.stderr;
        }else{
          status='wrong';
          errorMessage=test.stderr;
        }
      }
      // console.log(test.status.id);
    }

    submittedResult.status=status;
    submittedResult.testCasesPassed=testCasesPassed;
    submittedResult.runtime=runtime;
    submittedResult.memory=memory;
    submittedResult.errorMessage=errorMessage;

    await submittedResult.save();

    // add the solved problem in user data if not solved earlier only if it is accepted
    if(status === 'accepted'){
      await req.result.updateOne({
        // prevent duplicate
        $addToSet:{ problemSolved: problemId }
      });
    }
    res.status(200).send(submittedResult);
  }catch(err){
    res.status(404).send("error"+err);
  }
}

const runCode = async (req, res) => {
  try {
    const userId = req.result._id;
    const problemId = req.params.id;
    const { code, language } = req.body;

    if (!userId || !problemId || !code || !language)
      return res.status(400).send("Some field missing");

    const problem = await Problem.findById(problemId);

    const languageId = getLanguageById(language);

    // Only visible test cases for run
    const submissions = problem.visibleTestcases.map((testcase) => ({
      source_code: code,
      language_id: languageId,
      stdin: testcase.input,
      expected_output: testcase.output,
    }));

    const submitResult = await submitBatch(submissions);

    const resultTokens = submitResult.map((value) => value.token);

    const testResults = await submitToken(resultTokens);

    res.status(200).send(testResults);
  } catch (err) {
    res.status(500).send("error: " + err);
  }
};

module.exports={submitCode,runCode};