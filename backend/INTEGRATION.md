# AMMERHA mobile integration

The mobile app uses `/api/v1` through one environment-driven API client. Set
`EXPO_PUBLIC_DEMO_MODE=false` to use the API and
`EXPO_PUBLIC_API_FALLBACK_TO_DEMO=true` to keep deterministic presentation data
available when the server or phone network cannot be reached.

## Seeded accounts

All accounts use `Demo1234!`.

| Role | ID | Email |
| --- | --- | --- |
| Customer | `demo-customer` | `customer@ammerha.demo` |
| Technician | `demo-technician` | `technician@ammerha.demo` |
| Pending technician | `demo-technician-2` | `technician2@ammerha.demo` |
| Admin | `demo-admin` | `admin@ammerha.demo` |

The open integration request is `demo-request-old-city-plumbing`; the completed
historical job is `demo-job-past`.

## API inventory and compatibility

The implemented route groups are auth, users, technicians, service categories,
repair requests with nested offers, top-level offer actions, jobs with nested
conversation and review resources, notifications, rewards, subscriptions,
reports, and admin verification/report/risk/account actions.

Mobile repositories adapt backend DTOs for technicians, repair requests, offers,
jobs, chat, reviews, rewards, and notifications. Admin and subscription clients
cover the currently implemented server operations. Backend gaps kept in demo UI
are technician geospatial coordinates and distance, bilingual arbitrary partner
reward metadata, a conversation inbox endpoint, full admin user/audit listings,
and detailed finance operations beyond the summary and technician earnings.
