import { Client, GatewayIntentBits } from 'discord.js';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=discord',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('Discord not connected');
  }
  return accessToken;
}

async function getUncachableDiscordClient() {
  const token = await getAccessToken();

  const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
  });

  await client.login(token);
  return client;
}

export async function fetchDiscordAnnouncements() {
  return [
    {
      id: '1',
      title: 'New Treasury Dashboard Launch',
      content: 'Excited to announce our new token-gated treasury dashboard for Kong NFT holders! Check it out and let us know your feedback.',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      author: 'KingDAO Team',
    },
    {
      id: '2',
      title: 'Governance Proposal #5 Now Live',
      content: 'A new proposal for treasury allocation has been posted on Snapshot. All Kong holders can vote until Friday.',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      author: 'Governance Committee',
    },
    {
      id: '3',
      title: 'Monthly Community Call',
      content: 'Join us this Thursday at 5PM UTC for our monthly community call. We\'ll discuss Q1 treasury performance and upcoming initiatives.',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      author: 'Community Manager',
    },
  ];
}
