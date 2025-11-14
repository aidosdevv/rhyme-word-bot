const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function askFromGemini(word_rhyme) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `Придумай 5 рифм к слову «${word_rhyme}». Ответь только рифмами, через запятую.`;

  try {
    const result = await model.generateContentStream(prompt);

    let fullText = '';
    for await (const chunk of result.stream) {
      fullText += chunk.text();
    }

    return fullText
      .split(',')
      .map(r => r.trim())
      .filter(Boolean)
      .slice(0, 5);

  } catch (error) {
    console.error("Ошибка Gemini:", error);
    return ['(не удалось найти рифмы)'];
  }
}

module.exports = askFromGemini;