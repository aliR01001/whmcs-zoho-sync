import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const startTime = Date.now();
    const db = locals.runtime.env.whmcs;
    // Parse incoming webhook data from WHMCS
    const data = await request.json();
    
    // Store this webhook
    //lastWebhook = {
    //  ...data,
    //  received_at: new Date().toISOString(),
    //  processing_time_ms: Date.now() - startTime
    //};
    
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
    
    await db.prepare(
      'INSERT INTO invoices (invoice_id, client_name, total_amount, payment_method, raw_data) VALUES (?, ?, ?, ?, ?)'
    ).bind(data.invoice.id, data.client.name, data.invoice.total, data.invoice.payment_method, JSON.stringify(data)).run();
    
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

export const GET: APIRoute = async ({ locals }) => {
  try {
    const db = locals.runtime.env.whmcs;
    const { results } = await db.prepare('SELECT * FROM invoices ORDER BY created_at DESC').run();
    
    return new Response(
      JSON.stringify({
        success: true,
        invoices: results
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};
