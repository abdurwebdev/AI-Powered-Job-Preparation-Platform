import app from './src/app.js';
import {createServer} from 'http';
import {Server} from 'socket.io';
import { evaluateAnswer, generateInterviewQuestion } from './src/utils/ai.js';
import redisClient from './src/config/redis.js';

const httpServer = createServer(app);

const io = new Server(httpServer,{
  cors:{origin:"*"}
});

io.on("connection",(socket)=>{
  console.log("User Connected",socket.id);

  socket.on("startInterview",async(role)=>{
    if (!role) return socket.emit("error", "Role is required");
    let question;
    try{
      question = await generateInterviewQuestion(role);
    }
    catch(error){
      socket.emit("error",`error generating question`)
    }

    await redisClient.setEx(`session_id:${socket.id}`,3600,
      JSON.stringify({role,lastQuestion:question,totalScore:0,answers:[]})
    )
    socket.emit("newQuestion",question)
  })

  socket.on("submitAnswer",async({answer})=>{
    if (!answer) return socket.emit("error", "Answer is required");
    const sessionCache = await redisClient.get(`session_id:${socket.id}`);
    if(!sessionCache) return socket.emit("error","session not found");

    const session = JSON.parse(sessionCache);

    const evaluation = await evaluateAnswer({role:session.role,question:session.lastQuestion,answer});
    session.totalScore += evaluation.score;
  session.answers.push({
    question:session.lastQuestion,
    answer,
    evaluation
  })
  let nextQuestion;
  try{
    nextQuestion = await generateInterviewQuestion(session.role);
  }
  catch(err){
    socket.emit("error","error genearting new question")
  }
  session.lastQuestion = nextQuestion;

  await redisClient.setEx(`session_id:${socket.id}`,3600,JSON.stringify(session));

  socket.emit("evaluation",evaluation);
  socket.emit("newQuestion",nextQuestion);
  })
  

  socket.on("endInterview",async ()=>{
    const sessionData = await redisClient.get(`session_id:${socket.id}`);
    if(!sessionData) return socket.emit("error","Session not found.")

    const session = JSON.parse(sessionData);

    await redisClient.del(`session_id:${socket.id}`)

    socket.emit("interviewSummary",{
     role:session.role,
     totalScore:session.totalScore,
     answers:session.answers
    })
  })
  socket.on("disconnect",async ()=>{
    console.log(`User Disconnected: ${socket.id}`);
    await redisClient.del(`session_id:${socket.id}`)
  })

})

const PORT = process.env.PORT || 5000

httpServer.listen(PORT,()=>{
  console.log(`Server is running on Port http://localhost:${PORT}`)
})