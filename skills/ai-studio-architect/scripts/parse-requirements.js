#!/usr/bin/env node
/**
 * parse-requirements.js
 *
 * Scans a project's README.md, package.json, and source files to detect
 * infrastructure requirements for Google Cloud Platform deployment.
 *
 * Usage:
 *   node parse-requirements.js [--path /project/dir] [--format json|shell|summary]
 *
 * Output formats:
 *   summary  - Human-readable report (default)
 *   json     - Machine-readable JSON for downstream tools
 *   shell    - Partial init-gcp.sh with detected API enable commands
 */

const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
const SERVICE_PATTERNS = {
  firestore: {
    patterns: ['firestore', 'database', 'persistence', 'collection', '\\.doc(', 'getDoc', 'setDoc', 'addDoc'],
    api: 'firestore.googleapis.com',
    role: 'roles/datastore.user',
    label: 'Cloud Firestore',
  },
  storage: {
    patterns: ['storage', 'bucket', 'upload', 'assets', 'getDownloadURL', 'ref(storage', 'cloud storage'],
    api: 'storage.googleapis.com',
    role: 'roles/storage.objectAdmin',
    label: 'Cloud Storage',
  },
  vertexai: {
    patterns: ['gemini', '@google/generative-ai', '@google-cloud/vertexai', 'generateContent', 'generativeai', 'model.*gemini', 'ai studio'],
    api: 'aiplatform.googleapis.com',
    role: 'roles/aiplatform.user',
    label: 'Vertex AI',
  },
  cloudrun: {
    patterns: ['cloud run', 'backend', 'express', 'fastify', 'server\\.listen', 'app\\.listen', 'dockerfile', 'containerized'],
    api: 'run.googleapis.com',
    role: 'roles/run.invoker',
    label: 'Cloud Run',
  },
  secretmanager: {
    patterns: ['secret', 'api_key', 'api-key', 'apikey', 'credential', 'GEMINI_API_KEY', 'process\\.env'],
    api: 'secretmanager.googleapis.com',
    role: 'roles/secretmanager.secretAccessor',
    label: 'Secret Manager',
  },
  auth: {
    patterns: ['firebase-auth', 'authentication', 'signInWith', 'createUser', 'onAuthStateChanged', 'identitytoolkit'],
    api: 'identitytoolkit.googleapis.com',
    role: 'roles/firebaseauth.admin',
    label: 'Firebase Authentication',
  },
  scheduler: {
    patterns: ['schedule', 'cron', 'periodic', 'cloud scheduler'],
    api: 'cloudscheduler.googleapis.com',
    role: 'roles/cloudscheduler.admin',
    label: 'Cloud Scheduler',
  },
  pubsub: {
    patterns: ['pubsub', 'pub/sub', 'topic', 'subscription', 'event-driven', 'message queue'],
    api: 'pubsub.googleapis.com',
    role: 'roles/pubsub.publisher',
    label: 'Cloud Pub/Sub',
  },
  cloudbuild: {
    patterns: ['cloudbuild', 'cloud build', 'ci/cd', 'cicd', 'pipeline', 'continuous'],
    api: 'cloudbuild.googleapis.com',
    role: 'roles/cloudbuild.builds.builder',
    label: 'Cloud Build',
  },
};

const AI_STUDIO_PATTERNS = {
  react: ['react', 'jsx', 'tsx', 'React.', 'useState', 'useEffect'],
  angular: ['angular', '@angular', 'ng-', 'NgModule'],
  vite: ['vite', 'vite.config'],
  tailwind: ['tailwind', 'tailwindcss'],
  framerMotion: ['framer-motion', 'motion.div', 'AnimatePresence'],
  geminiService: ['geminiService', 'gemini-service'],
  clientSideAI: ['@google/generative-ai', 'GoogleGenerativeAI'],
};

