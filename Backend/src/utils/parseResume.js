import { PDFParse } from 'pdf-parse';
export const parseResume = async (filebuffer) =>{
  const uintArray = new Uint8Array(filebuffer);
  const parser = new PDFParse(uintArray);
  const data =await parser.getText();
  return data.text;
}