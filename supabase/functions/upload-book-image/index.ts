import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, fileName, adminId, adminUsername } = await req.json();

    if (!imageBase64 || !fileName || !adminId || !adminUsername) {
      return new Response(JSON.stringify({ error: 'Missing required parameters: imageBase64, fileName, adminId, adminUsername' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create a Supabase client with the service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Convert base64 to ArrayBuffer
    const base64WithoutPrefix = imageBase64.split(',')[1];
    const binaryString = atob(base64WithoutPrefix);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const filePath = `public/${fileName}`;

    const { data, error: uploadError } = await supabaseAdmin.storage
      .from('book_images')
      .upload(filePath, bytes, {
        contentType: 'image/jpeg', // Assuming JPEG, adjust if other types are expected
        upsert: false,
      });

    if (uploadError) {
      console.error('Supabase Storage Upload Error:', uploadError);
      return new Response(JSON.stringify({ error: `Failed to upload image: ${uploadError.message}` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Log the admin action
    await supabaseAdmin.from('admin_logs').insert({
      admin_id: adminId,
      admin_username: adminUsername,
      action_type: 'UPLOAD_IMAGE',
      description: `Admin uploaded image for book: ${fileName}`,
      status: 'SUCCESS',
    });

    return new Response(JSON.stringify({ path: data.path }), {
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