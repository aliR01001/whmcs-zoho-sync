import type { APIRoute } from 'astro';

// Optional: Handle GET requests for testing
export const GET: APIRoute = async () => {
  return new Response(
    JSON.stringify({
      status: 'active',
      endpoint: '/api/test-webhook',
      method: 'POST',
      description: 'Test Webhook',
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

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const data = await request.json();

    if (!data.invoice || !data.client) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required data'
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const webhookUrl = new URL('/api/whmcs-webhook', request.url);
    const webhookResponse = await fetch(webhookUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    const webhookResult = await webhookResponse.json();
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Test webhook forwarded successfully',
        invoice_id: data.invoice.id,
        invoice_number: data.invoice.number,
        webhook_response: webhookResult,
        timestamp: new Date().toISOString()
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('=== WEBHOOK ERROR ===', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
