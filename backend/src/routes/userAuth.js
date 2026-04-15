const express=require('express');
const authRouter=express.Router();
const {register,login,logout,adminRegister,deleteProfile}=require('../controllers/userAuthenticate');
const userMiddleware=require('../middlewares/userMiddleware');
const adminMiddleware=require('../middlewares/adminMiddleware');
// register and login routes are public routes so we don't need to add userMiddleware in them but logout route is a private route so we need to add userMiddleware in it
authRouter.post('/register',register);
authRouter.post('/login',login);
// before logout we need to check whether the user is authenticated or not so we will use userMiddleware
authRouter.post('/logout',userMiddleware,logout);
// authRouter.post('/getProfile',getProfile);
authRouter.post('/admin/Register',adminMiddleware,adminRegister);
authRouter.delete('/profile',userMiddleware,deleteProfile);

module.exports=authRouter;