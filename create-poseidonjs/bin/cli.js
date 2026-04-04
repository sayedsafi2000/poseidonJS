#!/usr/bin/env node

const { Command } = require('commander');
const inquirer = require('inquirer');
const chalk = require('chalk');
const gradient = require('gradient-string');
const createServer = require('../lib/create-server');
const createAdmin = require('../lib/create-admin');
const createFrontend = require('../lib/create-frontend');
const createFullStack = require('../lib/create-fullstack');

// Banner
console.log('\n');
console.log(gradient.pastel.multiline([
  '╔═══════════════════════════════════════════╗',
  '║                                           ║',
  '║         🌊 Create PoseidonJS 🌊          ║',
  '║                                           ║',
  '║   E-commerce Platform Generator           ║',
  '║                                           ║',
  '╚═══════════════════════════════════════════╝'
].join('\n')));
console.log('\n');

const program = new Command();

program
  .name('create-poseidonjs')
  .description('Create a new PoseidonJS e-commerce project')
  .version('1.0.0');

// Server command
program
  .command('server [name]')
  .description('Create a new backend server (Express.js + MongoDB)')
  .action(async (name) => {
    console.log(chalk.cyan('\n🚀 Creating PoseidonJS Backend Server...\n'));
    
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: 'Project name:',
        default: name || 'poseidon-server',
        validate: (input) => {
          if (/^[a-z0-9-_]+$/.test(input)) return true;
          return 'Project name should only contain lowercase letters, numbers, hyphens, and underscores';
        }
      },
      {
        type: 'confirm',
        name: 'installDeps',
        message: 'Install dependencies automatically?',
        default: true
      },
      {
        type: 'list',
        name: 'packageManager',
        message: 'Choose package manager:',
        choices: ['npm', 'yarn', 'pnpm'],
        default: 'npm',
        when: (answers) => answers.installDeps
      }
    ]);
    
    await createServer(answers);
  });

// Admin command
program
  .command('admin [name]')
  .description('Create a new admin dashboard (Next.js + TypeScript)')
  .action(async (name) => {
    console.log(chalk.cyan('\n📊 Creating PoseidonJS Admin Dashboard...\n'));
    
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: 'Project name:',
        default: name || 'poseidon-admin',
        validate: (input) => {
          if (/^[a-z0-9-_]+$/.test(input)) return true;
          return 'Project name should only contain lowercase letters, numbers, hyphens, and underscores';
        }
      },
      {
        type: 'confirm',
        name: 'installDeps',
        message: 'Install dependencies automatically?',
        default: true
      },
      {
        type: 'list',
        name: 'packageManager',
        message: 'Choose package manager:',
        choices: ['npm', 'yarn', 'pnpm'],
        default: 'npm',
        when: (answers) => answers.installDeps
      }
    ]);
    
    await createAdmin(answers);
  });

// Frontend command
program
  .command('frontend [name]')
  .description('Create a new e-commerce storefront (Next.js + TypeScript)')
  .action(async (name) => {
    console.log(chalk.cyan('\n🛍️ Creating PoseidonJS Frontend Storefront...\n'));
    
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: 'Project name:',
        default: name || 'poseidon-frontend',
        validate: (input) => {
          if (/^[a-z0-9-_]+$/.test(input)) return true;
          return 'Project name should only contain lowercase letters, numbers, hyphens, and underscores';
        }
      },
      {
        type: 'confirm',
        name: 'installDeps',
        message: 'Install dependencies automatically?',
        default: true
      },
      {
        type: 'list',
        name: 'packageManager',
        message: 'Choose package manager:',
        choices: ['npm', 'yarn', 'pnpm'],
        default: 'npm',
        when: (answers) => answers.installDeps
      }
    ]);
    
    await createFrontend(answers);
  });

// Full-stack command
program
  .command('full-stack [name]')
  .description('Create complete full-stack project (Backend + Admin + Frontend)')
  .action(async (name) => {
    console.log(chalk.cyan('\n🌊 Creating Complete PoseidonJS Full-Stack Project...\n'));
    
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: 'Project name (folder name):',
        default: name || 'poseidon-ecommerce',
        validate: (input) => {
          if (/^[a-z0-9-_]+$/.test(input)) return true;
          return 'Project name should only contain lowercase letters, numbers, hyphens, and underscores';
        }
      },
      {
        type: 'confirm',
        name: 'installDeps',
        message: 'Install dependencies automatically?',
        default: true
      },
      {
        type: 'list',
        name: 'packageManager',
        message: 'Choose package manager:',
        choices: ['npm', 'yarn', 'pnpm'],
        default: 'npm',
        when: (answers) => answers.installDeps
      }
    ]);
    
    await createFullStack(answers);
  });

// Default command (interactive)
program
  .action(async () => {
    const { projectType } = await inquirer.prompt([
      {
        type: 'list',
        name: 'projectType',
        message: 'What would you like to create?',
        choices: [
          { name: '🚀 Backend Server (Express.js + MongoDB)', value: 'server' },
          { name: '📊 Admin Dashboard (Next.js)', value: 'admin' },
          { name: '🛍️  Frontend Storefront (Next.js)', value: 'frontend' },
          { name: '🌊 Full-Stack Project (All in one)', value: 'full-stack' }
        ]
      }
    ]);
    
    // Execute the selected command
    program.parse(['node', 'cli', projectType]);
  });

program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
