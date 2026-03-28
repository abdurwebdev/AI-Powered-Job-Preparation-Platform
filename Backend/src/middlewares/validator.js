import {body,validationResult} from 'express-validator'

export const registerValidation =[
  body('name').trim().notEmpty().withMessage('name is required.'),
  body('email').trim().isEmail().withMessage('enter valid email.').notEmpty().withMessage('email is required'),
  body('password').isLength({min:6}).withMessage('password must be at least 6 characters long.')]


export const loginValidation = [
  body('email').trim().notEmpty().withMessage('email is required.').isEmail().withMessage('enter valid email.'),
  body('password').trim().notEmpty().withMessage('password is required.')
  ]


export const validate = (req,res,next) =>{
  let errors = validationResult(req);

  if(!errors.isEmpty()){
    return res.status(400).json({
      success:false,
      message:errors.array().map((err)=>({
        field:err.path,
        message:err.msg
      }))
    })
  }
  next();
}