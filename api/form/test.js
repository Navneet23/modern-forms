export default function handler(req, res) {
  res.status(200).json({
    message: 'Form API folder is working!',
    timestamp: new Date().toISOString()
  });
}
