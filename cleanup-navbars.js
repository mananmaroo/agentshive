const fs = require('fs');
const path = require('path');

const pages = [
  'app/about/page.tsx',
  'app/blog/page.tsx',
  'app/categories/page.tsx',
  'app/faq/page.tsx',
  'app/learn-videos/page.tsx',
  'app/request-agent/page.tsx',
  'app/support/page.tsx',
  'app/top-agents/page.tsx',
];

pages.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  if (!fs.existsSync(fullPath)) {
    console.log(`❌ ${filePath} not found`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf-8');

  // Remove SharedNavbar and SharedFooter imports
  content = content.replace(/import { SharedNavbar } from '@\/app\/components\/shared-navbar';\n/g, '');
  content = content.replace(/import { SharedFooter } from '@\/app\/components\/shared-footer';\n/g, '');

  // Remove <SharedNavbar /> component
  content = content.replace(/<SharedNavbar\s*\/>/g, '');

  // Remove <SharedFooter /> component
  content = content.replace(/<SharedFooter\s*\/>/g, '');

  fs.writeFileSync(fullPath, content);
  console.log(`✅ ${filePath} cleaned`);
});

console.log('\n✨ Done! All duplicate navbars removed.');
