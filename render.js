const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const configFlagIndex = args.indexOf('--config');

if (configFlagIndex === -1 || !args[configFlagIndex + 1]) {
  console.error('Usage: node render.js --config <path-to-config.json>');
  process.exit(1);
}

const configPath = args[configFlagIndex + 1];
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

console.log(`Rendering template: ${config.template}`);
console.log(`Config loaded from: ${configPath}`);
// render logic will go here
