# Screens

MVP should keep the navigation small and center the experience on the event detail screen.

## Proposed Screens

### Login

Supabase Auth entry point. Email/password can be Phase 1 default. OAuth can be considered later only if it has a clear benefit.

### Event List

Shows the user's events ordered by date. Empty state should lead to event creation. Future Free plan limit checks can be attached here without changing the domain model.

### Event Create / Edit

Form for event name, date, venue, venue-defined halls, memo, and planned budget.

### Event Detail / Event-Day Screen

Primary MVP screen.

- Budget summary
- Filter controls
- Priority/status summary
- Recommended route grouped by event hall order, then priority and space number
- Circle checklist ordered by priority and space number
- Fast visit status updates
- Links to X/Web when present

### Circle Add / Edit

Form for circle details and item list entry points. On mobile, this may appear as a dedicated route rather than a modal for better reliability.

### Circle Detail

Shows circle metadata, wanted items, memo, links, and status controls.

### Budget Summary

Can start as a section inside Event Detail. It should become a separate screen only if the item list grows enough to justify it.

## MVP Route Sketch

- `/login`
- `/events`
- `/events/new`
- `/events/[eventId]`
- `/events/[eventId]/edit`
- `/events/[eventId]/circles/new`
- `/events/[eventId]/circles/[circleId]`
- `/events/[eventId]/circles/[circleId]/edit`

Avoid adding separate map, budget, or settings routes until the core event-day flow proves it needs them.
