import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export default async function handler(req, res) {
  try {
    const { message } = req.body;

    const completion = await groq.chat.completions.create({
      model: "llama3-70b-8192",
      messages: [
        { role: "system", content: "You are SILK AI, a smart helpful assistant." },
        { role: "user", content: message }
      ]
    });

    res.status(200).json({
      reply: completion.choices[0].message.content
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
