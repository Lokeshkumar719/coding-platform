require('dotenv').config();
const axios = require('axios');

const getLanguageById = (lang) => {

  // console.log(lang);

  const languages={
    "c++":54,
    "java":62,
    "javascript":63,
  }
  return languages[lang.toLowerCase()];
}

// implemented the function to submit the batch of code to the Judge0 API and return the results

// we use the axios library to make the API call to the Judge0 API and return the results instead of using the fetch API because in axios we don't have to convert the data to json format and also we can easily handle the errors in axios. We will use the rapidapi version of the Judge0 API because it is more reliable and faster than the free version of the Judge0 API. We will also use the x-rapidapi-key and x-rapidapi-host headers to authenticate our API call and also to specify the host of the API. We will also pass the submissions data in the body of the request to the API. The API will return the results of the submissions in the response which we will return from this function.


const submitBatch=async (submissions)=>{
  
  const options = {
    method: 'POST',
    url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
    params: {
      base64_encoded: 'false'
    },
    headers: {
      'x-rapidapi-key': process.env.RAPID_API_KEY,
      'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
      'Content-Type': 'application/json'
    },
    data: {
      submissions
    }
  };

  async function fetchData() {
    try {
      // response looks like this:(basically an array of objects where each object contains the token for the submission and we can use this token to get the result of the submission by making another API call to the Judge0 API with the token)
      // [
      //   {
      //     "token": "string",
      //    },
      //   {
      //     "token": "string",
      //   },
      //   {
      //     "token": "string",}
      // ]   
      const response = await axios.request(options);
      // console.log(response.data);
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  return await fetchData();
};

const waiting = (timer) => {
  return new Promise((resolve) => setTimeout(resolve, timer));
}

const submitToken=async (resultTokens)=>{

  const options = {
    method: 'GET',
    url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
    params: {
      tokens:resultTokens.join(','),
      base64_encoded: 'false',
      fields: '*'
    },
    headers: {
      'x-rapidapi-key': process.env.RAPID_API_KEY,
      'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
      'Content-Type': 'application/json'
    }
  };

  async function fetchData() {
    try {
      const response = await axios.request(options);
      // console.log(response.data);
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }

  while(true){
    const results=await fetchData();
    // console.log(results);

    // the results will contain the status of the submissions and the output of the submissions and we will check if the status of all the submissions is greater than 2 which means that the result is obtained for all the submissions and then we will return the results otherwise we will wait for 1 second and then try to fetch the results again until we get the results for all the submissions.
    const submissions = results.submissions;
    // console.log(submissions);


    // don't apply the every function on the results as judge0 response will be in the form of an object with a submissions property which is an array of objects where each object contains the status of the submission and the output of the submission and we have to check if the status of all the submissions is greater than 2 which means that the result is obtained for all the submissions and then we will return the results otherwise we will wait for 1 second and then try to fetch the results again until we get the results for all the submissions.
    const isResultObtained = submissions.every(
      (result) => result.status.id > 2
    );

    if(isResultObtained)
      return submissions;
    // if the results are not obtained then we will wait for 1 second and then try to fetch the results again until we get the results for all the submissions.
    await waiting(1000);
  }
};

module.exports = {getLanguageById,submitBatch,submitToken};