import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ADMIN_PASSWORD = 'ielts@admin2024';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, password, email, id } = await req.json();
    
    console.log(`Admin whitelist action: ${action}`);

    // Verify admin password
    if (password !== ADMIN_PASSWORD) {
      console.log('Invalid admin password attempt');
      return new Response(
        JSON.stringify({ error: 'Invalid admin password' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role key (bypasses RLS)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (action === 'list') {
      // Get all whitelist entries and profiles
      const [whitelistRes, profilesRes] = await Promise.all([
        supabase.from('email_whitelist').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*').order('created_at', { ascending: false })
      ]);

      if (whitelistRes.error) {
        console.error('Error fetching whitelist:', whitelistRes.error);
        throw whitelistRes.error;
      }
      if (profilesRes.error) {
        console.error('Error fetching profiles:', profilesRes.error);
        throw profilesRes.error;
      }

      console.log(`Found ${whitelistRes.data?.length || 0} whitelist entries, ${profilesRes.data?.length || 0} profiles`);

      return new Response(
        JSON.stringify({ whitelist: whitelistRes.data, profiles: profilesRes.data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'add') {
      if (!email) {
        return new Response(
          JSON.stringify({ error: 'Email is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const emailLower = email.toLowerCase().trim();
      console.log(`Adding email to whitelist: ${emailLower}`);

      const { data, error } = await supabase
        .from('email_whitelist')
        .insert({ email: emailLower })
        .select()
        .single();

      if (error) {
        console.error('Error adding to whitelist:', error);
        return new Response(
          JSON.stringify({ error: error.message.includes('duplicate') ? 'Email already whitelisted' : error.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`Successfully added email: ${emailLower}`);
      return new Response(
        JSON.stringify({ success: true, data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'remove') {
      if (!id) {
        return new Response(
          JSON.stringify({ error: 'ID is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`Removing whitelist entry: ${id}`);

      const { error } = await supabase
        .from('email_whitelist')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error removing from whitelist:', error);
        throw error;
      }

      console.log(`Successfully removed whitelist entry: ${id}`);
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in admin-whitelist function:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
