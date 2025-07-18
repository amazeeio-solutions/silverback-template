#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Logging setup
const DEBUG = process.env.DEBUG === 'true';
const LOG_DIR = path.join(process.cwd(), '.claude', 'logs');
const LOG_FILE = path.join(LOG_DIR, 'precommit-hook.log');

function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

function log(message, level = 'INFO') {
  if (!DEBUG) return;
  
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] [${level}] ${message}\n`;
  
  ensureLogDir();
  fs.appendFileSync(LOG_FILE, logEntry);
  
  // Also log to stderr for debugging
  console.error(`[${level}] ${message}`);
}

function outputJson(success, message, output = '') {
  const result = {
    success,
    message,
    output
  };
  
  log(`Output: ${JSON.stringify(result)}`, 'DEBUG');
  console.log(JSON.stringify(result, null, 2));
}

// Simple YAML parser for pnpm-workspace.yaml (only handles the packages array)
function parseSimpleYaml(yamlContent) {
  const lines = yamlContent.split('\n');
  const packages = [];
  let inPackagesSection = false;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    if (trimmedLine.startsWith('packages:')) {
      inPackagesSection = true;
      continue;
    }
    
    if (inPackagesSection) {
      if (trimmedLine.startsWith('- ')) {
        // Remove quotes and leading dash
        const packagePattern = trimmedLine.substring(2).replace(/^['"]|['"]$/g, '');
        packages.push(packagePattern);
      } else if (trimmedLine && !trimmedLine.startsWith('#')) {
        // End of packages section
        break;
      }
    }
  }
  
  return { packages };
}

class PackageDetector {
  constructor(projectRoot) {
    this.projectRoot = projectRoot;
    this.packageMap = new Map();
    this.workspacePatterns = [];
  }

  async init() {
    try {
      log(`Initializing PackageDetector for project root: ${this.projectRoot}`);
      
      // Read pnpm-workspace.yaml
      const workspaceFile = path.join(this.projectRoot, 'pnpm-workspace.yaml');
      const workspaceContent = fs.readFileSync(workspaceFile, 'utf8');
      const workspaceConfig = parseSimpleYaml(workspaceContent);
      this.workspacePatterns = workspaceConfig.packages || [];

      log(`Found workspace patterns: ${JSON.stringify(this.workspacePatterns)}`);

      // Find all packages
      await this.scanPackages();
      
      log(`Found ${this.packageMap.size} packages`);
    } catch (error) {
      log(`Failed to initialize PackageDetector: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  async scanPackages() {
    for (const pattern of this.workspacePatterns) {
      const packagesInPattern = await this.findPackagesForPattern(pattern);
      
      for (const pkg of packagesInPattern) {
        // Store both the absolute path and relative path as keys
        this.packageMap.set(pkg.path, pkg);
        this.packageMap.set(path.relative(this.projectRoot, pkg.path), pkg);
        log(`Registered package: ${pkg.name} at ${pkg.relativePath}`);
      }
    }
  }

  async findPackagesForPattern(pattern) {
    const packages = [];
    
    // Handle glob patterns like 'apps/*', 'packages/*', etc.
    if (pattern.endsWith('/*')) {
      const baseDir = pattern.slice(0, -2);
      const fullBaseDir = path.join(this.projectRoot, baseDir);
      
      if (fs.existsSync(fullBaseDir)) {
        const entries = fs.readdirSync(fullBaseDir, { withFileTypes: true });
        
        for (const entry of entries) {
          if (entry.isDirectory()) {
            const pkgPath = path.join(fullBaseDir, entry.name);
            const pkgJsonPath = path.join(pkgPath, 'package.json');
            
            if (fs.existsSync(pkgJsonPath)) {
              const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
              packages.push({
                name: pkgJson.name,
                path: pkgPath,
                relativePath: path.relative(this.projectRoot, pkgPath)
              });
            }
          }
        }
      }
    } else {
      // Handle exact patterns
      const pkgPath = path.join(this.projectRoot, pattern);
      const pkgJsonPath = path.join(pkgPath, 'package.json');
      
      if (fs.existsSync(pkgJsonPath)) {
        const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
        packages.push({
          name: pkgJson.name,
          path: pkgPath,
          relativePath: path.relative(this.projectRoot, pkgPath)
        });
      }
    }
    
    return packages;
  }

  findPackageForFile(filePath) {
    log(`Finding package for file: ${filePath}`);
    
    // Convert to absolute path
    const absolutePath = path.isAbsolute(filePath) 
      ? filePath 
      : path.join(this.projectRoot, filePath);
    
    log(`Absolute path: ${absolutePath}`);
    
    // Find the longest matching package path (most specific)
    let bestMatch = null;
    let bestMatchLength = 0;
    
    for (const [packagePath, packageInfo] of this.packageMap.entries()) {
      const absolutePackagePath = path.isAbsolute(packagePath) 
        ? packagePath 
        : path.join(this.projectRoot, packagePath);
      
      if (absolutePath.startsWith(absolutePackagePath + path.sep) || 
          absolutePath === absolutePackagePath) {
        if (absolutePackagePath.length > bestMatchLength) {
          bestMatch = packageInfo;
          bestMatchLength = absolutePackagePath.length;
          log(`Found potential match: ${packageInfo.name} (${absolutePackagePath})`);
        }
      }
    }
    
    if (bestMatch) {
      log(`Best match: ${bestMatch.name}`);
    } else {
      log('No package match found');
    }
    
    return bestMatch;
  }
}

