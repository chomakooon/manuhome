import { createClient } from 'npm:@supabase/supabase-js@2.115.0';
import Stripe from 'npm:stripe@22.6.1';
import { commerceRepository } from '../_shared/commerce.ts';
import { enforceRateLimit } from '../_shared/http.ts';
import { cleanupUploads, saveUploads } from '../_shared/uploads.ts';
import { createCheckoutHandler } from './handler.ts';

const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { httpClient: Stripe.createFetchHttpClient() });
Deno.serve(createCheckoutHandler({
    repository: commerceRepository(db),
    rateLimit: (req) => enforceRateLimit(req, db, 'create-checkout', { limit: 10, windowSeconds: 3600, globalLimit: 200 }),
    upload: (folder, files) => saveUploads(db, folder, files),
    cleanup: (files) => cleanupUploads(db, files),
    createSession: (params, idempotencyKey) => stripe.checkout.sessions.create(params, { idempotencyKey }),
    retrieveSession: (id) => stripe.checkout.sessions.retrieve(id),
}));
