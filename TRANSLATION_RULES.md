# FluxOS Frontend - Translation Structure Rules

**Version:** 2.1
**Last Updated:** 2025-10-22
**Status:** Official Standard

---

## 📜 Purpose

This document defines the **mandatory translation structure rules** for the FluxOS frontend internationalization (i18n) system. All developers MUST follow these rules when adding or modifying translations.

---

## 🎯 Core Principles

1. **Consistency** - Same structure across all locale files
2. **No Duplicates** - One key, one location
3. **Predictability** - Component path determines namespace
4. **Synchronization** - en.json and pl.json must mirror each other perfectly

---

## 📐 Spacing and Formatting Rules

### Rule #1: Icon + Text Spacing

Icons must use CSS margin classes (never direct spacing in template):

```vue
✅ CORRECT - Icon with margin class:
<VIcon class="mr-2">mdi-check</VIcon>
<span>{{ t('core.subscriptionManager.title') }}</span>

<VBtn>
  <VIcon class="mr-2">mdi-save</VIcon>
  <span>{{ t('common.buttons.save') }}</span>
</VBtn>

❌ WRONG - No spacing class:
<VIcon>mdi-check</VIcon><span>{{ t('key') }}</span>

❌ WRONG - Manual spacing in template:
<VIcon>mdi-check</VIcon> <span>{{ t('key') }}</span>
```

**Standard margin classes:**
- `class="mr-1"` - Small spacing (4px)
- `class="mr-2"` - Medium spacing (8px) - **Most common**
- `class="mr-3"` - Large spacing (12px)

### Rule #2: Number + Unit Spacing

Always include space between numbers and units (GB, MB, KB, blocks, hours, minutes, days):

```vue
✅ CORRECT - Space between number and unit:
<span>100 {{ t('core.subscriptionManager.blocks') }}</span>
<span>5 GB</span>
<span>2 hours</span>
<span>{{ fileSize }} MB</span>

❌ WRONG - No space:
<span>100{{ t('core.subscriptionManager.blocks') }}</span>
<span>5GB</span>
<span>2hours</span>
```

**Translation strings should NOT include numbers:**

```json
✅ CORRECT:
{
  "blocks": "blocks",
  "blocksFromNow": "blocks from now"
}

// Usage:
100 {{ t('blocks') }}
(100 {{ t('blocksFromNow') }})

❌ WRONG:
{
  "hundredBlocks": "100 blocks"  // Don't hardcode numbers in translations
}
```

---

## 📁 Required File Structure

### Translation Files Location
```
src/plugins/i18n/locales/
├── en.json          # English (master reference)
├── pl.json          # Polish (must mirror en.json structure exactly)
└── index.ts         # Loader (do not modify structure)
```

**Critical Rule:** en.json and pl.json must have **IDENTICAL key structures** at all times. Currently both files have 1739 lines and are perfectly synchronized.

---

## 🗂️ Actual Namespace Hierarchy

**IMPORTANT:** This is the ACTUAL structure in en.json and pl.json. Follow this exactly.

