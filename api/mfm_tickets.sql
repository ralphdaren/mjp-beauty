-- Made For More ticket records, written by api/webhooks/shopify.ts on orders/paid.
--
-- Supabase schema in this project is applied by hand rather than tracked
-- migrations, so this file is a reference copy of what was run — keep it in
-- step if the table changes.
--
-- Run once in the Supabase SQL editor before the first ticket is sold.

create table if not exists mfm_tickets (
  id                uuid primary key default gen_random_uuid(),

  -- Unique is load-bearing: Shopify retries a webhook until it gets a 2xx and
  -- can deliver the same event twice. This constraint is what stops a retry
  -- from sending a buyer a second ticket email.
  shopify_order_id  text not null unique,
  order_number      text,

  email             text not null,
  customer_name     text,
  instagram         text,

  -- [{ tier: "VIP", quantity: 1 }, ...] — an order can hold more than one tier.
  items             jsonb not null default '[]'::jsonb,

  total_cents       integer,
  currency          text not null default 'CAD',

  ordered_at        timestamptz,
  email_sent_at     timestamptz,
  checked_in_at     timestamptz,
  created_at        timestamptz not null default now()
);

create index if not exists mfm_tickets_email_idx on mfm_tickets (email);
create index if not exists mfm_tickets_ordered_at_idx on mfm_tickets (ordered_at desc);

-- Only the service role touches this table; the browser never reads it.
alter table mfm_tickets enable row level security;
