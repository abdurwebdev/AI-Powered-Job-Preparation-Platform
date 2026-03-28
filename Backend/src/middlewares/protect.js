import jwt from 'jsonwebtoken'
import redisClient from '../config/redis.js';

export const protect = async (req,res,next) =>{
        try {
          const token = req.cookies.token;
          if(!token) return res.status(401).json({message:"Not Authorized."});
          const decoded = jwt.verify(token,process.env.JWT_SECRET);
          const storedToken = await redisClient.get(`user_token:${decoded.id}`);

          if(!storedToken || storedToken!== token){
            return res.status(401).json({message:"token invalid or expired"})
          }
          req.user = decoded;
          next();
        } catch (error) {
          res.status(401).json({message:"internal server error"})
        }
}