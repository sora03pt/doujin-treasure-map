-- Phase 3 treats space number and price as optional while preserving zero as a
-- meaningful price. Existing rows remain valid.

alter table circles
  alter column space_number drop not null;

alter table circles
  drop constraint circles_space_number_not_blank;

alter table circles
  add constraint circles_space_number_not_blank check (
    space_number is null or length(btrim(space_number)) > 0
  );

alter table items
  alter column price drop not null,
  alter column price drop default;
