import {createClient} from 'redis';
import logger from './logger.js'
const redisClient = createClient({
  url:process.env.REDIS_URL
})

redisClient.on("error",(err)=>{logger.error(`Redis Error:${err.message}`)});


export const connectRedis = async () =>{
  try {
    await redisClient.connect();
    console.log("Redis Connected!")
  } catch (error) {
    logger.error("Redis connection Failed continuing without Redis.")
  }
}

export default redisClient;