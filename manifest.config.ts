import { defineManifest } from '@crxjs/vite-plugin'
import pkg from './package.json'

// Store build omits `debugger` (and the deep-scan feature) for faster review.
const isStore = process.env.PAGELENS_STORE === '1'
const permissions = ['activeTab', 'scripting', 'storage']
if (!isStore) permissions.push('debugger')

export default defineManifest({
  manifest_version: 3,
  name: 'PageLens',
  description: pkg.description,
  version: pkg.version,
  icons: {
    16: 'icons/icon16.png',
    32: 'icons/icon32.png',
    48: 'icons/icon48.png',
    128: 'icons/icon128.png',
  },
  action: {
    default_popup: 'src/popup/index.html',
    default_title: 'PageLens — analyze this page',
    default_icon: {
      16: 'icons/icon16.png',
      32: 'icons/icon32.png',
      48: 'icons/icon48.png',
      128: 'icons/icon128.png',
    },
  },
  background: {
    service_worker: 'src/background/service-worker.ts',
    type: 'module',
  },
  permissions,
  host_permissions: ['https://api.thegreenwebfoundation.org/*'],
})
