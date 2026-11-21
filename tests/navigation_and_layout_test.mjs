/**
 * Phase 2 Navigation and Layout Verification Test
 * CreatorFlow AI
 * 
 * Verifies:
 * 1. 5 primary navigation routes and pages exist and are properly structured
 * 2. 7 legacy routes are preserved for backward compatibility
 * 3. Sidebar navigation configuration contains all 5 primary sections with sub-drawers
 * 4. TopNav quick actions route to unified Create and Publish workflows
 * 5. Mobile navigation drawer contains all 5 primary sections
 * 6. Responsive styling and themes (Dark Navy, Pure Black, Light) are properly defined in globals.css
 */

import fs from 'fs';
import path from 'path';

let passedTests = 0;
let totalTests = 0;

function assert(condition, testName, details = '') {
  totalTests++;
  if (condition) {
    console.log(`\x1b[32m✔ PASS\x1b[0m [${totalTests}] ${testName}`);
    passedTests++;
  } else {
    console.error(`\x1b[31m✘ FAIL\x1b[0m [${totalTests}] ${testName}`);
    if (details) console.error(`  Details: ${details}`);
  }
}

console.log('=====================================================');
console.log('   Phase 2 Navigation & Layout Verification Suite    ');
console.log('=====================================================\n');

// 1. Verify 5 Primary Navigation Pages Exist
const primaryRoutes = [
  { name: 'HOME', path: 'src/app/dashboard/page.tsx' },
  { name: 'CREATE', path: 'src/app/dashboard/create/page.tsx' },
  { name: 'PUBLISH', path: 'src/app/dashboard/publish/page.tsx' },
  { name: 'ANALYTICS', path: 'src/app/dashboard/analytics/page.tsx' },
  { name: 'SETTINGS', path: 'src/app/dashboard/settings/page.tsx' },
];

for (const route of primaryRoutes) {
  const exists = fs.existsSync(route.path);
  const content = exists ? fs.readFileSync(route.path, 'utf8') : '';
  const hasExport = content.includes('export default');
  assert(exists && hasExport, `Primary Route [${route.name}]: ${route.path} exists and exports page`);
}

// 2. Verify 7 Legacy Routes Exist for 100% Backward Compatibility
const legacyRoutes = [
  'src/app/dashboard/assistant/page.tsx',
  'src/app/dashboard/calendar/page.tsx',
  'src/app/dashboard/channels/page.tsx',
  'src/app/dashboard/metadata/page.tsx',
  'src/app/dashboard/subscription/page.tsx',
  'src/app/dashboard/thumbnails/page.tsx',
  'src/app/dashboard/uploads/page.tsx',
];

for (const route of legacyRoutes) {
  const exists = fs.existsSync(route);
  assert(exists, `Legacy Route preserved: ${route}`);
}

// 3. Verify Sidebar Navigation Structure
const sidebarContent = fs.readFileSync('src/components/layout/sidebar.tsx', 'utf8');
const hasHomeNav = sidebarContent.includes("href: '/dashboard'") || sidebarContent.includes('href: "/dashboard"');
const hasCreateNav = sidebarContent.includes("href: '/dashboard/create'") || sidebarContent.includes('href: "/dashboard/create"');
const hasPublishNav = sidebarContent.includes("href: '/dashboard/publish'") || sidebarContent.includes('href: "/dashboard/publish"');
const hasAnalyticsNav = sidebarContent.includes("href: '/dashboard/analytics'") || sidebarContent.includes('href: "/dashboard/analytics"');
const hasSettingsNav = sidebarContent.includes("href: '/dashboard/settings'") || sidebarContent.includes('href: "/dashboard/settings"');

assert(hasHomeNav && hasCreateNav && hasPublishNav && hasAnalyticsNav && hasSettingsNav, 
  'Sidebar contains all 5 primary navigation sections (Home, Create, Publish, Analytics, Settings)');

const hasSubItems = sidebarContent.includes('subItems:') && 
                    sidebarContent.includes('Create Studio') && 
                    sidebarContent.includes('Thumbnail Studio') && 
                    sidebarContent.includes('Upload Manager');
assert(hasSubItems, 'Sidebar contains sub-drawers mapping legacy capabilities into primary sections');

// 4. Verify TopNav Quick Actions and Mobile Navigation
const topNavContent = fs.readFileSync('src/components/layout/top-nav.tsx', 'utf8');
const topNavHasCreate = topNavContent.includes('/dashboard/create');
const topNavHasPublish = topNavContent.includes('/dashboard/publish');
assert(topNavHasCreate && topNavHasPublish, 'TopNav quick actions link directly to /dashboard/create and /dashboard/publish');

const mobileHas5Sections = topNavContent.includes('CONSOLIDATED_NAV_ITEMS') &&
                           topNavContent.includes('section.name') &&
                           topNavContent.includes('section.href');
assert(mobileHas5Sections, 'Mobile responsive drawer dynamically links to the 5 primary sections');

// 5. Verify CSS Themes and Button Contrast
const cssContent = fs.readFileSync('src/app/globals.css', 'utf8');
const hasDarkNavy = cssContent.includes('[data-theme="dark"]') && cssContent.includes('Deepest navy');
const hasPureBlack = cssContent.includes('[data-theme="amoled"]');
const hasLightTheme = cssContent.includes('[data-theme="light"]');
const hasLightContrastFix = cssContent.includes('[data-theme="light"] button.text-white');

assert(hasDarkNavy && hasPureBlack && hasLightTheme, 'Globals CSS defines all 3 required SaaS themes (Dark Navy, OLED Black, Modern Light)');
assert(hasLightContrastFix, 'Globals CSS contains light theme button contrast protection to prevent white text on white backgrounds');

// 6. Verify Create Page Capabilities
const createContent = fs.readFileSync('src/app/dashboard/create/page.tsx', 'utf8');
const hasCentralInput = createContent.includes('What video do you want to create today?');
const hasAiOutputs = (createContent.includes('Opening Hooks') || createContent.includes('Hooks & Ideas')) &&
                     (createContent.includes('Select Primary Title') || createContent.includes('Title Variations')) &&
                     (createContent.includes('Video Script Draft') || createContent.includes('Script Studio'));
const hasSaveProject = createContent.includes('Save as Video Project');

assert(hasCentralInput && hasAiOutputs && hasSaveProject, 
  'Create page has single starting point ("What video do you want to create today?"), multi-title/hook/script generation, and 1-click project saving');

// 7. Verify Publish Page Capabilities
const publishContent = fs.readFileSync('src/app/dashboard/publish/page.tsx', 'utf8');
const hasProjectsHub = publishContent.includes('projects') && publishContent.includes('Video Projects');
const hasThumbnailStudio = publishContent.includes('thumbnails') && publishContent.includes('Thumbnail Studio');
const hasUploadWizard = publishContent.includes('uploads') && publishContent.includes('Upload Manager');
const hasCalendar = publishContent.includes('calendar') && publishContent.includes('Publishing Calendar');

assert(hasProjectsHub && hasThumbnailStudio && hasUploadWizard && hasCalendar,
  'Publish page contains all 4 unified workspaces (Projects Hub, Thumbnail Studio, Upload Manager, Calendar)');

console.log(`\n=====================================================`);
console.log(`Result: ${passedTests} / ${totalTests} tests passed`);
console.log(`=====================================================\n`);

if (passedTests === totalTests) {
  process.exit(0);
} else {
  process.exit(1);
}
