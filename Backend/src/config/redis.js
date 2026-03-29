import {createClient} from 'redis';
import logger from './logger.js'
const redisClient = createClient({
  url:process.env.REDIS_URL
})

redisClient.on("error",(err)=>{logger.error(`Redis Error:${error.message}`)});
await redisClient.connect();
console.log("Redis Connected!")

export default redisClient;