#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

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

/**
 * Detects which pnpm workspace package a file belongs to
 * Usage: node detect-package.js <file-path>
 */

class PackageDetector {
  constructor(projectRoot) {
    this.projectRoot = projectRoot;
    this.packageMap = new Map();
    this.workspacePatterns = [];
  }

  /**
   * Initialize by reading workspace configuration and scanning packages
   */
  async init() {
    try {
      // Read pnpm-workspace.yaml
      const workspaceFile = path.join(this.projectRoot, 'pnpm-workspace.yaml');
      const workspaceContent = fs.readFileSync(workspaceFile, 'utf8');
      const workspaceConfig = parseSimpleYaml(workspaceContent);
      this.workspacePatterns = workspaceConfig.packages || [];

      // Find all packages
      await this.scanPackages();
    } catch (error) {
      console.error('Failed to initialize PackageDetector:', error.message);
      process.exit(1);
    }
  }

  /**
   * Scan all packages and build path -> package mapping
   */
  async scanPackages() {
    for (const pattern of this.workspacePatterns) {
      const packagesInPattern = await this.findPackagesForPattern(pattern);
      
      for (const pkg of packagesInPattern) {
        // Store both the absolute path and relative path as keys
        this.packageMap.set(pkg.path, pkg);
        this.packageMap.set(path.relative(this.projectRoot, pkg.path), pkg);
      }
    }
  }

  /**
   * Find all packages matching a workspace pattern
   */
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

  /**
   * Find the package that contains the given file path
   */
  findPackageForFile(filePath) {
    // Convert to absolute path
    const absolutePath = path.isAbsolute(filePath) 
      ? filePath 
      : path.join(this.projectRoot, filePath);
    
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
        }
      }
    }
    
    return bestMatch;
  }
}

async function main() {
  const filePath = process.argv[2];
  
  if (!filePath) {
    console.error('Usage: node detect-package.js <file-path>');
    process.exit(1);
  }

  // Find project root by looking for pnpm-workspace.yaml
  let projectRoot = process.cwd();
  while (projectRoot !== path.parse(projectRoot).root) {
    if (fs.existsSync(path.join(projectRoot, 'pnpm-workspace.yaml'))) {
      break;
    }
    projectRoot = path.dirname(projectRoot);
  }

  if (!fs.existsSync(path.join(projectRoot, 'pnpm-workspace.yaml'))) {
    console.error('Could not find pnpm-workspace.yaml in any parent directory');
    process.exit(1);
  }

  const detector = new PackageDetector(projectRoot);
  await detector.init();
  
  const packageInfo = detector.findPackageForFile(filePath);
  
  if (packageInfo) {
    console.log(JSON.stringify({
      name: packageInfo.name,
      path: packageInfo.path,
      relativePath: packageInfo.relativePath
    }));
  } else {
    console.log(JSON.stringify({ error: 'Package not found for file: ' + filePath }));
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('Error:', error.message);
    process.exit(1);
  });
}

module.exports = { PackageDetector };