import { Server } from "socket.io"
import { handleInterviewSocket } from "../sockets/interview.socket.js"

export const initSocket = (server) =>{
   const io = new Server(server,{
    cors:{origin:"http://localhost:5173",credentials:true}
   })

   io.on("connection",(socket)=>{
    console.log("User connected:- ",socket.id)

    handleInterviewSocket(socket,io);
   })
}