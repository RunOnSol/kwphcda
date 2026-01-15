import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface CreateEmailRequest {
  psn: string;
  sex: string;
  email: string;
  password: string;
}

interface StaffData {
  psn: string;
  name: string;
  sex: string;
  lga: string;
  present_posting: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const requestData: CreateEmailRequest = await req.json();
    const { psn, sex, email, password } = requestData;

    if (!psn || !sex || !email || !password) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Verify staff exists with PSN and sex
    const { data: staffData, error: staffError } = await supabase
      .from('staff')
      .select('psn, name, sex, lga, present_posting')
      .eq('psn', psn)
      .eq('sex', sex)
      .maybeSingle();

    if (staffError || !staffData) {
      return new Response(
        JSON.stringify({ error: 'Staff not found with provided PSN and sex' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Check if email already exists for this PSN
    const { data: existingEmail, error: checkError } = await supabase
      .from('staff_emails')
      .select('id, email')
      .eq('psn', psn)
      .maybeSingle();

    if (existingEmail) {
      return new Response(
        JSON.stringify({ 
          error: 'An email has already been created for this PSN', 
          existing_email: existingEmail.email 
        }),
        {
          status: 409,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Check if the email address is already taken
    const { data: emailTaken, error: emailCheckError } = await supabase
      .from('staff_emails')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (emailTaken) {
      return new Response(
        JSON.stringify({ error: 'This email address is already in use' }),
        {
          status: 409,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get cPanel credentials from environment
    const cpanelHost = Deno.env.get('CPANEL_HOST');
    const cpanelUser = Deno.env.get('CPANEL_USER');
    const cpanelApiToken = Deno.env.get('CPANEL_API_TOKEN');

    let cpanelSuccess = false;
    let cpanelError = null;

    // Try to create email in cPanel if credentials are available
    if (cpanelHost && cpanelUser && cpanelApiToken) {
      try {
        const emailLocalPart = email.split('@')[0];
        const domain = email.split('@')[1];
        const quota = 250; // 250 MB quota

        const cpanelUrl = `https://${cpanelHost}:2083/execute/Email/add_pop?email=${encodeURIComponent(emailLocalPart)}&password=${encodeURIComponent(password)}&quota=${quota}&domain=${encodeURIComponent(domain)}`;

        const cpanelResponse = await fetch(cpanelUrl, {
          method: 'GET',
          headers: {
            'Authorization': `cpanel ${cpanelUser}:${cpanelApiToken}`,
          },
        });

        const cpanelData = await cpanelResponse.json();

        if (cpanelData.status === 1 || cpanelResponse.ok) {
          cpanelSuccess = true;
        } else {
          cpanelError = cpanelData.errors?.[0] || 'cPanel email creation failed';
          console.error('cPanel error:', cpanelError);
        }
      } catch (error) {
        cpanelError = error.message;
        console.error('cPanel request error:', error);
      }
    } else {
      console.warn('cPanel credentials not configured');
    }

    // Store email in database regardless of cPanel status (for tracking)
    const { data: createdEmail, error: insertError } = await supabase
      .from('staff_emails')
      .insert({
        psn: psn,
        email: email,
        staff_name: staffData.name,
        staff_sex: staffData.sex,
        staff_lga: staffData.lga,
        created_by_user_id: null,
      })
      .select()
      .single();

    if (insertError) {
      return new Response(
        JSON.stringify({ error: 'Failed to save email record', details: insertError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Log the activity (without user_id since no authentication)
    // This will be a public activity log
    console.log('Staff email created:', {
      psn: psn,
      email: email,
      staff_name: staffData.name,
      cpanel_success: cpanelSuccess,
    });

    return new Response(
      JSON.stringify({
        success: true,
        email: email,
        cpanel_created: cpanelSuccess,
        message: cpanelSuccess 
          ? 'Email created successfully! You can now use it to access your account.' 
          : 'Email record saved. Please contact IT support to activate the email in cPanel.',
        cpanel_error: cpanelError,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});