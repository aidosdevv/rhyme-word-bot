require('dotenv').config();
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function askFromOpenAI(word_rhyme) {

  if (!word_rhyme || typeof word_rhyme !== 'string') {
    return ['(ошибка слова)'];
  }

  const prompt = `Дай ровно 5 точных и красивых рифм к русскому слову "${word_rhyme}". 
  Только сами слова через запятую, без номеров, без кавычек, без пояснений. 
  Пример: дом — ком, том, гром, альбом, хром`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",           
      messages: [
        { role: "system", content: "Ты — эксперт по русской поэзии и рифмам. Даёшь только точные рифмы." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 50,
    });

    const text = completion.choices[0].message.content.trim();

   
    const rhymes = text
      .split(',')
      .map(r => r.trim())
      .filter(r => r.length > 0)
      .slice(0, 5);

    
    while (rhymes.length < 5) {
      rhymes.push('(нет рифмы)');
    }

    return rhymes;

  } catch (error) {
    console.error("Ошибка OpenAI:", error.message);
    return ['(ошибка связи)'];
  }
}

module.exports = askFromOpenAI;