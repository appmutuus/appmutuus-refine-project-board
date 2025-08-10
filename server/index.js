import { createServer } from 'http';

const PORT = process.env.PORT || 4242;

const server = createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }

  if (req.url === '/create-checkout-session' && req.method === 'POST') {
    let data = '';
    req.on('data', chunk => {
      data += chunk;
    });
    req.on('end', async () => {
      try {
        const { amount } = JSON.parse(data);
        const params = new URLSearchParams({
          mode: 'payment',
          success_url: 'http://localhost:5173/success',
          cancel_url: 'http://localhost:5173/cancel',
          'line_items[0][price_data][currency]': 'eur',
          'line_items[0][price_data][product_data][name]': 'Wallet Top-up',
          'line_items[0][price_data][unit_amount]': String(amount),
          'line_items[0][quantity]': '1'
        });

        const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: params.toString()
        });
        const session = await stripeRes.json();

        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({ url: session.url }));
      } catch (err) {
        res.writeHead(500, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({ error: 'Unable to create session' }));
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`Stripe server running on port ${PORT}`);
});
