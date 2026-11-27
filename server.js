/*const express = require('express');
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
});*/

const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

const nodes = new Map();
const HEARTBEAT_TIMEOUT_MS = 15000;

app.get('/', (req, res) => {
  res.send('Old2Gold control server is up! Try /health, /nodes, or POST /webhook.');
});

app.get('/health', (req, res) => {
  res.json({ ok: true, message: 'Old2Gold server is running!' });
});

app.post('/nodes/register', (req, res) => {
  const { nodeId, cpuCores = 1, ramMb = 512 } = req.body || {};

  if (!nodeId) {
    return res.status(400).json({ ok: false, error: 'nodeId is required' });
  }

  const node = {
    nodeId,
    cpuCores,
    ramMb,
    status: 'online',
    lastSeen: Date.now(),
  };

  nodes.set(nodeId, node);
  console.log('Registered node:', node);

  res.status(201).json({ ok: true, node });
});

app.post('/nodes/heartbeat', (req, res) => {
  const { nodeId } = req.body || {};

  if (!nodeId || !nodes.has(nodeId)) {
    return res.status(404).json({ ok: false, error: 'Unknown nodeId; register first' });
  }

  const node = nodes.get(nodeId);
  node.lastSeen = Date.now();
  node.status = 'online';

  res.json({ ok: true, node });
});

app.get('/nodes', (req, res) => {
  const now = Date.now();
  const list = Array.from(nodes.values()).map((node) => ({
    ...node,
    status: now - node.lastSeen > HEARTBEAT_TIMEOUT_MS ? 'offline' : 'online',
  }));

  res.json({ ok: true, count: list.length, nodes: list });
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