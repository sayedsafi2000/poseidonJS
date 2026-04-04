const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const ora = require('ora');
const { execSync } = require('child_process');

async function createFullStack(options) {
  const { projectName, installDeps, packageManager } = options;
  const targetDir = path.join(process.cwd(), projectName);
  
  try {
    // Step 1: Create main directory
    const spinner = ora('Creating project directory...').start();
    
    if (await fs.pathExists(targetDir)) {
      spinner.fail(`Directory ${chalk.cyan(projectName)} already exists!`);
      process.exit(1);
    }
    
    await fs.ensureDir(targetDir);
    spinner.succeed('Project directory created');
    
    // Step 2: Copy all templates
    spinner.text = 'Copying backend template...';
    spinner.start();
    
    const backendSource = path.join(__dirname, '..', 'templates', 'server');
    const backendTarget = path.join(targetDir, 'backend');
    await fs.copy(backendSource, backendTarget);
    spinner.succeed('Backend template copied');
    
    spinner.text = 'Copying admin dashboard template...';
    spinner.start();
    
    const adminSource = path.join(__dirname, '..', 'templates', 'admin');
    const adminTarget = path.join(targetDir, 'admin-dashboard');
    await fs.copy(adminSource, adminTarget);
    spinner.succeed('Admin dashboard template copied');
    
    spinner.text = 'Copying frontend template...';
    spinner.start();
    
    const frontendSource = path.join(__dirname, '..', 'templates', 'frontend');
    const frontendTarget = path.join(targetDir, 'frontend');
    await fs.copy(frontendSource, frontendTarget);
    spinner.succeed('Frontend template copied');
    
    // Step 3: Create .env files
    spinner.text = 'Setting up environment files...';
    spinner.start();
    
    // Backend .env
    const backendEnvExample = path.join(backendTarget, '.env.example');
    const backendEnvFile = path.join(backendTarget, '.env');
    if (await fs.pathExists(backendEnvExample)) {
      await fs.copy(backendEnvExample, backendEnvFile);
    }
    
    // Admin .env.local
    const adminEnvExample = path.join(adminTarget, '.env.example');
    const adminEnvFile = path.join(adminTarget, '.env.local');
    if (await fs.pathExists(adminEnvExample)) {
      await fs.copy(adminEnvExample, adminEnvFile);
    }
    
    // Frontend .env.local
    const frontendEnvExample = path.join(frontendTarget, '.env.example');
    const frontendEnvFile = path.join(frontendTarget, '.env.local');
    if (await fs.pathExists(frontendEnvExample)) {
      await fs.copy(frontendEnvExample, frontendEnvFile);
    }
    
    spinner.succeed('Environment files created');
    
    // Step 4: Create root package.json for monorepo
    spinner.text = 'Creating monorepo configuration...';
    spinner.start();
    
    const rootPackageJson = {
      name: projectName,
      version: "1.0.0",
      description: "PoseidonJS Full-Stack E-commerce Platform",
      private: true,
      workspaces: [
        "backend",
        "admin-dashboard",
        "frontend"
      ],
      scripts: {
        "dev": "concurrently \"npm run dev:backend\" \"npm run dev:admin\" \"npm run dev:frontend\"",
        "dev:backend": "npm run dev --workspace=backend",
        "dev:admin": "npm run dev --workspace=admin-dashboard",
        "dev:frontend": "npm run dev --workspace=frontend",
        "build": "npm run build --workspaces",
        "start": "concurrently \"npm run start:backend\" \"npm run start:admin\" \"npm run start:frontend\"",
        "start:backend": "npm run start --workspace=backend",
        "start:admin": "npm run start --workspace=admin-dashboard",
        "start:frontend": "npm run start --workspace=frontend"
      },
      devDependencies: {
        "concurrently": "^8.2.2"
      }
    };
    
    await fs.writeJson(path.join(targetDir, 'package.json'), rootPackageJson, { spaces: 2 });
    spinner.succeed('Monorepo configuration created');
    
    // Step 5: Create README
    const readme = `# ${projectName}

PoseidonJS Full-Stack E-commerce Platform

## 🚀 Quick Start

### 1. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 2. Setup Environment Files

Edit the following files with your configuration:

- \`backend/.env\` - Backend server configuration
- \`admin-dashboard/.env.local\` - Admin dashboard API URL
- \`frontend/.env.local\` - Frontend storefront API URL

### 3. Start MongoDB

\`\`\`bash
brew services start mongodb-community
\`\`\`

### 4. Run All Services

\`\`\`bash
npm run dev
\`\`\`

This will start:
- Backend: http://localhost:5000
- Admin Dashboard: http://localhost:3001
- Frontend: http://localhost:3000

## 📁 Project Structure

\`\`\`
${projectName}/
├── backend/              # Express.js REST API
├── admin-dashboard/      # Next.js Admin Panel
├── frontend/            # Next.js Storefront
└── package.json         # Monorepo root
\`\`\`

## 📚 Documentation

See individual README files in each directory for more details.

---

Built with 🌊 PoseidonJS
`;
    
    await fs.writeFile(path.join(targetDir, 'README.md'), readme);
    
    // Step 6: Install dependencies
    if (installDeps) {
      spinner.text = `Installing dependencies with ${packageManager}...`;
      spinner.start();
      
      try {
        const installCmd = packageManager === 'yarn' 
          ? 'yarn install' 
          : packageManager === 'pnpm'
          ? 'pnpm install'
          : 'npm install';
        
        execSync(installCmd, { 
          cwd: targetDir, 
          stdio: 'pipe' 
        });
        
        spinner.succeed('Dependencies installed successfully');
      } catch (error) {
        spinner.warn('Failed to install dependencies. You can install them manually later.');
      }
    }
    
    // Success message
    console.log('\n');
    console.log(chalk.green('✅ Full-stack project created successfully!\n'));
    console.log(chalk.cyan('📁 Project location:'), chalk.white(targetDir));
    console.log('\n');
    console.log(chalk.yellow('📝 Next steps:\n'));
    console.log(chalk.white(`  1. cd ${projectName}`));
    console.log(chalk.white(`  2. Edit environment files in each directory`));
    console.log(chalk.white(`     - backend/.env`));
    console.log(chalk.white(`     - admin-dashboard/.env.local`));
    console.log(chalk.white(`     - frontend/.env.local`));
    console.log(chalk.white(`  3. Start MongoDB: ${chalk.cyan('brew services start mongodb-community')}`));
    console.log(chalk.white(`  4. Run all services: ${chalk.cyan('npm run dev')}`));
    console.log('\n');
    console.log(chalk.gray('Services will run on:'));
    console.log(chalk.gray('  - Backend: http://localhost:5000'));
    console.log(chalk.gray('  - Admin: http://localhost:3001'));
    console.log(chalk.gray('  - Frontend: http://localhost:3000'));
    console.log('\n');
    
  } catch (error) {
    console.error(chalk.red('\n❌ Error creating project:'), error.message);
    process.exit(1);
  }
}

module.exports = createFullStack;