```json
{
  "$vuetify": {},          // Vuetify framework overrides (DO NOT MODIFY structure)

  "common": {              // Shared UI elements used across the entire app
    "buttons": {},         // save, cancel, delete, close, confirm, etc.
    "labels": {},          // name, description, status, type, version, etc.
    "status": {},          // Generic reusable status values: active, inactive, online, offline, etc.
    "messages": {},        // Common messages: pleaseWait, noData, loading, etc.
    "resources": {},       // Resources: cpu, ram, hdd, ssd, bandwidth, etc.
    "time": {}             // Time units: second, minute, hour, day, week, month, year
  },

  "menu": {},              // Navigation menu items only (Home, Dashboard, Applications, etc.)

  "sections": {            // Menu section descriptions for home page cards
    "dashboard": {         // Dashboard section (title + description)
      "title": "",
      "description": ""
    },
    "application": {},     // Application section
    "administration": {},  // Administration section
    "fluxXdao": {}        // Flux xDAO section
  },

  "core": {                // Core components from src/@core/components/*.vue
    "appDetailsCard": {},
    "backupAndRestore": {},
    "componentDetails": {},
    "confirmCustomDialog": {},
    "dropZone": {},
    "fileUpload": {},
    "locations": {},
    "login": {},
    "logViewer": {},
    "notifications": {},
    "runningInstances": {},
    "subscriptionManager": {},  // Fixed: was at root level
    "terminal": {},
    "theCustomizer": {},
    "volumeBrowser": {
      "files": {}          // Fixed: was at root level as "files"
    },
    "volumePathBuilder": {},
    "statusBar": {}        // Fixed: was at root level as "status"
  },

  "components": {          // Feature components from src/components/
    "dialogs": {
      "importJsonDialog": {},  // Fixed: was at root level as "importDialog"
      "importSpecDialog": {},
      "upgradeSpecDialog": {}
    },
    "marketplace": {
      "appCard": {},
      "appConfigCard": {},
      "appsGrid": {},
      "discoverCard": {},
      "fluxCloudAppCard": {},
      "gameCard": {},
      "installDialog": {},
      "maintenanceCard": {},
      "marketplaceAppCard": {},
      "marketplaceAppList": {},
      "newListedCard": {},
      "panels": {
        "groupsPanel": {},
        "headerPanel": {},
        "screenshotsPanel": {}
      },
      "sponsoredAppCard": {},
      "sponsoredCard": {}
    },
    "xdao": {
      "addProposal": {},
      "proposalDetail": {}
    },
    "fluxDrive": {
      "fileManager": {},
      "pricingPlans": {},
      "storageInfo": {},
      "versionsDialog": {}
    },
    "shared": {
      "loginDialog": {}
    },
    "appLoadingIndicator": {},
    "appPricing": {},
    "checkoutContent": {}
  },

  "pages": {               // Page-level namespaces (WRAPPED under "pages")
    "administration": {},  // src/pages/administration/*.vue
    "apps": {},           // src/pages/apps/*.vue
    "costCalculator": {}, // src/pages/cost-calculator.vue
    "dashboard": {},      // src/pages/dashboards/*.vue
    "fluxDrive": {},      // src/pages/flux-drive.vue
    "marketplace": {},    // src/pages/marketplace/*.vue
    "xdao": {},          // src/pages/xdao-app.vue
    "error": {},         // src/pages/[...error].vue
    "successCheckout": {}, // src/pages/successcheckout.vue
    "unauthorized": {}   // src/pages/unauthorized.vue
  }
}
```

**Total:** 7 top-level namespaces ($vuetify, common, menu, sections, core, components, pages)

---

## 🔗 Component → Translation Mapping Rules

### Rule #1: File Path Determines Namespace

| Vue Component File Path | Translation Namespace | Example Key |
|------------------------|----------------------|-------------|
| `src/@core/components/Login.vue` | `core.login.*` | `core.login.emailRequired` |
| `src/@core/components/StatusBar.vue` | `core.statusBar.*` | `core.statusBar.connected` |
| `src/@core/components/VolumeBrowser.vue` | `core.volumeBrowser.*` | `core.volumeBrowser.files.emptyDirectory` |
| `src/components/marketplace/InstallDialog.vue` | `components.marketplace.installDialog.*` | `components.marketplace.installDialog.title` |
| `src/components/dialogs/ImportJsonDialog.vue` | `components.dialogs.importJsonDialog.*` | `components.dialogs.importJsonDialog.uploadFile` |
| `src/components/xdao/AddProposalTab.vue` | `components.xdao.addProposal.*` | `components.xdao.addProposal.title` |
| `src/pages/dashboards/home.vue` | `pages.dashboard.*` | `pages.dashboard.totalNodes` |
| `src/pages/administration/manage-users.vue` | `pages.administration.*` | `pages.administration.manageUsers` |
| `src/pages/marketplace/index.vue` | `pages.marketplace.*` | `pages.marketplace.featured` |

**IMPORTANT NOTES:**
- Page namespaces are **WRAPPED under "pages"**
- Folder name in singular form becomes namespace (e.g., `dashboards/` → `pages.dashboard.*`)
- Core components always use `core.*` prefix
- Feature components use `components.*` prefix
- Page components always use `pages.*` prefix

### Rule #2: Common Elements Use `common.*`

All shared UI elements (buttons, labels, status messages, resources) MUST use the `common` namespace:

