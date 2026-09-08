#!/usr/bin/env node

const readline = require("readline");
const fs = require("fs");
const path = require("path");

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((resolve) => rl.question(q, resolve));

(async () => {
  console.log("\n🚀 MERN Boilerplate Setup\n");

  const projectName = (await ask("Project name (mern-boilerplate): ")) || "mern-boilerplate";
  const mongoUri = (await ask("MongoDB URI (mongodb://localhost:27017/" + projectName.replace(/\s+/g, "_") + "): ")) || `mongodb://localhost:27017/${projectName.replace(/\s+/g, "_")}`;
  const serverPort = (await ask("Server port (5000): ")) || "5000";
  const clientPort = (await ask("Client port (5173): ")) || "5173";

  rl.close();

  // Update root package.json
  const rootPkg = JSON.parse(fs.readFileSync("package.json", "utf-8"));
  rootPkg.name = projectName.toLowerCase().replace(/\s+/g, "-");
  fs.writeFileSync("package.json", JSON.stringify(rootPkg, null, 2) + "\n");

  // Update server package.json
  const serverPkg = JSON.parse(fs.readFileSync("server/package.json", "utf-8"));
  serverPkg.name = rootPkg.name + "-server";
  fs.writeFileSync("server/package.json", JSON.stringify(serverPkg, null, 2) + "\n");

  // Update client package.json
  const clientPkg = JSON.parse(fs.readFileSync("client/package.json", "utf-8"));
  clientPkg.name = rootPkg.name + "-client";
  fs.writeFileSync("client/package.json", JSON.stringify(clientPkg, null, 2) + "\n");

  // Update server .env.development
  const serverEnv = `NODE_ENV=development\nPORT=${serverPort}\nMONGO_URI=${mongoUri}\nCLIENT_URL=http://localhost:${clientPort}\n`;
  fs.writeFileSync("server/.env.development", serverEnv);

  // Update client .env.development
  const clientEnv = `VITE_API_URL=http://localhost:${serverPort}/api\n`;
  fs.writeFileSync("client/.env.development", clientEnv);

  // Update client vite.config.js port and proxy
  let viteConfig = fs.readFileSync("client/vite.config.js", "utf-8");
  viteConfig = viteConfig.replace(/port:\s*\d+/, `port: ${clientPort}`);
  viteConfig = viteConfig.replace(/target:\s*"http:\/\/localhost:\d+"/, `target: "http://localhost:${serverPort}"`);
  fs.writeFileSync("client/vite.config.js", viteConfig);

  // Update index.html title
  let indexHtml = fs.readFileSync("client/index.html", "utf-8");
  indexHtml = indexHtml.replace(/<title>.*<\/title>/, `<title>${projectName}</title>`);
  fs.writeFileSync("client/index.html", indexHtml);

  console.log(`\n✅ Project "${projectName}" configured successfully!`);
  console.log(`\nNext steps:`);
  console.log(`  npm run install:all   # Install dependencies`);
  console.log(`  npm run dev           # Start dev servers\n`);
})();
