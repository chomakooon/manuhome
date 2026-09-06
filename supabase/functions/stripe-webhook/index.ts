import { createClient } from 'npm:@supabase/supabase-js@2.115.0';
import Stripe from 'npm:stripe@22.6.1';
import { commerceRepository } from '../_shared/commerce.ts';
import { stripeWebhookHandler } from './handler.ts';

const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { httpClient: Stripe.createFetchHttpClient() });
const cryptoProvider = Stripe.createSubtleCryptoProvider();
Deno.serve(stripeWebhookHandler({
    repository: commerceRepository(db),
    verifyEvent: (body, signature) => stripe.webhooks.constructEventAsync(body, signature, Deno.env.get('STRIPE_WEBHOOK_SECRET')!, undefined, cryptoProvider),
}));
