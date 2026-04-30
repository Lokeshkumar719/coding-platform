const Problem=require('../models/problems');
const Submission=require('../models/submission');
const {getLanguageById,submitBatch,submitToken} = require('../utils/problemUtility');

const submitCode=async (req,res)=>{
  try{
    // as middleware added the user(it's id and all info) so we can extract that to use here
    const userId=req.result._id;
    const problemId = req.params.id;
    const {code,language}=req.body;
    if(!userId || !problemId || !code || !language)
      return res.status(400).send("Some field missing");

    const problem = await Problem.findById(problemId);
    if(!problem){
      return res.status(404).json({ error: "Problem not found" });
    }
    // console.log(problem);

    // Combine both visible and hidden test cases for submission
    const allTestcases = [...problem.visibleTestCases, ...problem.hiddenTestCases];
    // console.log(allTestcases);

    const submittedResult=await Submission.create({
      userId,
      problemId,
      code,
      language,
      testCasesPassed:0,
      status:'pending',
      testCasesTotal:allTestcases.length
    });
    console.log(submittedResult);

    const languageId=getLanguageById(language);
    console.log(languageId);

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
    let errorMessage=null;
    
    for(const test of testResult){
      if(test.status.id !== 3){
        status = (test.status.id === 4) ? 'error' : 'wrong';
        errorMessage = test.stderr;
        break;
      }
      testCasesPassed++;
      if(test.time){
        runtime += parseFloat(test.time);
      }
      memory = Math.max(memory, test.memory || 0);
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

    const accepted = (status == 'accepted')
    res.status(201).json({
      accepted,
      error: errorMessage,
      totalTestCases: submittedResult.testCasesTotal,
      passedTestCases: testCasesPassed,
      runtime,
      memory
    });
  }catch(err){
    res.status(500).send("error"+err);
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
    // console.log(languageId);

    // Only visible test cases for run
    const submissions = problem.visibleTestCases.map((testcase) => ({
      source_code: code,
      language_id: languageId,
      stdin: testcase.input,
      expected_output: testcase.output,
    }));

    // console.log(submissions);

    const submitResult = await submitBatch(submissions);

    const resultTokens = submitResult.map((value) => value.token);
  
    const testResult = await submitToken(resultTokens);


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

    res.status(201).json({
      success: status === 'accepted',
      testCases: testResult,
      runtime,
      memory
    });
  } catch (err) {
    res.status(500).send("error: " + err);
  }
};

module.exports={submitCode,runCode};