```vue
<!-- ✅ CORRECT -->
<v-btn>{{ t('common.buttons.save') }}</v-btn>
<label>{{ t('common.labels.name') }}</label>
<span>{{ t('common.status.active') }}</span>
<p>{{ t('common.resources.cpu') }}: 80%</p>

<!-- ❌ WRONG - Don't create duplicates -->
<v-btn>{{ t('core.login.saveButton') }}</v-btn>  <!-- Use common.buttons.save! -->
<label>{{ t('dashboard.nameLabel') }}</label>    <!-- Use common.labels.name! -->
```

### Rule #3: Menu Section Descriptions Use `sections.*`

Home page menu section cards use the `sections` namespace for title and description:

```vue
<!-- Example: Home page section card -->
<template>
  <v-card>
    <v-card-title>{{ t('sections.dashboard.title') }}</v-card-title>
    <v-card-text>{{ t('sections.dashboard.description') }}</v-card-text>
  </v-card>
</template>
```

**Structure:**
```json
{
  "sections": {
    "dashboard": {
      "title": "Dashboard",
      "description": "View and manage your Flux node overview"
    },
    "application": {
      "title": "Applications",
      "description": "Manage your Flux applications"
    }
  }
}
```

---

## ⚠️ Forbidden Patterns (NO DUPLICATES!)

### ❌ DO NOT DO THIS:

```json
{
  "status": { "connected": "Connected" },      // Root level - WRONG!
  "core": {
    "statusBar": { "connected": "Connected" }  // Duplicate - WRONG!
  }
}
```

### ✅ CORRECT APPROACH:

```json
{
  "core": {
    "statusBar": { "connected": "Connected" }  // Single location - CORRECT!
  }
}
```

**Use in component:**
```vue
<!-- File: src/@core/components/StatusBar.vue -->
<template>
  <p>{{ t('core.statusBar.connected') }}</p>
</template>
```

---

## 🎨 Naming Conventions

### Key Naming Rules:

1. **camelCase** for all keys (never snake_case or kebab-case)
2. **Descriptive** names (abbreviations only for industry standards)
3. **Consistent** with component/feature name

```json
// ✅ CORRECT
"createBackup": "Create Backup",
"emailRequired": "Email is required",
"backupUploadedSuccessfully": "Backup uploaded successfully",
"cpu": "CPU",           // Industry standard abbreviation - OK
"ram": "RAM",           // Industry standard abbreviation - OK
"url": "URL",           // Industry standard abbreviation - OK
"ip": "IP Address",     // Industry standard abbreviation - OK
"hdd": "HDD",           // Industry standard abbreviation - OK
"ssd": "SSD"            // Industry standard abbreviation - OK

// ❌ WRONG
"create_backup": "...",      // snake_case - WRONG!
"email-required": "...",     // kebab-case - WRONG!
"emailReq": "...",          // Non-standard abbreviation - WRONG!
"bkup": "...",              // Non-standard abbreviation - WRONG!
```

**Abbreviation Guidelines:**
- ✅ **Allowed:** Industry-standard technical terms (cpu, ram, url, ip, hdd, ssd, api, id, etc.)
- ❌ **Forbidden:** Custom abbreviations that reduce clarity (emailReq, pwdReset, usrMgmt, etc.)

---

## 🌍 Multi-Language Synchronization

### Rule: Perfect Structure Mirror

**en.json and pl.json MUST have identical key structures.**

**en.json:**
```json
{
  "core": {
    "statusBar": {
      "backend": "Backend",
      "frontend": "Frontend",
      "connected": "Connected",
      "connecting": "Connecting",
      "disconnected": "Disconnected"
    }
  }
}
```

**pl.json:**
```json
{
  "core": {
    "statusBar": {
      "backend": "Backend",
      "frontend": "Frontend",
      "connected": "Połączony",
      "connecting": "Łączenie",
      "disconnected": "Rozłączony"
    }
  }
}
```

**Key paths must match exactly!** Any mismatch will cause runtime errors or fallback to English.

---

## 🔧 Parameter Interpolation

Use `{variable}` syntax for dynamic values:

```json
{
  "backupUploadedSuccessfully": "{component} backup uploaded to FluxDrive successfully.",
  "editing": "Editing: {file}",
  "continent": "Continent: {name}",
  "notSyncedMessage": "Node is not synced. Current: {blocks}, Expected: {headers}, Behind: {blocksBehind}"
}
```

