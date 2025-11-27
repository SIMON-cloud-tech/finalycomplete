
## 📝 CHANGELOG.md
# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2025-11-21
### Added
- Initial release of Real Estate Management Platform.
- Business dashboard routes: listings, landlords, payments, bookings, valuation, revenue, analytics, settings, feed.
- Landlord dashboard routes: register, login, payments, valuation, analytics, listings, settings, feed.
- Client dashboard routes: login, dashboard, listings, bookings.
- Payment integration with Safaricom Daraja API (sandbox).
- Testimonials module with JSON storage.
- Responsive product grid with double‑click expand/collapse.
- Auto‑sliding horizontal card carousel with pause on hover/touch.

### Changed
- Organized `server.js` for auditability (grouped imports, middleware, routes).
- Improved README with full lifecycle diagrams (business, landlord, client, payment).

### Fixed
- Debugged booking validation and payment response handling.
- Corrected landlord login route mounting.


## [Unreleased]
### Planned
- Database migration from JSON to MongoDB/Postgres.
- Production M‑Pesa credentials integration.   
- Unit and integration tests for routes and payment flows.
- Deployment scripts for cloud hosting (Heroku/Render/Azure).