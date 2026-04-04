const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const ora = require('ora');
const { execSync } = require('child_process');

async function createServer(options) {
  const { projectName, installDeps, packageManager } = options;
  const targetDir = path.join(process.cwd(), projectName);
  
  try {
    // Step 1: Create directory
    const spinner = ora('Creating project directory...').start();
    
    if (await fs.pathExists(targetDir)) {
      spinner.fail(`Directory ${chalk.cyan(projectName)} already exists!`);
      process.exit(1);
    }
    
    await fs.ensureDir(targetDir);
    spinner.succeed('Project directory created');
    
    // Step 2: Copy backend template
    spinner.text = 'Copying backend template files...';
    spinner.start();
    
    const sourceDir = path.join(__dirname, '..', 'templates', 'server');
    await fs.copy(sourceDir, targetDir);
    
    spinner.succeed('Template files copied');
    
    // Step 3: Create .env from .env.example
    spinner.text = 'Setting up environment file...';
    spinner.start();
    
    const envExample = path.join(targetDir, '.env.example');
    const envFile = path.join(targetDir, '.env');
    
    if (await fs.pathExists(envExample)) {
      await fs.copy(envExample, envFile);
      spinner.succeed('.env file created from template');
    } else {
      spinner.warn('.env.example not found, skipping .env creation');
    }
    
    // Step 4: Update package.json with project name
    spinner.text = 'Updating package.json...';
    spinner.start();
    
    const packageJsonPath = path.join(targetDir, 'package.json');
    if (await fs.pathExists(packageJsonPath)) {
      const packageJson = await fs.readJson(packageJsonPath);
      packageJson.name = projectName;
      await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
      spinner.succeed('package.json updated');
    }
    
    // Step 5: Install dependencies
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
    console.log(chalk.green('✅ Backend server created successfully!\n'));
    console.log(chalk.cyan('📁 Project location:'), chalk.white(targetDir));
    console.log('\n');
    console.log(chalk.yellow('📝 Next steps:\n'));
    console.log(chalk.white(`  1. cd ${projectName}`));
    console.log(chalk.white(`  2. Edit .env file with your configuration`));
    console.log(chalk.white(`  3. Start MongoDB: ${chalk.cyan('brew services start mongodb-community')}`));
    console.log(chalk.white(`  4. Run development server: ${chalk.cyan('npm run dev')}`));
    console.log('\n');
    console.log(chalk.gray('Server will run on: http://localhost:5000'));
    console.log('\n');
    
  } catch (error) {
    console.error(chalk.red('\n❌ Error creating project:'), error.message);
    process.exit(1);
  }
}

module.exports = createServer;
