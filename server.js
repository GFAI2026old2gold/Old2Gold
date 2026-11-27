const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ ok: true, message: 'Old2Gold server is running!' });
});

app.post('/webhook', (req, res) => {
  const repo = req.body?.repository?.full_name || 'test-repo';
  const branch = req.body?.ref || 'main';
  console.log('Received GitHub push for:', repo, 'on', branch);

  res.status(200).json({ received: true, repo, branch });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

app.get('/', (req, res) => {
  res.send('Old2Gold control server is up! Try /health or POST /webhook.');
});