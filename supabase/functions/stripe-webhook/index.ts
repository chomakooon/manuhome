// Supabase Edge Function: Stripe Webhook Handler
// Deploy with: supabase functions deploy stripe-webhook
//
// This function handles Stripe webhook events to:
// 1. Create project records after successful payment
// 2. Send notifications
// 3. Add customers to mailing list

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@12?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2023-10-16' });
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;

serve(async (req) => {
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
        return new Response('No signature', { status: 400 });
    }

    try {
        const body = await req.text();
        const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

        // Initialize Supabase with service role key for admin operations
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
        );

        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                const orderId = session.metadata?.orderId;
                const productId = session.metadata?.productId;
                const tenantId = session.metadata?.tenantId || '00000000-0000-0000-0000-000000000000';
                const assetUrlsStr = session.metadata?.assetUrls || '[]';
                const customerEmail = session.customer_details?.email || session.customer_email || session.metadata?.customerEmail;

                // Template System Metadata
                const templateId = session.metadata?.template_id;
                const tierId = session.metadata?.tier_id;
                const selectedOptionsStr = session.metadata?.selected_options || '[]';
                const formDataStr = session.metadata?.form_data || '{}';

                if (!orderId || !productId) {
                    console.error('Missing orderId or productId in session metadata');
                    break;
                }

                // 1. Upsert Order
                let assetUrls: string[] = [];
                let selectedOptions: string[] = [];
                let formData: any = {};
                try { assetUrls = JSON.parse(assetUrlsStr); } catch (e) { /* ignore */ }
                try { selectedOptions = JSON.parse(selectedOptionsStr); } catch (e) { /* ignore */ }
                try { formData = JSON.parse(formDataStr); } catch (e) { /* ignore */ }

                const { data: order, error: orderError } = await supabaseAdmin
                    .from('orders')
                    .upsert({
                        id: orderId,
                        tenant_id: tenantId,
                        product_id: productId,
                        amount: session.amount_total || 0,
                        status: 'paid',
                        stripe_payment_intent: session.payment_intent as string,
                        customer_email: customerEmail,
                        asset_urls: assetUrls,
                        tier_id: tierId,
                        selected_options: selectedOptions,
                        form_data: formData,
                        options: { source: 'stripe_checkout', template_id: templateId }
                    })
                    .select('*, products(*)')
                    .single();

                if (orderError || !order) {
                    console.error('Error upserting order:', orderError);
                    break;
                }

                // 2. Create project
                // Use template formatting if form_data contains pet_name
                let projectTitle = order.products?.name ? `${order.products.name} — 新規注文` : `注文 #${orderId.slice(0, 8)}`;
                if (formData.pet_name) {
                    projectTitle = `${formData.pet_name} — ペットイラスト`;
                }

                // Gather tags based on template
                const projectTags = [templateId, tierId].filter(Boolean);
                if (formData.usage_type === 'commercial') projectTags.push('commercial_use');
                if (formData.pet_type) projectTags.push(formData.pet_type);

                const { data: project, error: projectError } = await supabaseAdmin
                    .from('projects')
                    .insert({
                        tenant_id: tenantId,
                        order_id: orderId,
                        customer_id: order.customer_id, // Might be null for guests
                        title: projectTitle,
                        status: 'NEW',
                        tags: projectTags
                    })
                    .select()
                    .single();

                if (projectError || !project) {
                    console.error('Error creating project:', projectError);
                    break;
                }

                console.log('Project created:', project.id);

                // 3. Create Project Files from assetUrls
                if (assetUrls.length > 0) {
                    const projectFiles = assetUrls.map((url: string, index: number) => ({
                        tenant_id: tenantId,
                        project_id: project.id,
                        file_url: url,
                        file_name: `upload_${index + 1}.jpg`,
                        file_type: 'asset'
                    }));

                    await supabaseAdmin.from('project_files').insert(projectFiles);
                }

                // 4. Add to mailing list
                if (customerEmail) {
                    await supabaseAdmin
                        .from('mailing_list')
                        .upsert(
                            {
                                tenant_id: tenantId,
                                email: customerEmail,
                                name: formData.name || session.customer_details?.name || '',
                                tags: Array.from(new Set([order.products?.category || 'pet', ...projectTags])), // Merge product category with dynamic tags
                                source: 'order_completion',
                            },
                            { onConflict: 'tenant_id, email' }
                        );
                    console.log('Added to mailing list:', customerEmail);
                }

                break;
            }

            case 'payment_intent.payment_failed': {
                const intent = event.data.object as Stripe.PaymentIntent;
                const orderId = intent.metadata?.order_id;
                if (orderId) {
                    await supabaseAdmin
                        .from('orders')
                        .update({ status: 'failed' })
                        .eq('id', orderId);
                    console.log('Order marked as failed:', orderId);
                }
                break;
            }

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        return new Response(JSON.stringify({ received: true }), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (err) {
        console.error('Webhook error:', err);
        return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }
});
