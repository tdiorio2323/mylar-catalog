#!/usr/bin/env node

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import { glob } from 'glob';

console.log('🔍 Starting Project UI/UX Audit...\n');

const results = {
  lint: { status: 'unknown', output: '' },
  typecheck: { status: 'unknown', output: '' },
  build: { status: 'unknown', output: '' },
  routes: { missing: [], existing: [], orphanedLinks: [] },
  uiGaps: { missingPages: [], buttonsWithoutHref: [] }
};

// Helper function to run commands safely
function runCommand(command, description) {
  console.log(`Running ${description}...`);
  try {
    const output = execSync(command, {
      cwd: process.cwd(),
      encoding: 'utf8',
      stdio: 'pipe'
    });
    return { status: 'pass', output: output.trim() };
  } catch (error) {
    return {
      status: 'fail',
      output: error.stdout ? error.stdout.trim() : error.message
    };
  }
}

// 1. LINT CHECK
console.log('📋 Running ESLint...');
results.lint = runCommand('npm run lint', 'ESLint');

// 2. TYPE CHECK
console.log('🔧 Running TypeScript check...');
results.typecheck = runCommand('npm run typecheck', 'TypeScript');

// 3. BUILD CHECK (dry run)
console.log('🏗️ Running Next.js build...');
results.build = runCommand('npm run build', 'Next.js Build');

// 4. ROUTE AUDIT
console.log('🛣️ Running route audit...');
try {
  execSync('node scripts/check-routes.mjs', { cwd: process.cwd(), stdio: 'pipe' });

  // Read the generated ROUTE_AUDIT.md if it exists
  if (fs.existsSync('ROUTE_AUDIT.md')) {
    const routeAuditContent = fs.readFileSync('ROUTE_AUDIT.md', 'utf8');
    const missingMatches = routeAuditContent.match(/❌ MISSING/g);
    results.routes.missingCount = missingMatches ? missingMatches.length : 0;
  }
} catch (error) {
  console.log('Route audit failed:', error.message);
}

// 5. SCAN FOR ORPHANED LINKS
console.log('🔗 Scanning for orphaned links...');

// Get all TSX files
const tsxFiles = glob.sync('src/**/*.tsx');
const allHrefs = new Set();
const buttonTexts = [];

for (const file of tsxFiles) {
  const content = fs.readFileSync(file, 'utf8');

  // Extract href attributes and Link hrefs
  const hrefMatches = content.match(/href=["']([^"']+)["']/g);
  if (hrefMatches) {
    hrefMatches.forEach(match => {
      const href = match.match(/href=["']([^"']+)["']/)[1];
      if (href.startsWith('/') && !href.startsWith('/api/')) {
        allHrefs.add(href);
      }
    });
  }

  // Look for buttons without href that might be navigation CTAs
  const buttonMatches = content.match(/<[Bb]utton[^>]*>([^<]*(?:Start|Learn|Vetting|Deposits|Dashboard|Login|Signup)[^<]*)<\/[Bb]utton>/g);
  if (buttonMatches) {
    buttonMatches.forEach(match => {
      if (!match.includes('href=')) {
        const text = match.match(/>([^<]+)</)[1];
        buttonTexts.push({ file: file.replace(process.cwd() + '/', ''), text: text.trim() });
      }
    });
  }
}

// Check which hrefs don't have corresponding page files
const requiredRoutes = [
  '/', '/intake', '/verify', '/deposit', '/screening', '/interview',
  '/contracts', '/confirmation', '/learn', '/vetting', '/deposits',
  '/login', '/dashboard', '/admin/codes'
];

for (const href of allHrefs) {
  let pageExists = false;

  if (href === '/') {
    pageExists = fs.existsSync('src/app/page.tsx');
  } else {
    const cleanHref = href.replace(/\/$/, ''); // Remove trailing slash
    const pagePath = `src/app${cleanHref}/page.tsx`;
    const groupPath = `src/app/(dash)${cleanHref}/page.tsx`; // Check route groups

    pageExists = fs.existsSync(pagePath) || fs.existsSync(groupPath);
  }

  if (!pageExists) {
    results.routes.orphanedLinks.push(href);
  }
}

// Check for missing required pages
for (const route of requiredRoutes) {
  let pageExists = false;

  if (route === '/') {
    pageExists = fs.existsSync('src/app/page.tsx');
  } else if (route === '/dashboard') {
    pageExists = fs.existsSync('src/app/(dash)/dashboard/page.tsx') || fs.existsSync('src/app/dashboard/page.tsx');
  } else {
    const cleanRoute = route.replace(/\/$/, '');
    const pagePath = `src/app${cleanRoute}/page.tsx`;
    const groupPath = `src/app/(dash)${cleanRoute}/page.tsx`;

    pageExists = fs.existsSync(pagePath) || fs.existsSync(groupPath);
  }

  if (!pageExists) {
    results.uiGaps.missingPages.push(route);
  }
}

results.uiGaps.buttonsWithoutHref = buttonTexts;

// 6. GENERATE AUDIT REPORT
console.log('📝 Generating audit report...\n');

