-- 訂單後台 schema（在 Supabase SQL Editor 整段執行一次）
-- 之後在 Authentication → Users 手動建立店主帳號（email + 密碼），即可登入 admin.html

create table if not exists public.orders (
  no            text primary key,            -- 訂單編號 CH-YYYYMMDD-XXXX
  created       timestamptz default now(),
  items         jsonb not null,              -- [{id,name,price,qty}]
  subtotal      int  not null,
  fee           int  not null default 0,
  total         int  not null,
  pay           text not null,               -- 貨到付款 / 信用卡
  ship          text not null,               -- 宅配 / 7-11 店到店 / 全家 店到店 / 面交
  store         text default '',
  addr          text default '',
  name          text not null,
  email         text not null,
  phone         text default '',
  note          text default '',
  status        text not null default '待處理',
  tracking      text default '',             -- 物流單號
  return_reason text default ''
);

alter table public.orders enable row level security;

-- 任何人可下單（insert），但讀/改只有登入的店主可以
create policy "anyone can place order" on public.orders
  for insert with check (true);
create policy "authenticated can read" on public.orders
  for select using (auth.role() = 'authenticated');
create policy "authenticated can update" on public.orders
  for update using (auth.role() = 'authenticated');

-- 買家查單：訂單編號 + Email 兩者都對才回傳（security definer 繞過 RLS，限縮欄位）
create or replace function public.lookup_order(p_no text, p_email text)
returns table (no text, created timestamptz, items jsonb, total int, pay text,
               ship text, store text, addr text, status text, tracking text)
language sql security definer set search_path = public as $$
  select no, created, items, total, pay, ship, store, addr, status, tracking
  from orders
  where orders.no = p_no and lower(orders.email) = lower(p_email);
$$;

-- 買家申請退貨：限已出貨/已完成
create or replace function public.request_return(p_no text, p_email text, p_reason text)
returns boolean
language plpgsql security definer set search_path = public as $$
begin
  update orders set status = '退貨申請', return_reason = p_reason
  where no = p_no and lower(email) = lower(p_email)
    and status in ('已出貨', '已完成');
  return found;
end;
$$;
