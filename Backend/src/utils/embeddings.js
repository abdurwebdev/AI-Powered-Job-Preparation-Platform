import axios from 'axios';

export const createEmbeddings = async (text) =>{
   const response = await axios.post(`https://api.mistral.ai/v1/embeddings`,{
    model:'mistral-embed',
    input:text
   },{
    headers:{
      Authorization:`Bearer: ${process.env.MISTRAL_API_KEY}`,
      "Content-Type":"application/json"
    }
   })

   return response.data.data[0].embeddings;
}