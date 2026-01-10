export default async function handler(req, res) {
  try {
    const body = await req.json();
    const prompt = body.prompt;

    const response = await fetch("https://api.vercel.ai/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.VERCEL_AI_KEY}`
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        input: prompt
      })
    });

    const data = await response.json();

    res.status(200).json({
      answer: data.output_text || "No response"
    });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}