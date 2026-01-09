export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.json({ reply: "No prompt provided" });
  }

  res.json({
    reply: `Hello 👋 You said: ${prompt}`,
  });
}