**Usage in Vue:**
```vue
<template>
  <p>{{ t('core.backupAndRestore.backupUploadedSuccessfully', { component: 'nginx' }) }}</p>
  <!-- Output: "nginx backup uploaded to FluxDrive successfully." -->

  <p>{{ t('core.statusBar.notSyncedMessage', {
    blocks: 1000,
    headers: 1500,
    blocksBehind: 500
  }) }}</p>
  <!-- Output: "Node is not synced. Current: 1000, Expected: 1500, Behind: 500" -->
</template>
```

---

## 📝 Adding New Translations - Checklist

Before committing translation changes, verify:

- [ ] Translation key follows the namespace hierarchy rules
- [ ] No duplicate keys exist elsewhere in the file
- [ ] Key exists in BOTH en.json AND pl.json with matching structure
- [ ] Key name uses camelCase (or allowed industry abbreviation)
- [ ] Component file path correctly maps to translation namespace
- [ ] Common elements use `common.*` namespace (not duplicated)
- [ ] Polish translation is accurate (not just English copy)
- [ ] Parameters use `{variable}` syntax correctly
- [ ] Line count matches between en.json and pl.json
- [ ] Dev server runs with no i18n errors (`npm run dev`)

---

## 🚨 Common Mistakes to Avoid

### 1. Creating Duplicates
```json
// ❌ WRONG
"subscriptionManager": { "title": "Subscriptions" },              // Root level
"core": { "subscriptionManager": { "title": "Subscriptions" } }   // Duplicate!

// ✅ CORRECT - Choose ONE location based on file path
"core": { "subscriptionManager": { "title": "Subscriptions" } }   // For @core/components/SubscriptionManager.vue
```

### 2. Wrong Namespace for Page Components
```vue
<!-- File: src/pages/dashboards/home.vue -->

<!-- ❌ WRONG -->
<h1>{{ t('dashboard.title') }}</h1>  <!-- Missing "pages" wrapper -->

<!-- ✅ CORRECT -->
<h1>{{ t('pages.dashboard.title') }}</h1>  <!-- Wrapped under pages namespace -->
```

### 3. Wrong Namespace for Core Components
```vue
<!-- File: src/@core/components/StatusBar.vue -->

<!-- ❌ WRONG -->
<h1>{{ t('statusBar.backend') }}</h1>  <!-- Missing 'core.' prefix -->

<!-- ✅ CORRECT -->
<h1>{{ t('core.statusBar.backend') }}</h1>  <!-- Matches src/@core/components/StatusBar.vue -->
```

### 4. Missing Polish Translation
```json
// ❌ WRONG - en.json has key but pl.json doesn't
// This will cause fallback to English in Polish interface!

// ✅ CORRECT - Always add to BOTH files with accurate translations
```

### 5. Confusing Generic Status with Node Status

**IMPORTANT DISTINCTION:**

- `common.status.*` → Generic reusable status values for any UI element
  ```json
  {
    "common": {
      "status": {
        "active": "Active",
        "inactive": "Inactive",
        "online": "Online",
        "offline": "Offline",
        "pending": "Pending"
      }
    }
  }
  ```

- `core.statusBar.*` → Specific to FluxOS node connection status
  ```json
  {
    "core": {
      "statusBar": {
        "backend": "Backend",
        "frontend": "Frontend",
        "connected": "Connected",
        "connecting": "Connecting",
        "disconnected": "Disconnected",
        "notSynced": "Not Synced",
        "unreachable": "Unreachable"
      }
    }
  }
  ```

**Usage examples:**
```vue
<!-- Generic status for any component -->
<v-chip :color="isActive ? 'success' : 'error'">
  {{ isActive ? t('common.status.active') : t('common.status.inactive') }}
</v-chip>

<!-- FluxOS node-specific status -->
<v-card>
  <v-card-text>{{ t('core.statusBar.backend') }}: {{ version }}</v-card-text>
  <v-card-text>{{ t('core.statusBar.connected') }}</v-card-text>
</v-card>
```

---

## 🛠️ Migration Guide (Fixing Existing Issues)

If you find existing translations violating these rules:

