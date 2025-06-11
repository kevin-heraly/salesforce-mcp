const express = require('express');
const jsforce = require('jsforce');

// 🔐 HARDCODED credentials for testing only
const SALESFORCE_USERNAME = 'kevin.heraly@demandscience.com';
const SALESFORCE_PASSWORD = 'L0v3Chl03#';
const SALESFORCE_SECURITY_TOKEN = 'g6bCVSLyfHiwRihRJGECPHIgG';
const PORT = 3001;

console.log("🔍 Using hardcoded credentials...");
console.log("Username:", SALESFORCE_USERNAME);

const app = express();
const conn = new jsforce.Connection();

// Try login
conn.login(
  SALESFORCE_USERNAME,
  SALESFORCE_PASSWORD + SALESFORCE_SECURITY_TOKEN,
  (err, res) => {
    if (err) {
      console.error('❌ Salesforce login failed:', err);
      process.exit(1);
    }
    console.log('✅ Connected to Salesforce');
    startServer();
  }
);

// Root metadata endpoint (required by ChatGPT) with all necessary headers
app.get('/', (req, res) => {
  res.set({
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  });
  res.json({
    name: "Salesforce MCP",
    description: "Custom connector to pull Salesforce data via MCP",
    version: "1.0",
    endpoints: ["/leads"]
  });
});

// Health check
app.get('/health', (req, res) => {
  res.send('Salesforce MCP is up');
});

// Example route: fetch 5 leads
app.get('/leads', async (req, res) => {
  try {
    const result = await conn.sobject('Lead')
      .find({}, { Id: 1, Name: 1, Company: 1, Email: 1 })
      .limit(5)
      .execute();

    res.json(result);
  } catch (err) {
    res.status(500).send(err.toString());
  }
});

// Start server AFTER Salesforce login succeeds
function startServer() {
  app.listen(PORT, () => {
    console.log(`🚀 MCP server running on http://localhost:${PORT}`);
  });
}
