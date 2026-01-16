import Stripe from 'stripe';

async function createCoachingProduct() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY not set');
  }

  const stripe = new Stripe(secretKey);

  console.log('Checking for existing coaching product...');
  
  const existingProducts = await stripe.products.search({ 
    query: "name:'1 Hour Coaching Call with Matt Webley'" 
  });

  if (existingProducts.data.length > 0) {
    console.log('Coaching product already exists:', existingProducts.data[0].id);
    const prices = await stripe.prices.list({ 
      product: existingProducts.data[0].id, 
      active: true 
    });
    console.log('Existing prices:', prices.data.map(p => ({
      id: p.id,
      currency: p.currency,
      amount: p.unit_amount
    })));
    return;
  }

  console.log('Creating coaching product...');
  const product = await stripe.products.create({
    name: '1 Hour Coaching Call with Matt Webley',
    description: 'Personal 1-on-1 coaching call to fast-track your SaaS journey. Normally £995 / $1200 - special bump offer price.',
    metadata: {
      type: 'coaching',
      regular_price_usd: '1200',
      regular_price_gbp: '995'
    }
  });
  console.log('Coaching product created:', product.id);

  console.log('Creating USD price ($299)...');
  const usdPrice = await stripe.prices.create({
    product: product.id,
    unit_amount: 29900,
    currency: 'usd',
  });
  console.log('USD price created:', usdPrice.id);

  console.log('Creating GBP price (£199)...');
  const gbpPrice = await stripe.prices.create({
    product: product.id,
    unit_amount: 19900,
    currency: 'gbp',
  });
  console.log('GBP price created:', gbpPrice.id);

  console.log('\n=== COACHING PRODUCT DONE ===');
  console.log('Product ID:', product.id);
  console.log('USD Price ID:', usdPrice.id, '($299 - normally $1200)');
  console.log('GBP Price ID:', gbpPrice.id, '(£199 - normally £995)');
}

createCoachingProduct().catch(console.error);
