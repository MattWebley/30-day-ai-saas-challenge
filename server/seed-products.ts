import Stripe from 'stripe';

async function createProducts() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY not set');
  }

  const stripe = new Stripe(secretKey);

  console.log('Checking for existing products...');
  
  const existingProducts = await stripe.products.search({ 
    query: "name:'21 Day AI SaaS Challenge'" 
  });

  if (existingProducts.data.length > 0) {
    console.log('Product already exists:', existingProducts.data[0].id);
    
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

  console.log('Creating product...');
  const product = await stripe.products.create({
    name: '21 Day AI SaaS Challenge',
    description: 'Build your first AI SaaS product in 21 days with daily micro-tasks, AI-powered tools, and step-by-step guidance.',
    metadata: {
      type: 'course',
      challenge_days: '21'
    }
  });
  console.log('Product created:', product.id);

  console.log('Creating USD price ($399)...');
  const usdPrice = await stripe.prices.create({
    product: product.id,
    unit_amount: 39900,
    currency: 'usd',
  });
  console.log('USD price created:', usdPrice.id);

  console.log('Creating GBP price (£295)...');
  const gbpPrice = await stripe.prices.create({
    product: product.id,
    unit_amount: 29500,
    currency: 'gbp',
  });
  console.log('GBP price created:', gbpPrice.id);

  console.log('\n=== DONE ===');
  console.log('Product ID:', product.id);
  console.log('USD Price ID:', usdPrice.id, '($399)');
  console.log('GBP Price ID:', gbpPrice.id, '(£295)');
}

createProducts().catch(console.error);
