const { spawn } = require('child_process');
const path = require('path');

console.log('Starting Next.js development server...');
console.log('Working directory:', process.cwd());
console.log('Node version:', process.version);

const nextPath = path.join(__dirname, 'node_modules', '.bin', 'next');
console.log('Next.js path:', nextPath);

const child = spawn('node', [nextPath, 'dev'], {
  cwd: __dirname,
  env: { ...process.env, NODE_ENV: 'development' },
  stdio: 'inherit'
});

child.on('error', (error) => {
  console.error('Failed to start Next.js:', error);
});

child.on('exit', (code) => {
  console.log(`Next.js exited with code ${code}`);
});