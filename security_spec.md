# Security Specification & Threat Model

## Data Invariants

1. **User Identity Boundary**: A user document at `/users/{userId}` can only be read or written by the authenticated user whose `request.auth.uid == userId` or a platform administrator.
2. **Sub-collection Isolation**: User notes at `/users/{userId}/notes/{noteId}` must strictly match the parent document ID `userId == request.auth.uid`. A user cannot read, create, update, or delete another user's notes.
3. **Role & Privilege Guard**: Normal users cannot escalate privileges or set `role: "admin"` in their own profile or in `/admins/{userId}`.
4. **Inquiry Write-Only Public Gate**: Any user (authenticated or anonymous student) can submit an inquiry document to `/inquiries/{inquiryId}`, but cannot read other students' inquiries. Only administrators can read or list `/inquiries`.
5. **Admin Master Gate**: The `/admins/{userId}` collection can only be read and managed by verified platform admins or the bootstrap owner (`asmanlinzy44@gmail.com`).

## The Dirty Dozen Payloads

1. **Payload 1 (ID Hijack)**: User `userA` attempts to write a user profile to `/users/userB` with `{ id: "userB", name: "Attacker" }`.
   - Expected Result: `PERMISSION_DENIED`.
2. **Payload 2 (Role Escalation)**: User `userA` attempts to create `/users/userA` with `{ role: "admin" }` without admin authorization.
   - Expected Result: `PERMISSION_DENIED`.
3. **Payload 3 (Orphaned Note Write)**: User `userA` attempts to write note to `/users/userB/notes/note1`.
   - Expected Result: `PERMISSION_DENIED`.
4. **Payload 4 (Note UID Spoofing)**: User `userA` writes to `/users/userA/notes/note1` with `userId: "userB"`.
   - Expected Result: `PERMISSION_DENIED`.
5. **Payload 5 (Inquiry Snoop Attack)**: User `userA` attempts to list or get `/inquiries/inquiry999`.
   - Expected Result: `PERMISSION_DENIED`.
6. **Payload 6 (Admin Collection Poisoning)**: User `userA` attempts to write `/admins/userA` with `{ role: "superadmin" }`.
   - Expected Result: `PERMISSION_DENIED`.
7. **Payload 7 (Oversized Note Payload / Denial of Wallet)**: User `userA` sends note text with string length > 2000 chars.
   - Expected Result: `PERMISSION_DENIED`.
8. **Payload 8 (Invalid ID Injection)**: User attempts to write to `/users/{invalid$id#}/notes/1`.
   - Expected Result: `PERMISSION_DENIED`.
9. **Payload 9 (Unauthenticated Profile Read)**: Unauthenticated visitor attempts to `get` `/users/userA`.
   - Expected Result: `PERMISSION_DENIED`.
10. **Payload 10 (Immutability Bypass)**: User attempts to update `id` or `createdAt` to different values.
    - Expected Result: `PERMISSION_DENIED`.
11. **Payload 11 (Shadow Field Injection)**: User profile update includes arbitrary unallowed field `{ malicious_token: "xyz" }`.
    - Expected Result: `PERMISSION_DENIED`.
12. **Payload 12 (Cross-User Delete)**: User `userA` attempts to delete `/users/userB/notes/note2`.
    - Expected Result: `PERMISSION_DENIED`.
