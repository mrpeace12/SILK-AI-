export default function handler(req, res) {
  res.status(200).json({
    status: "SILK AI API running",
    time: new Date().toISOString()
  });
}
