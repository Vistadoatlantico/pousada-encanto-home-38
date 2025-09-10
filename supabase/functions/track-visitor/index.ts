import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get client IP address
    const clientIP = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    
    const userAgent = req.headers.get('user-agent') || '';
    const { pagePath = '/' } = await req.json().catch(() => ({}));

    console.log('Tracking visitor:', { clientIP, pagePath, userAgent });

    // Check if this IP already visited today
    const today = new Date().toISOString().split('T')[0]; // Get YYYY-MM-DD format
    
    const { data: existingVisit } = await supabase
      .from('visitor_analytics')
      .select('id')
      .eq('ip_address', clientIP)
      .gte('created_at', `${today}T00:00:00.000Z`)
      .lt('created_at', `${today}T23:59:59.999Z`)
      .limit(1);

    if (existingVisit && existingVisit.length > 0) {
      console.log('IP already tracked today:', clientIP);
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Already tracked today',
        alreadyTracked: true
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get geolocation data from IP using a free service
    let geoData = {
      state: null,
      city: null,
      country: 'BR'
    };

    try {
      // Using ipapi.co for geolocation (free tier: 1000 requests/day)
      const geoResponse = await fetch(`https://ipapi.co/${clientIP}/json/`);
      if (geoResponse.ok) {
        const geo = await geoResponse.json();
        console.log('Geo response:', geo);
        
        geoData = {
          state: geo.region || null,
          city: geo.city || null,
          country: geo.country_code || 'BR'
        };
      }
    } catch (geoError) {
      console.error('Geolocation API error:', geoError);
      // Continue without geo data
    }

    // Save visitor data to database
    const { data, error } = await supabase
      .from('visitor_analytics')
      .insert({
        ip_address: clientIP,
        state: geoData.state,
        city: geoData.city,
        country: geoData.country,
        page_path: pagePath,
        user_agent: userAgent
      });

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    console.log('Visitor tracked successfully:', data);

    return new Response(JSON.stringify({ 
      success: true, 
      state: geoData.state,
      city: geoData.city,
      country: geoData.country 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in track-visitor function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});