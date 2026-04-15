const validator=require('validator');
// validate the request body for registration before storing it in database
const validateUser=async(data)=>{
  const mandatoryField=["firstName","emailId","password"];
  const isAllowed=mandatoryField.every((k)=>Object.keys(data).includes(k));
  
  if(!isAllowed)
    throw new Error("Some Field Missing");

  if(!validator.isEmail(data.emailId))
    throw new Error("Invalid Email");

  if(!validator.isStrongPassword(data.password))
    throw new Error("Week Password");

  // .trim() is used to remove the leading and trailing spaces from the string
  const name = (data.firstName)?.trim();
  if (!name)
    throw new Error("First name is required");

  if (name.length < 3 || name.length > 20)
    throw new Error("First name must be 3-20 characters long");
}
module.exports=validateUser;