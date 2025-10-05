create or replace function decrement_uses(p_code_id uuid)
returns void language plpgsql as $$
begin
  update vip_codes set uses_remaining = greatest(uses_remaining - 1, 0) where id = p_code_id;
end $$;
