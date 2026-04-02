import app from './src/app.js';
import {createServer} from 'http';
import {Server} from 'socket.io';
import { evaluateAnswer, generateInterviewQuestion } from './src/utils/ai.js';
import redisClient from './src/config/redis.js';
import { initSocket } from './src/config/socket.js';

const httpServer = createServer(app);

initSocket(httpServer);

const PORT = process.env.PORT || 5000

httpServer.listen(PORT,()=>{
  console.log(`Server is running on Port http://localhost:${PORT}`)
})