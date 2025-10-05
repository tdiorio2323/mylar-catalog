import { supabaseServer } from '@/lib/supabaseServer';

export default async function Page() {
  const supabase = await supabaseServer();
  const { data: { session } } = await supabase.auth.getSession();
  return <pre style={{ padding: 24 }}>{JSON.stringify(session, null, 2)}</pre>;
}