const report = `# 🔍 PROJECT UI/UX AUDIT SUMMARY

**Generated:** ${new Date().toLocaleString()}  
**Project:** Next.js Application  
**Audit Tool:** scripts/project-audit.mjs

## 📊 OVERVIEW

| Check | Status | Details |
|-------|--------|---------|
| ESLint | ${results.lint.status === 'pass' ? '✅ PASS' : '❌ FAIL'} | ${results.lint.status === 'pass' ? 'No linting errors' : 'Linting issues found'} |
| TypeScript | ${results.typecheck.status === 'pass' ? '✅ PASS' : '❌ FAIL'} | ${results.typecheck.status === 'pass' ? 'No type errors' : 'Type errors found'} |
| Build | ${results.build.status === 'pass' ? '✅ PASS' : '❌ FAIL'} | ${results.build.status === 'pass' ? 'Build successful' : 'Build failed'} |
| Routes | ${results.routes.missingCount === 0 ? '✅ PASS' : '⚠️ ISSUES'} | ${results.routes.missingCount || 0} missing routes |

## 🧪 LINT RESULTS

**Status:** ${results.lint.status === 'pass' ? '✅ PASS' : '❌ FAIL'}

\`\`\`
${results.lint.output || 'No output'}
\`\`\`

## 🔧 TYPECHECK RESULTS

**Status:** ${results.typecheck.status === 'pass' ? '✅ PASS' : '❌ FAIL'}

\`\`\`
${results.typecheck.output || 'No output'}
\`\`\`

## 🏗️ BUILD SUMMARY

**Status:** ${results.build.status === 'pass' ? '✅ SUCCESS' : '❌ ERRORS'}

\`\`\`
${results.build.output ? results.build.output.split('\n').slice(-20).join('\n') : 'No output'}
\`\`\`

## 🛣️ MISSING/PLACEHOLDER ROUTES

${results.uiGaps.missingPages.length === 0 ? '✅ All required routes exist' : `
**Missing Pages (${results.uiGaps.missingPages.length}):**
${results.uiGaps.missingPages.map(route => `- \`${route}\``).join('\n')}
`}

## 🔗 ORPHANED LINKS

${results.routes.orphanedLinks.length === 0 ? '✅ No orphaned links found' : `
**Links without corresponding pages (${results.routes.orphanedLinks.length}):**
${results.routes.orphanedLinks.map(link => `- \`${link}\``).join('\n')}
`}

## 🎨 UI/UX GAPS

### Buttons Without Navigation

${results.uiGaps.buttonsWithoutHref.length === 0 ? '✅ No navigation buttons without hrefs' : `
**Potential navigation buttons without href (${results.uiGaps.buttonsWithoutHref.length}):**
${results.uiGaps.buttonsWithoutHref.map(btn => `- \`${btn.file}\`: "${btn.text}"`).join('\n')}
`}

## ✅ ACTION CHECKLIST

### High Priority
${results.lint.status !== 'pass' ? '- [ ] Fix ESLint errors' : ''}
${results.typecheck.status !== 'pass' ? '- [ ] Fix TypeScript errors' : ''}
${results.build.status !== 'pass' ? '- [ ] Fix build errors' : ''}
${results.uiGaps.missingPages.length > 0 ? `- [ ] Create missing pages: ${results.uiGaps.missingPages.join(', ')}` : ''}

### Medium Priority
${results.routes.orphanedLinks.length > 0 ? `- [ ] Fix orphaned links: ${results.routes.orphanedLinks.slice(0, 5).join(', ')}${results.routes.orphanedLinks.length > 5 ? '...' : ''}` : ''}
${results.uiGaps.buttonsWithoutHref.length > 0 ? '- [ ] Add navigation hrefs to CTA buttons' : ''}

### Low Priority
- [ ] Review route naming consistency
- [ ] Add loading states for async components
- [ ] Implement error boundaries
- [ ] Add accessibility attributes
- [ ] Optimize bundle size

## 🎯 RECOMMENDATIONS

${results.lint.status === 'pass' && results.typecheck.status === 'pass' && results.build.status === 'pass'
    ? '🎉 **Excellent!** Your codebase passes all basic checks. Focus on completing missing pages and improving UX.'
    : '🔧 **Action Required:** Fix the failing checks above before focusing on feature development.'
  }

${results.uiGaps.missingPages.length === 0 && results.routes.orphanedLinks.length === 0
    ? '🚀 **Navigation Complete:** All core routes are implemented and accessible.'
    : '🛣️ **Navigation Issues:** Complete missing pages and fix broken links for optimal user experience.'
  }

---
*To re-run this audit: \`npm run audit\`*
`;

fs.writeFileSync('AUDIT_SUMMARY.md', report);
console.log('✅ Audit complete! Results saved to AUDIT_SUMMARY.md');

// Print summary to console
const summary = `
📊 AUDIT SUMMARY:
- Lint: ${results.lint.status}
- TypeScript: ${results.typecheck.status}  
- Build: ${results.build.status}
- Missing pages: ${results.uiGaps.missingPages.length}
- Orphaned links: ${results.routes.orphanedLinks.length}
- CTA buttons without href: ${results.uiGaps.buttonsWithoutHref.length}
`;

console.log(summary);