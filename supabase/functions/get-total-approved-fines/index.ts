/// <reference lib="deno.ns" />
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the service role key
    // This client bypasses Row Level Security (RLS)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch all approved fine payments
    const { data: finePayments, error: fetchError } = await supabaseAdmin
      .from('pembayaran_denda')
      .select('jumlah_bayar')
      .eq('status_pembayaran', 'approved');

    if (fetchError) {
      console.error('Supabase Fetch Error:', fetchError);
      return new Response(JSON.stringify({ error: `Failed to fetch approved fine payments: ${fetchError.message}` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const totalAmount = finePayments.reduce((sum, payment) => sum + payment.jumlah_bayar, 0);

    return new Response(JSON.stringify({ totalFineIncome: totalAmount }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Edge Function Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});