// ---------------------------------------------------------------------------
// File scanning
// ---------------------------------------------------------------------------
function scanFile(filepath) {
  try {
    return fs.readFileSync(filepath, 'utf8').toLowerCase();
  } catch {
    return '';
  }
}

function findFiles(dir, extensions, maxDepth = 3, currentDepth = 0) {
  const results = [];
  if (currentDepth > maxDepth) return results;

  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist' || entry.name === 'build') continue;

      if (entry.isDirectory()) {
        results.push(...findFiles(fullPath, extensions, maxDepth, currentDepth + 1));
      } else if (extensions.some(ext => entry.name.endsWith(ext))) {
        results.push(fullPath);
      }
    }
  } catch {
    // Skip directories we cannot read
  }
  return results;
}

function scanProject(projectDir) {
  const allContent = [];

  // Priority files
  const priorityFiles = ['README.md', 'readme.md', 'package.json', 'Dockerfile', 'docker-compose.yml',
    'firebase.json', 'firestore.rules', '.env.example', 'cloudbuild.yaml', 'vite.config.ts', 'vite.config.js'];

  for (const file of priorityFiles) {
    const content = scanFile(path.join(projectDir, file));
    if (content) allContent.push({ file, content });
  }

  // Source files
  const sourceFiles = findFiles(path.join(projectDir, 'src'), ['.ts', '.tsx', '.js', '.jsx']);
  for (const file of sourceFiles) {
    const content = scanFile(file);
    if (content) allContent.push({ file: path.relative(projectDir, file), content });
  }

  return allContent;
}

// ---------------------------------------------------------------------------
// Detection
// ---------------------------------------------------------------------------
function detectServices(scannedFiles) {
  const combined = scannedFiles.map(f => f.content).join('\n');
  const detected = {};

  for (const [service, config] of Object.entries(SERVICE_PATTERNS)) {
    const matches = config.patterns.filter(p => {
      const regex = new RegExp(p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\\\*/g, '.*'), 'i');
      return regex.test(combined);
    });

    if (matches.length > 0) {
      detected[service] = {
        ...config,
        matchedPatterns: matches,
        confidence: matches.length >= 2 ? 'high' : 'medium',
      };
    }
  }

  return detected;
}

function detectAIStudioStack(scannedFiles) {
  const combined = scannedFiles.map(f => f.content).join('\n');
  const stack = {};

  for (const [feature, patterns] of Object.entries(AI_STUDIO_PATTERNS)) {
    const matches = patterns.filter(p => combined.includes(p));
    if (matches.length > 0) {
      stack[feature] = { detected: true, patterns: matches };
    }
  }

  return stack;
}

function detectEnvVars(scannedFiles) {
  const envVars = new Set();
  const envPattern = /process\.env\.([A-Z_][A-Z0-9_]*)/g;
  const vitePattern = /import\.meta\.env\.([A-Z_][A-Z0-9_]*)/g;

  for (const { content } of scannedFiles) {
    // process.env and import.meta.env are lowercased, so match case-insensitively
    const upperContent = scannedFiles.map(f => {
      try { return fs.readFileSync(path.resolve(f.file), 'utf8'); } catch { return ''; }
    }).join('\n');

    let match;
    while ((match = envPattern.exec(upperContent)) !== null) {
      envVars.add(match[1]);
    }
    while ((match = vitePattern.exec(upperContent)) !== null) {
      envVars.add(match[1]);
    }
  }

  return Array.from(envVars);
}

