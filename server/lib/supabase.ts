import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabaseClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn('Supabase not configured');
    return null;
  }

  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
  }

  return supabaseClient;
}

export async function getLatestSnapshot() {
  const client = getSupabaseClient();
  
  if (!client) {
    return null;
  }

  try {
    const { data, error } = await client
      .from('treasury_snapshots')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Error fetching snapshot:', error);
      return null;
    }

    if (data) {
      return {
        id: data.id,
        timestamp: data.timestamp,
        totalUsdValue: data.total_usd_value,
        tokens: data.tokens,
        nfts: data.nfts,
        wallets: data.wallets,
        metadata: data.metadata,
      };
    }

    return null;
  } catch (error) {
    console.error('Error fetching snapshot:', error);
    return null;
  }
}

export async function upsertSnapshot(snapshot: any) {
  const client = getSupabaseClient();
  
  if (!client) {
    return null;
  }

  try {
    const supabaseSnapshot = {
      timestamp: snapshot.timestamp,
      total_usd_value: snapshot.totalUsdValue,
      tokens: snapshot.tokens,
      nfts: snapshot.nfts,
      wallets: snapshot.wallets,
      metadata: snapshot.metadata || null,
    };

    const { data, error } = await client
      .from('treasury_snapshots')
      .upsert(supabaseSnapshot)
      .select()
      .single();

    if (error) {
      console.error('Error upserting snapshot:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error upserting snapshot:', error);
    return null;
  }
}
