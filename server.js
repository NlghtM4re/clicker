const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  const html = fs.readFileSync('index.html', 'utf8');
  res.end(html);
});

const wss = new WebSocket.Server({ server });

let leaderboardData = [];

wss.on('connection', (ws) => {
  // Send existing leaderboard data to the new client
  ws.send(JSON.stringify(leaderboardData));

  // Listen for updates from clients
  ws.on('message', (message) => {
    const data = JSON.parse(message);
    updateLeaderboard(data);
    // Broadcast updated leaderboard to all connected clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(leaderboardData));
      }
    });
  });
});

function updateLeaderboard(data) {
  const { username, clicks } = data;
  const userEntry = leaderboardData.find((entry) => entry.username === username);

  if (!userEntry || clicks > userEntry.clicks) {
    if (userEntry) {
      userEntry.clicks = clicks;
    } else {
      leaderboardData.push({ username, clicks });
    }

    // Sort the leaderboard in descending order
    leaderboardData.sort((a, b) => b.clicks - a.clicks);
  }
}

server.listen(3000, () => {
  console.log('Server listening on http://localhost:3000');
});