// Function to find the nearest package.json file (fallback)
function findPackageRoot(startDir) {
  let dir = startDir;
  while (dir !== path.parse(dir).root) {
    if (fs.existsSync(path.join(dir, 'package.json'))) {
      return dir;
    }
    dir = path.dirname(dir);
  }
  return null;
}

async function main() {
  try {
    log('=== Precommit Hook Started ===');
    
    // Read JSON input from stdin
    const inputData = await new Promise((resolve, reject) => {
      let data = '';
      process.stdin.on('data', chunk => {
        data += chunk;
      });
      process.stdin.on('end', () => {
        resolve(data);
      });
      process.stdin.on('error', reject);
    });

    log(`Raw input: ${inputData}`);

    // Parse JSON input
    let hookInput;
    try {
      hookInput = JSON.parse(inputData);
    } catch (error) {
      log(`Failed to parse JSON input: ${error.message}`, 'ERROR');
      outputJson(false, 'Invalid JSON input', '');
      process.exit(1);
    }

    // Extract file path
    const filePath = hookInput.tool_input?.file_path;
    if (!filePath) {
      log('No file_path found in hook input', 'ERROR');
      outputJson(false, 'No file_path found in hook input', '');
      process.exit(1);
    }

    log(`Processing file: ${filePath}`);

    // Verify we're in the project root
    const projectRoot = process.cwd();
    const workspaceFile = path.join(projectRoot, 'pnpm-workspace.yaml');
    
    if (!fs.existsSync(workspaceFile)) {
      log('Not in project root - pnpm-workspace.yaml not found', 'ERROR');
      outputJson(false, 'Not in project root - pnpm-workspace.yaml not found', '');
      process.exit(1);
    }

    log(`Project root: ${projectRoot}`);

    // Try to detect package using workspace-aware approach
    let packageName = null;
    let packagePath = null;
    
    try {
      const detector = new PackageDetector(projectRoot);
      await detector.init();
      
      const packageInfo = detector.findPackageForFile(filePath);
      if (packageInfo) {
        packageName = packageInfo.name;
        packagePath = packageInfo.path;
        log(`Package detected: ${packageName} at ${packagePath}`);
      }
    } catch (error) {
      log(`Package detection failed: ${error.message}`, 'WARN');
    }

    // Fallback: find nearest package.json
    if (!packageName) {
      log('Using fallback package detection');
      const absolutePath = path.isAbsolute(filePath) 
        ? filePath 
        : path.resolve(projectRoot, filePath);
      
      const packageRoot = findPackageRoot(path.dirname(absolutePath));
      if (packageRoot) {
        const packageJsonPath = path.join(packageRoot, 'package.json');
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        packageName = packageJson.name;
        packagePath = packageRoot;
        log(`Fallback package detected: ${packageName} at ${packagePath}`);
      }
    }

    if (!packageName) {
      log('No package found for file', 'ERROR');
      outputJson(false, 'No package found for file', '');
      process.exit(1);
    }

    // Check if package has precommit script
    const packageJsonPath = path.join(packagePath, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    if (!packageJson.scripts?.precommit) {
      log(`No precommit script found in ${packageName}`, 'INFO');
      outputJson(true, `No precommit script found in ${packageName}, skipping`, '');
      process.exit(0);
    }

    // Run precommit
    log(`Running precommit for ${packageName}`);
    
    let command;
    let cwd;
    
    if (packagePath === projectRoot) {
      // If it's the root package, run directly
      command = 'pnpm precommit';
      cwd = projectRoot;
    } else {
      // Use pnpm --filter for workspace packages
      command = `pnpm --filter "${packageName}" precommit`;
      cwd = projectRoot;
    }

    log(`Executing: ${command} (cwd: ${cwd})`);

    try {
      const output = execSync(command, { 
        cwd, 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      log(`Precommit succeeded for ${packageName}`);
      outputJson(true, `Precommit passed successfully for package: ${packageName}`, output);
    } catch (error) {
      log(`Precommit failed for ${packageName}: ${error.message}`, 'ERROR');
      const output = error.stdout || error.stderr || error.message;
      outputJson(false, `Precommit failed for package: ${packageName}`, output);
      process.exit(1);
    }

  } catch (error) {
    log(`Unexpected error: ${error.message}`, 'ERROR');
    outputJson(false, 'Unexpected error occurred', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}