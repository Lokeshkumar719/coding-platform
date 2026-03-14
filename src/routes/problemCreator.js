const express=require('express');
const problemRouter=express.Router();
const adminMiddleware=require('../middlewares/adminMiddleware');
const {createProblem,updateProblem,deleteProblem,getProblemById}=require('../controllers/problemsControllers');
const userMiddleware=require('../middlewares/userMiddleware');
// create fetch update delete problem routes here and export the router

problemRouter.post('/create',adminMiddleware,createProblem);
problemRouter.put('/update/:id',adminMiddleware,updateProblem);
problemRouter.delete('/delete/:id',adminMiddleware,deleteProblem);

// fetch problem by id,fetch all problems routes and also fetch all problems solved by a user route here and export the router


problemRouter.get('/problemById:id',userMiddleware,getProblemById);
problemRouter.get('/getAllProblems',userMiddleware,getAllProblems);
problemRouter.get('problemSolvedByUser',userMiddleware,solvedProblems);

module.exports=problemRouter;