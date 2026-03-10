/**
 * Engine - App list & card actions
 * Includes: type segment, status filter, create/edit/duplicate/export, etc.
 */
const translation = {
  segment: {
    all: 'All',
    more: 'More',
    collapse: 'Collapse',
    integrated: 'Integrated',
    interface: 'Interface',
    tripartite: 'Third-party',
  },
  statusFilter: 'Status',
  status: {
    all: 'All',
    stopped: 'Stopped',
    normal: 'Normal',
    error: 'Error',
    partialError: 'Partial Error',
  },
  statusLabel: 'Status',
  list: 'App List',
  createBy: 'Created by me',
  allTags: 'All Tags',
  newApp: {
    createApp: 'Create App',
    startFromBlank: 'Create from Blank',
    startFromTemplate: 'Create from Template',
    importFromDSL: 'Import from DSL',
  },
  editApp: 'Edit App',
  duplicate: 'Duplicate',
  export: 'Export DSL',
  saveAsTemplate: 'Save as Template',
  switch: 'Switch to Integrated App',
  deleteAppConfirmTitle: 'Delete this app?',
  deleteAppConfirmContent:
    'Deleting the app is irreversible. Users will no longer be able to access your app, and all prompt configurations and logs will be permanently deleted.',
  deleteApp: {
    success: 'Deleted successfully',
    error: {
      title: 'Delete failed',
      content: 'Delete failed: {{error}}',
    },
  },
  updateApp: {
    success: 'Updated successfully',
    error: {
      title: 'Update failed',
      content: 'Update failed: {{error}}',
    },
  },
  copyApp: {
    success: 'Duplicated successfully',
    error: {
      title: 'Duplicate failed',
      content: 'Duplicate failed: {{error}}',
    },
  },
  exportSuccess: 'Export successful',
  exportError: {
    title: 'Export failed',
  },
  name: 'App Name',
  namePlaceholder: 'Enter app name',
  type: 'App Type',
  icon: 'Icon',
  iconBg: 'Icon Background',
  priority: 'Priority',
  logLevel: 'Log Level',
  remark: 'Remark',
  remarkPlaceholder: 'Remark',
};

export default translation;
