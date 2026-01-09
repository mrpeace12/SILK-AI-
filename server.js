import express from "express";

const app = express();
app.use(express.json());

app.post("/chat", (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.json({ reply: "No prompt provided" });
  }

  res.json({
    reply: `Hello 👋 You said: ${prompt}`
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
