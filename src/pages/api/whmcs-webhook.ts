import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  const startTime = Date.now();
  
  try {
    // Parse incoming webhook data from WHMCS
    const data = await request.json();
    
    // Log received data (visible in Cloudflare Pages logs)
    console.log('=== WHMCS WEBHOOK RECEIVED ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Invoice ID:', data.invoice?.id);
    console.log('Client:', data.client?.name);
    console.log('Total Amount:', data.invoice?.total);
    console.log('Payment Method:', data.invoice?.payment_method);
    console.log('Full Data:', JSON.stringify(data, null, 2));
    console.log('==============================');
    
    // Validate required fields
    if (!data.invoice || !data.client) {
      console.error('ERROR: Missing required invoice or client data');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required data: invoice or client information'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Store data temporarily (for now, just in memory/logs)
    // Later we'll add Cloudflare KV or D1 database storage
    
    const processingTime = Date.now() - startTime;
    
    // Return success response to WHMCS
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Webhook received and logged successfully',
        invoice_id: data.invoice.id,
        invoice_number: data.invoice.number,
        processing_time_ms: processingTime,
        timestamp: new Date().toISOString()
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
  } catch (error) {
    console.error('=== WEBHOOK ERROR ===');
    console.error('Error:', error);
    console.error('Stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('====================');
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
};

// Optional: Handle GET requests for testing
export const GET: APIRoute = async () => {
  return new Response(
    JSON.stringify({
      status: 'active',
      endpoint: '/api/whmcs-webhook',
      method: 'POST',
      description: 'WHMCS Invoice Paid Webhook Receiver',
      timestamp: new Date().toISOString()
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
};
