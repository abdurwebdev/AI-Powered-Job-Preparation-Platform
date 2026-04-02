// utils/typing.js
export const typeText = async (fullText, callback, delay = 0.000000000001) => {
  for (let i = 0; i < fullText.length; i++) {
    callback(fullText.slice(0, i + 1));
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
};