import express from 'express';
import { loginUser, logOutUser, registerUser } from '../controllers/auth.controller.js';
import { loginValidation, registerValidation, validate } from '../middlewares/validator.js';
import { protect } from '../middlewares/protect.js';

const authRouter = express.Router();

authRouter.post("/register",registerValidation,validate,registerUser)
authRouter.post("/login",loginValidation,validate,loginUser);
authRouter.post("/logout",protect,logOutUser)

export default authRouter;