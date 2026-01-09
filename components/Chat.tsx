const sendMessage = async (userMessage) => {
  try {
    const res = await fetch("http://127.0.0.1:3333/ask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt: userMessage
      })
    });

    const data = await res.json();

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response from AI";

    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: text }
    ]);

  } catch (error) {
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: "AI server not reachable" }
    ]);
  }
};
