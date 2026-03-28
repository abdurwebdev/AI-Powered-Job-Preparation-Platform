import 'dotenv/config';
import express from 'express';

const app = express();

app.get('/',(req,res)=>{
  res.send("API is Running! ")
})

module.exports = app;
