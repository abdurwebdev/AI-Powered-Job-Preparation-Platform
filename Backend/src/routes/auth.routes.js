import express from 'express';
import { loginUser, registerUser } from '../controllers/auth.controller.js';
import { loginValidation, registerValidation, validate } from '../middlewares/validator.js';

const authRouter = express.Router();

authRouter.post("/register",registerValidation,validate,registerUser)
authRouter.post("/login",loginValidation,validate,loginUser);

export default authRouter;