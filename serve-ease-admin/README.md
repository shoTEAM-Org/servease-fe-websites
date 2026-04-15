
# ServEase Admin

ServEase admin portal aligned to the shared FE multi-app template.

## Admin integration status

The following pages are now backend-driven (no mock-only data):

- User Management
  - Customers list + customer details + status updates
  - Service Providers list + provider details + status updates
  - Approval Queue list + application review + approve/reject
- Operations
  - All Bookings list (filters, stats, pagination)
  - Ongoing Services list + status updates + dispute/escalation actions

## Data source policy

- The admin frontend uses `fetchAdminJson` (`src/app/lib/adminApi.ts`) to call backend admin APIs.
- Admin pages should **not** call Supabase directly from the frontend.

## Backend runtime note

If you recently pulled API changes and pages show timeout/empty states, restart backend services so new routes/patterns are active (gateway + admin-service, with Kafka available).

## Stack

- Next.js app router
- TypeScript
- Tailwind CSS
- Jest

## Scripts

```bash
npm install
npm run dev
npm run lint
npm run build
```

## Notes

- Routing is handled through the Next app router entrypoints in `src/app`.
- A small compatibility layer in `src/lib/react-router-compat.tsx` keeps the existing admin pages working while the legacy routing assumptions are phased out.
- Build-time lint and type blocking are temporarily relaxed in `next.config.ts` because some legacy admin screens still use data shapes that do not fully match the typed store yet.
