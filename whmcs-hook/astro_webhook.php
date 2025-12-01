<?php
/**
 * WHMCS Hook: Send Invoice Data to Astro Workflow
 * File: /includes/hooks/astro_webhook.php
 * 
 * INSTALLATION:
 * Copy this file to: /path/to/whmcs/includes/hooks/astro_webhook.php
 * Update the $webhookUrl variable with your Cloudflare Pages URL
 * 
 * This hook triggers when an invoice is marked as paid and sends
 * the invoice data to your Astro application hosted on Cloudflare Pages
 */

use WHMCS\Database\Capsule;

add_hook('InvoicePaid', 1, function($vars) {
    $invoiceId = $vars['invoiceid'];
    
    logActivity("ASTRO WEBHOOK - Hook triggered for Invoice #{$invoiceId}");
    
    try {
        // Get invoice details from database
        $invoice = Capsule::table('tblinvoices')
            ->where('id', $invoiceId)
            ->first();
        
        if (!$invoice) {
            logActivity("ASTRO WEBHOOK ERROR - Invoice #{$invoiceId} not found in database");
            return;
        }
        
        $paymentGateway = $invoice->paymentmethod;
        logActivity("ASTRO WEBHOOK DEBUG - Payment gateway: {$paymentGateway}");
        
        // Get client details from database
        $client = Capsule::table('tblclients')
            ->where('id', $invoice->userid)
            ->first();
        
        if (!$client) {
            logActivity("ASTRO WEBHOOK ERROR - Client not found for Invoice #{$invoiceId}");
            return;
        }
        
        // Get invoice line items
        $items = Capsule::table('tblinvoiceitems')
            ->where('invoiceid', $invoiceId)
            ->get();
        
        $orderItems = [];
        foreach ($items as $item) {
            $orderItems[] = [
                'product' => $item->description,
                'description' => $item->description,
                'amount' => (float)$item->amount,
                'quantity' => 1,
                'tax_id' => $item->taxed ?? ''
            ];
        }
        
        // Get payment transaction details (if available)
        $transaction = Capsule::table('tblaccounts')
            ->where('invoiceid', $invoiceId)
            ->where('amountin', '>', 0)
            ->orderBy('id', 'desc')
            ->first();
        
        // Prepare complete payload for Astro
        $payload = [
            // Client Information
            'client' => [
                'email' => $client->email,
                'name' => trim($client->firstname . ' ' . $client->lastname),
                'firstname' => $client->firstname,
                'lastname' => $client->lastname,
                'company' => $client->companyname ?? '',
                'address1' => $client->address1 ?? '',
                'address2' => $client->address2 ?? '',
                'city' => $client->city ?? '',
                'state' => $client->state ?? '',
                'postcode' => $client->postcode ?? '',
                'country' => $client->country ?? '',
                'phone' => $client->phonenumber ?? '',
            ],
            
            // Invoice Information
            'invoice' => [
                'id' => (int)$invoiceId,
                'number' => $invoice->invoicenum,
                'date' => $invoice->date,
                'due_date' => $invoice->duedate,
                'date_paid' => date('Y-m-d H:i:s'),
                'subtotal' => (float)$invoice->subtotal,
                'tax' => (float)$invoice->tax,
                'tax2' => (float)$invoice->tax2,
                'total' => (float)$invoice->total,
                'credit' => (float)$invoice->credit,
                'status' => $invoice->status,
                'payment_method' => $paymentGateway,
                'notes' => $invoice->notes ?? '',
            ],
            
            // Invoice Items
            'items' => $orderItems,
            
            // Transaction Information
            'transaction' => $transaction ? [
                'id' => $transaction->id,
                'transaction_id' => $transaction->transid ?? '',
                'amount' => (float)$transaction->amountin,
                'fees' => (float)$transaction->fees,
                'gateway' => $transaction->gateway ?? $paymentGateway,
                'date' => $transaction->date,
            ] : null,
            
            // Metadata
            'metadata' => [
                'webhook_sent_at' => date('Y-m-d H:i:s'),
                'source' => 'whmcs',
                'hook_version' => '1.0.0',
            ]
        ];
        
        // ⚠️ IMPORTANT: Update this URL to your Cloudflare Pages deployment
        // Example: https://whmcs-zoho-sync.pages.dev/api/whmcs-webhook
        $webhookUrl = 'https://your-project.pages.dev/api/whmcs-webhook';
        
        logActivity("ASTRO WEBHOOK - Sending payload for Invoice #{$invoiceId}");
        
        // Initialize cURL session
        $ch = curl_init($webhookUrl);
        
        // Set cURL options
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode($payload),
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json',
                'Accept: application/json',
                'User-Agent: WHMCS-Webhook/1.0'
            ],
            CURLOPT_TIMEOUT => 30,
            CURLOPT_CONNECTTIMEOUT => 10,
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_SSL_VERIFYHOST => 2,
            CURLOPT_FOLLOWLOCATION => true
        ]);
        
        // Execute cURL request
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        $curlErrno = curl_errno($ch);
        $totalTime = curl_getinfo($ch, CURLINFO_TOTAL_TIME);
        
        curl_close($ch);
        
        // Log detailed results
        if ($curlErrno !== 0) {
            logActivity("ASTRO WEBHOOK ERROR - cURL Error #{$curlErrno}: {$curlError} for Invoice #{$invoiceId}");
        } else {
            if ($httpCode >= 200 && $httpCode < 300) {
                logActivity("ASTRO WEBHOOK SUCCESS - Invoice #{$invoiceId} - HTTP {$httpCode} - Time: {$totalTime}s");
            } else {
                logActivity("ASTRO WEBHOOK WARNING - Invoice #{$invoiceId} - HTTP {$httpCode} - Response: " . substr($response, 0, 200));
            }
        }
        
    } catch (Exception $e) {
        logActivity("ASTRO WEBHOOK EXCEPTION - Invoice #{$invoiceId} - " . $e->getMessage());
        logActivity("ASTRO WEBHOOK EXCEPTION - Stack trace: " . $e->getTraceAsString());
    }
});
