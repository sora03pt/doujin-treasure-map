# RLS Policy

## Principle

Every user-created row must be readable and mutable only by its owner. Child records should verify both their own `user_id` and the parent record owner.

## Event Policies

Events have explicit policies for select, insert, update, and delete. Each policy allows access only when `auth.uid() = user_id`.

## Circle Policies

Circles have explicit policies for select, insert, update, and delete. Each policy allows access only when:

- `auth.uid() = user_id`
- the parent event exists
- the parent event is owned by `auth.uid()`

## Item Policies

Items have explicit policies for select, insert, update, and delete. Each policy allows access only when:

- `auth.uid() = user_id`
- the parent circle exists
- the parent circle is owned by `auth.uid()`

## Storage Policy For Later

When image upload starts, store files under owner-scoped paths such as:

```text
event-assets/{user_id}/{event_id}/{file_id}
circle-assets/{user_id}/{circle_id}/{file_id}
```

Storage RLS should allow access only when the first path segment matches `auth.uid()` or when an explicit sharing table allows it.
