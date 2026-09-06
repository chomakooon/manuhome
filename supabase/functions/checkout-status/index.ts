import { createClient } from 'npm:@supabase/supabase-js@2.115.0';
import Stripe from 'npm:stripe@22.6.1';
import { commerceRepository } from '../_shared/commerce.ts';
import { enforceRateLimit } from '../_shared/http.ts';
import { checkoutStatusHandler } from './handler.ts';

const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { httpClient: Stripe.createFetchHttpClient() });
Deno.serve(checkoutStatusHandler({
    repository: commerceRepository(db),
    rateLimit: (req) => enforceRateLimit(req, db, 'checkout-status', { limit: 120, windowSeconds: 3600, globalLimit: 5000 }),
    retrieveSession: (id) => stripe.checkout.sessions.retrieve(id),
}));
