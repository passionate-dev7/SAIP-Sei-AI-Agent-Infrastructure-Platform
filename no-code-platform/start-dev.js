#!/usr/bin/env node

console.log("Starting Next.js development server...");
console.log("Node version:", process.version);
console.log("Platform:", process.platform);

// Check if all required files exist
const fs = require('fs');
const path = require('path');

const requiredFiles = [
  'package.json',
  'next.config.js',
  'tsconfig.json',
  'tailwind.config.js',
  'app/layout.tsx',
  'app/page.tsx',
  'app/globals.css'
];

console.log("\nChecking required files:");
let allFilesExist = true;

requiredFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  console.log(`${exists ? '✓' : '✗'} ${file}`);
  if (!exists) allFilesExist = false;
});

if (allFilesExist) {
  console.log("\n✓ All required files present");
  
  // Try to start the Next.js dev server
  const { spawn } = require('child_process');
  const child = spawn('npx', ['next', 'dev'], {
    stdio: 'inherit',
    shell: true
  });

  child.on('error', (error) => {
    console.error('Failed to start dev server:', error);
  });
} else {
  console.log("\n✗ Missing required files. Please ensure all files are present.");
}