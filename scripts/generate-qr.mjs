#!/usr/bin/env node

/**
 * Generate QR Code for Expo Go
 * Displays the QR code for scanning with Expo Go app
 */

import QRCode from 'qrcode';
import { execSync } from 'child_process';

// Get the local IP address
function getLocalIP() {
  try {
    const output = execSync('ipconfig getifaddr en0 || hostname -I', { encoding: 'utf-8' });
    return output.trim().split(' ')[0] || '127.0.0.1';
  } catch {
    return '127.0.0.1';
  }
}

// Get the Expo port (default 19000)
const port = process.env.EXPO_PORT || 19000;
const ip = getLocalIP();
const expoUrl = `exp://${ip}:${port}`;

console.log('\n📱 Expo Go QR Code Generator\n');
console.log(`URL: ${expoUrl}\n`);

// Generate QR code in terminal
QRCode.toString(expoUrl, { type: 'terminal', width: 20 }, (err, qrCode) => {
  if (err) {
    console.error('Error generating QR code:', err);
    process.exit(1);
  }

  console.log(qrCode);
  console.log('\n✅ Scan this QR code with Expo Go app\n');
  console.log('Instructions:');
  console.log('1. Open Expo Go on your phone');
  console.log('2. Tap "Scan QR Code"');
  console.log('3. Point your camera at the QR code above');
  console.log('4. Wait for the app to load\n');
});
