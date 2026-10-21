# Implementation Plan - Secure Gmail Video Lesson Access & Admin Controls

## User Review Required

> [!IMPORTANT]
> - **Gmail-Only Access**: Video lessons open exclusively for verified, enrolled Gmail accounts present in the cloud database (`paidAccessList`) with active validity.
> - **Expiration & Revocation**: Expired or revoked accounts instantly see locked screens and active video players close immediately.
> - **Granular Folder Permissions**: Admin panel provides full folder selection for custom student access.

## Proposed Changes

### 1. Access Control & Security Watchdog (`src/App.tsx`)
- Enforce strict Gmail-only authentication matching and database lookup.
- Ensure expired or revoked student sessions immediately close playing videos and trigger lock states.

### 2. Admin Panel & Folder Permissions (`src/components/AdminPanelModal.tsx`)
- Maintain folder tree checklist selector for custom student permissions.
- Ensure correct revocation handling and UI feedback.

### 3. Verification
- Compile applet (`compile_applet`) and verify build.
