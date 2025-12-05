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

