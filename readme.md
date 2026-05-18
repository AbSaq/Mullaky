# Mullaky

## ⚡ Core Operational Features

### 🏰 Dynamic Multi-Role Master Canvas

A unified dashboard environment (`UnifiedMasterDashboard`) that leverages multi-tab layouts to automatically reconstruct
its structural panels depending on the authenticated profile parameters:

* **Platform Administrators:** Monitor overall platform activity, manage user roles, and allocate building ownership
  profiles via the interactive `AssignOwnersSection`.
* **Asset Owners:** Provision workspace configurations, send invitations to tenants, and log deep financial statements
  with detailed cost breakdowns.
* **Residents:** Pay rent instantly, view community-wide notices, and submit maintenance tickets directly to building
  management.

### 📊 Real-Time Financial Accounting Engine

A complete financial tracking module that eliminates flat local estimations in favor of full server-side calculations:

* **Tenant Payments:** Residents authorize digital transactions that are recorded instantly inside an immutable
  Firestore log ledger.
* **Owner Analytics:** Owners can add monthly macro reports with custom cost breakdowns.
* **Data Visualization:** Incorporates side-by-side **Recharts Area and Bar graphs** to map rent inflows against
  operational outflows.

### 📋 Step-Action Kanban Pipeline

A performance-focused task management system optimized for fast data parsing and execution consistency:

* **Filing Tickets:** Residents and owners submit issue cards containing metadata
  metrics (`category`, `description`, `timestamp`).
* **Lane Shifting:** Restricts transition controls (`pending` ➔ `in-progress` ➔ `resolved`) to owners and platform
  administrators.

### 📢 High-Priority Announcement Network

A real-time broadcast system for community alerts:

* **Role Enforcement:** Blocks non-administrative traffic from submitting broadcasts.
* **Severity Categorization:** Messages are categorized into specific
  types (`emergency`, `warning`, `info`, `maintenance`), applying customized accent styles to keep users well-informed.