import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Simple test to verify the bot structure
console.log('Testing Discord Bot structure...');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const requiredFiles = [
    'index.js',
    'package.json',
    'package-lock.json'
];

const optionalFiles = ['.env', 'updates.js'];
let allFilesExist = true;

requiredFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        console.log(`✓ ${file} exists`);
    } else {
        console.log(`✗ ${file} missing`);
        allFilesExist = false;
    }
});

optionalFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        console.log(`ℹ️  optional file ${file} exists`);
    } else {
        console.log(`ℹ️  optional file ${file} not found`);
    }
});

// Test 2: Check package.json dependencies
try {
    const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
    const requiredDeps = ['discord.js', 'dotenv', 'axios'];
    
    requiredDeps.forEach(dep => {
        if (packageJson.dependencies && packageJson.dependencies[dep]) {
            console.log(`✓ ${dep} dependency found`);
        } else {
            console.log(`✗ ${dep} dependency missing`);
            allFilesExist = false;
        }
    });
} catch (error) {
    console.log('✗ Error reading package.json:', error.message);
    allFilesExist = false;
}

// Test 3: Syntax check index.js without importing the bot runtime
try {
    console.log('✓ Checking index.js syntax...');
    execFileSync('node', ['--check', path.join(__dirname, 'index.js')], { stdio: 'ignore' });
    console.log('✓ index.js syntax looks good');
} catch (error) {
    console.log('✗ index.js syntax error:', error.message);
    allFilesExist = false;
}

console.log('\nTest completed:', allFilesExist ? 'PASSED' : 'FAILED');
process.exit(allFilesExist ? 0 : 1);
