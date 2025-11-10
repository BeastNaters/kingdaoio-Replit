import { getSupabaseClient } from './supabase';

export async function initializeSupabaseTables(): Promise<void> {
  const client = getSupabaseClient();
  
  if (!client) {
    console.warn('Supabase not configured, skipping table initialization');
    return;
  }

  try {
    const { error } = await client.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS treasury_snapshots (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
          total_usd_value REAL NOT NULL,
          tokens JSONB NOT NULL,
          nfts JSONB NOT NULL,
          wallets JSONB NOT NULL,
          metadata JSONB
        );

        CREATE INDEX IF NOT EXISTS timestamp_idx ON treasury_snapshots(timestamp DESC);
      `
    });

    if (error) {
      console.error('Error creating Supabase tables:', error);
      console.log('You may need to manually create the treasury_snapshots table in Supabase');
    } else {
      console.log('✓ Supabase tables initialized');
    }
  } catch (error: any) {
    if (error.message?.includes('exec_sql')) {
      console.log('Note: Supabase table creation requires manual setup or SQL editor');
      console.log('Please create treasury_snapshots table in Supabase dashboard:');
      console.log(`
        CREATE TABLE IF NOT EXISTS treasury_snapshots (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
          total_usd_value REAL NOT NULL,
          tokens JSONB NOT NULL,
          nfts JSONB NOT NULL,
          wallets JSONB NOT NULL,
          metadata JSONB
        );
        CREATE INDEX IF NOT EXISTS timestamp_idx ON treasury_snapshots(timestamp DESC);
      `);
    }
  }
}