1. **Identify the correct namespace** based on component file path
2. **Move translation keys** to correct location in BOTH en.json and pl.json
3. **Update all t() calls** in Vue components to use new namespace
4. **Remove duplicate/orphaned keys** from old locations
5. **Verify synchronization** - check that en.json and pl.json have same structure
6. **Test in dev server** - ensure no i18n errors or missing translations

**Example Migration:**

```bash
# Step 1: Find where translation is used
grep -r "t('status.connected')" src/@core/components/

# Step 2: Identify correct namespace (StatusBar.vue is in @core)
# Correct namespace: core.statusBar.connected

# Step 3: Move keys in en.json and pl.json
# From: { "status": { "connected": "..." } }
# To:   { "core": { "statusBar": { "connected": "..." } } }

# Step 4: Update component
# From: t('status.connected')
# To:   t('core.statusBar.connected')

# Step 5: Test
npm run dev
```

---

## 📊 Validation

### Manual Validation:

```bash
# Search for translation usage in component
grep -r "t('core.statusBar" src/@core/components/StatusBar.vue

# Verify key exists in both locale files
grep '"connected"' src/plugins/i18n/locales/en.json
grep '"connected"' src/plugins/i18n/locales/pl.json

# Check line counts match
wc -l src/plugins/i18n/locales/en.json src/plugins/i18n/locales/pl.json
```

### Automated Validation:

Create validation script `check_i18n_keys.js`:
```javascript
import fs from 'fs'

const enPath = './src/plugins/i18n/locales/en.json'
const plPath = './src/plugins/i18n/locales/pl.json'

const en = JSON.parse(fs.readFileSync(enPath, 'utf-8'))
const pl = JSON.parse(fs.readFileSync(plPath, 'utf-8'))

function getKeys(obj, prefix = '') {
  let keys = []
  for (const key in obj) {
    const path = prefix ? `${prefix}.${key}` : key
    if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
      keys = keys.concat(getKeys(obj[key], path))
    } else {
      keys.push(path)
    }
  }
  return keys
}

const enKeys = getKeys(en).sort()
const plKeys = getKeys(pl).sort()

const missingInPl = enKeys.filter(k => !plKeys.includes(k))
const missingInEn = plKeys.filter(k => !enKeys.includes(k))

if (missingInPl.length > 0) {
  console.error('❌ Missing in pl.json:', missingInPl)
}
if (missingInEn.length > 0) {
  console.error('❌ Missing in en.json:', missingInEn)
}
if (missingInPl.length === 0 && missingInEn.length === 0) {
  console.log('✅ All keys synchronized! Total keys:', enKeys.length)
}
```

Run with: `node check_i18n_keys.js`

---

## 📞 Questions?

If you're unsure about where to place a translation:

1. **Check the Vue component file path**
   - `src/@core/components/*.vue` → `core.*`
   - `src/components/**/*.vue` → `components.*`
   - `src/pages/**/*.vue` → `pages.*` (wrapped under pages namespace)

2. **Match it to the namespace hierarchy**
   - Core components: `core.{componentName}.*`
   - Feature components: `components.{featureName}.{componentName}.*`
   - Page components: `pages.{pageName}.*` (wrapped under pages)

3. **Follow the pattern of similar components**
   - Look for existing components in the same directory
   - Check their translation usage for consistency

4. **Use common namespace for shared elements**
   - Buttons, labels, status values, resources, time units
   - Don't duplicate these in component-specific namespaces

5. **When in doubt, ask for review before committing**

---

## 📋 Real-World Examples

### Example 1: Core Component (StatusBar.vue)
**File:** `src/@core/components/StatusBar.vue`
**Namespace:** `core.statusBar.*`

```vue
<template>
  <v-card>
    <span>{{ t('core.statusBar.backend') }}: {{ fluxVersion }}</span>
    <span>{{ t('core.statusBar.frontend') }}: {{ frontendVersion }}</span>
    <span>{{ t('core.statusBar.statusMessage') }}: {{ nodeStatus }}</span>
    <v-tooltip>
      <span>{{ t('core.statusBar.connected') }}</span>
    </v-tooltip>
  </v-card>
</template>
```

