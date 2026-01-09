import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export default async function handler(req, res) {
  try {
const { message, prompt } = req.body;
const userMessage = message || prompt;

if (!userMessage) {
  return res.status(400).json({ reply: "No prompt provided" });
}
const completion = await groq.chat.completions.create({
  timeout: 20000,
model: "mixtral-8x7b-32768",
      messages: [
        { role: "system", content: "You are SILK AI, a smart helpful assistant." },
        { role: "user", content: usermessage }
      ]
    });

    res.status(200).json({
      reply: completion.choices[0].message.content
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
