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

## Storage Policy

`reference-images` bucketはprivateとし、所有者を先頭にした固定pathを使う。

```text
{user_id}/circles/{circle_id}/reference
{user_id}/items/{item_id}/reference
```

insert / updateでは先頭pathを`auth.uid()`へ固定し、`owns_reference_image_parent`でpath中のCircleまたはItemが同じユーザーの所有データであることを確認する。select / deleteではStorageが付与した`owner_id`と先頭pathの両方を確認する。これにより他ユーザーの参照と削除を拒否しつつ、親データが先に消えた孤児画像も所有者本人がcleanupできる。アプリ側も`auth.getUser()`と親ownershipを確認し、Service Role Keyは通常操作に使用しない。