**Translation:**
```json
{
  "core": {
    "statusBar": {
      "backend": "Backend",
      "frontend": "Frontend",
      "statusMessage": "Status",
      "connected": "Connected",
      "connecting": "Connecting",
      "disconnected": "Disconnected",
      "notSynced": "Not Synced",
      "unreachable": "Unreachable",
      "updateAvailable": "Update available",
      "upToDate": "Up to date",
      "checkingStatus": "Checking status...",
      "checkingStatusMessage": "Checking node status...",
      "connectedMessage": "Node is connected and confirmed",
      "connectingMessage": "Node connection is being established",
      "disconnectedMessage": "Node is disconnected",
      "notSyncedMessage": "Node is not synced. Current: {blocks}, Expected: {headers}, Behind: {blocksBehind}"
    }
  }
}
```

### Example 2: Feature Component (InstallDialog.vue)
**File:** `src/components/marketplace/InstallDialog.vue`
**Namespace:** `components.marketplace.installDialog.*`

```vue
<template>
  <v-dialog>
    <v-card-title>{{ t('components.marketplace.installDialog.title') }}</v-card-title>
    <v-btn @click="install">{{ t('common.buttons.install') }}</v-btn>
    <v-btn @click="cancel">{{ t('common.buttons.cancel') }}</v-btn>
  </v-dialog>
</template>
```

**Translation:**
```json
{
  "common": {
    "buttons": {
      "install": "Install",
      "cancel": "Cancel"
    }
  },
  "components": {
    "marketplace": {
      "installDialog": {
        "title": "Install Application",
        "selectVersion": "Select Version",
        "confirmInstall": "Confirm Installation"
      }
    }
  }
}
```

### Example 3: Page Component (home.vue)
**File:** `src/pages/dashboards/home.vue`
**Namespace:** `pages.dashboard.*` (wrapped under pages, note singular form)

```vue
<template>
  <div>
    <h1>{{ t('pages.dashboard.title') }}</h1>
    <p>{{ t('pages.dashboard.totalNodes') }}: {{ nodeCount }}</p>
    <v-card>
      <v-card-title>{{ t('sections.dashboard.title') }}</v-card-title>
      <v-card-text>{{ t('sections.dashboard.description') }}</v-card-text>
    </v-card>
  </div>
</template>
```

**Translation:**
```json
{
  "pages": {
    "dashboard": {
      "title": "Dashboard",
      "totalNodes": "Total Nodes",
      "activeNodes": "Active Nodes"
    }
  },
  "sections": {
    "dashboard": {
      "title": "Dashboard",
      "description": "View and manage your Flux node overview"
    }
  }
}
```

---

## 📈 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-10-21 | Initial official rules document |
| 2.0 | 2025-10-22 | **Major update:**<br>• Added "sections" namespace documentation<br>• Clarified common.status vs core.statusBar distinction<br>• Updated abbreviation rules (allow industry standards)<br>• Explained singular vs plural folder naming<br>• Added real-world examples with actual file paths<br>• Documented namespace fixes (subscriptionManager, status→statusBar, files→volumeBrowser.files, importDialog→importJsonDialog)<br>• Added validation script example<br>• Improved clarity throughout all sections |
| 2.1 | 2025-10-22 | **Structural change:**<br>• **BREAKING CHANGE:** Wrapped all page namespaces under "pages" parent<br>• Moved 10 page namespaces (administration, apps, costCalculator, dashboard, fluxDrive, marketplace, xdao, error, successCheckout, unauthorized) under "pages"<br>• Reduced top-level namespaces from 16 to 7<br>• Updated all examples and documentation to reflect pages.* prefix<br>• Page components now use `pages.{pageName}.*` instead of `{pageName}.*` |

---

## 🔒 Enforcement

**This is the official standard. Follow it consistently in every session and every translation change.**

- ✅ All new translations MUST follow these rules
- ✅ All existing translations SHOULD be migrated to follow these rules
- ✅ Code reviews MUST verify translation structure compliance
- ✅ Pre-commit hooks SHOULD validate key synchronization

**Non-compliance will result in:**
- Runtime i18n errors (missing keys)
- Fallback to English in non-English locales
- Inconsistent user experience
- Merge conflicts and technical debt

---

**Follow these rules to maintain a clean, scalable, and maintainable internationalization system.**