// ---------------------------------------------------------------------------
// Output formatters
// ---------------------------------------------------------------------------
function formatSummary(services, stack, envVars) {
  const lines = [];
  lines.push('=== AI Studio Architect: Project Analysis ===\n');

  // AI Studio stack
  lines.push('## Detected AI Studio Stack');
  const stackItems = Object.entries(stack);
  if (stackItems.length > 0) {
    for (const [feature, info] of stackItems) {
      lines.push(`  [+] ${feature}: ${info.patterns.join(', ')}`);
    }
  } else {
    lines.push('  [?] No AI Studio Build mode patterns detected.');
  }

  // GCP services
  lines.push('\n## Required GCP Services');
  const serviceItems = Object.entries(services);
  if (serviceItems.length > 0) {
    for (const [, config] of serviceItems) {
      lines.push(`  [${config.confidence === 'high' ? '!' : '?'}] ${config.label}`);
      lines.push(`      API: ${config.api}`);
      lines.push(`      Role: ${config.role}`);
      lines.push(`      Matched: ${config.matchedPatterns.join(', ')}`);
    }
  } else {
    lines.push('  [?] No GCP service patterns detected.');
  }

  // Environment variables
  if (envVars.length > 0) {
    lines.push('\n## Environment Variables Detected');
    for (const v of envVars) {
      lines.push(`  - ${v}`);
    }
    lines.push('\n  >> These should be stored in Secret Manager for production.');
  }

  // Recommendations
  lines.push('\n## Recommendations');
  if (stack.clientSideAI) {
    lines.push('  [!] Client-side Gemini SDK detected. Migrate to server-side Vertex AI behind Cloud Run.');
  }
  if (stack.geminiService) {
    lines.push('  [!] geminiService.ts detected. This file must be moved to a backend service.');
  }
  if (services.vertexai && !services.cloudrun) {
    lines.push('  [+] Vertex AI detected but no Cloud Run. Consider adding a Cloud Run backend proxy.');
  }

  return lines.join('\n');
}

function formatJSON(services, stack, envVars) {
  return JSON.stringify({
    aiStudioStack: stack,
    gcpServices: services,
    environmentVariables: envVars,
    apisToEnable: Object.values(services).map(s => s.api),
    iamRoles: Object.values(services).map(s => ({ service: s.label, role: s.role })),
  }, null, 2);
}

function formatShell(services) {
  const lines = [];
  lines.push('#!/bin/bash');
  lines.push('# Generated by AI Studio Architect - parse-requirements.js');
  lines.push('# Enable detected GCP APIs\n');
  lines.push('set -euo pipefail\n');
  lines.push('PROJECT_ID="${PROJECT_ID:-$(gcloud config get-value project)}"');
  lines.push('echo "Enabling APIs for project: $PROJECT_ID"\n');

  const apis = Object.values(services).map(s => s.api);
  if (apis.length > 0) {
    lines.push(`gcloud services enable \\\n  ${apis.join(' \\\n  ')} \\\n  --project="$PROJECT_ID"\n`);
  }

  lines.push('echo "Done. APIs enabled:"');
  for (const api of apis) {
    lines.push(`echo "  - ${api}"`);
  }

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
function main() {
  const args = process.argv.slice(2);
  let projectDir = process.cwd();
  let format = 'summary';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--path' && args[i + 1]) {
      projectDir = path.resolve(args[++i]);
    } else if (args[i] === '--format' && args[i + 1]) {
      format = args[++i];
    } else if (args[i] === '--help' || args[i] === '-h') {
      console.log('Usage: node parse-requirements.js [--path /project/dir] [--format json|shell|summary]');
      process.exit(0);
    }
  }

  if (!fs.existsSync(projectDir)) {
    console.error(`Error: Directory not found: ${projectDir}`);
    process.exit(1);
  }

  const scannedFiles = scanProject(projectDir);
  if (scannedFiles.length === 0) {
    console.error('Error: No recognizable project files found in', projectDir);
    process.exit(1);
  }

  const services = detectServices(scannedFiles);
  const stack = detectAIStudioStack(scannedFiles);
  const envVars = detectEnvVars(scannedFiles);

  switch (format) {
    case 'json':
      console.log(formatJSON(services, stack, envVars));
      break;
    case 'shell':
      console.log(formatShell(services));
      break;
    default:
      console.log(formatSummary(services, stack, envVars));
  }
}

main();
