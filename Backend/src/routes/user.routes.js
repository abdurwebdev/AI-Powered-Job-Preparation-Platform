import express from 'express';
import { protect } from '../middlewares/protect.js';
import { getProfile, updatePassword, updateProfile, verifyEmail } from '../controllers/user.controller.js';
import { changePasswordValidation, updateProfileValidation, validate } from '../middlewares/validator.js';

const userRouter = express.Router();

userRouter.get("/profile",protect,getProfile);
userRouter.put("/update-profile",protect,updateProfileValidation,validate,updateProfile)
userRouter.put("/change-password",protect,changePasswordValidation,validate,updatePassword);

userRouter.get("/verify-email",verifyEmail)

export default userRouter;