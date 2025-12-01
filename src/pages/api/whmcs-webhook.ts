import type { APIRoute } from 'astro';

// Simple in-memory storage (resets on deployment)
// For production, use Cloudflare KV or D1
let lastWebhook: any = null;

export const POST: APIRoute = async ({ request }) => {
  const startTime = Date.now();
  
  try {
    const data = await request.json();
    
    // Store this webhook
    lastWebhook = {
      ...data,
      received_at: new Date().toISOString(),
      processing_time_ms: Date.now() - startTime
    };
    
    console.log('=== WHMCS WEBHOOK RECEIVED ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Invoice ID:', data.invoice?.id);
    console.log('Client:', data.client?.name);
    console.log('Total Amount:', data.invoice?.total);
    console.log('Payment Method:', data.invoice?.payment_method);
    console.log('==============================');
    
    if (!data.invoice || !data.client) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required data'
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const processingTime = Date.now() - startTime;
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Webhook received and logged successfully',
        invoice_id: data.invoice.id,
        invoice_number: data.invoice.number,
        processing_time_ms: processingTime,
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

export const GET: APIRoute = async () => {
  return new Response(
    JSON.stringify({
      status: 'active',
      endpoint: '/api/whmcs-webhook',
      method: 'POST',
      description: 'WHMCS Invoice Paid Webhook Receiver',
      last_webhook: lastWebhook,
      timestamp: new Date().toISOString()
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};