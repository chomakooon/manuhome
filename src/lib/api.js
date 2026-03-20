import { supabase } from './supabase';

/* ========================================
   カタチ便 — API Layer
   ======================================== */

// ── Auth Helpers ──

export async function signInWithEmail(email) {
    const { data, error } = await supabase.auth.signInWithOtp({ email });
    if (error) throw error;
    return data;
}

export async function signInWithPassword(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
}

export async function signUp(email, password, fullName) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
    });
    if (error) throw error;
    return data;
}

export async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
}

export async function getProfile(userId) {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
}

export async function updateProfile(userId, updates) {
    const { data, error } = await supabase
        .from('profiles')
        .upsert({ id: userId, ...updates })
        .select()
        .single();
    if (error) throw error;
    return data;
}

// ── Orders ──

export async function createOrder({ customerId, productId, amount, options, stripeSessionId }) {
    const { data, error } = await supabase
        .from('orders')
        .insert({
            customer_id: customerId,
            product_id: productId,
            amount,
            options,
            stripe_session_id: stripeSessionId,
            status: 'pending',
        })
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function getOrder(orderId) {
    const { data, error } = await supabase
        .from('orders')
        .select('*, projects(*)')
        .eq('id', orderId)
        .single();
    if (error) throw error;
    return data;
}

export async function updateOrderStatus(orderId, status, paymentIntent) {
    const updates = { status };
    if (paymentIntent) updates.stripe_payment_intent = paymentIntent;
    const { data, error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', orderId)
        .select()
        .single();
    if (error) throw error;
    return data;
}

// ── Projects ──

export async function createProject({ orderId, customerId, title }) {
    const { data, error } = await supabase
        .from('projects')
        .insert({
            order_id: orderId,
            customer_id: customerId,
            title,
            status: 'NEW',
        })
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function getProject(projectId) {
    const { data, error } = await supabase
        .from('projects')
        .select('*, orders(*), project_files(*), project_messages(*, profiles(full_name, role))')
        .eq('id', projectId)
        .single();
    if (error) throw error;
    return data;
}

export async function getProjectsByCustomer(customerId) {
    const { data, error } = await supabase
        .from('projects')
        .select('*, orders(amount, status)')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
}

export async function getAllProjects() {
    const { data, error } = await supabase
        .from('projects')
        .select('*, orders(amount, status), profiles(full_name, company)')
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
}

export async function updateProjectStatus(projectId, status) {
    const { data, error } = await supabase
        .from('projects')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', projectId)
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function updateProjectNotes(projectId, notes) {
    const { data, error } = await supabase
        .from('projects')
        .update({ notes, updated_at: new Date().toISOString() })
        .eq('id', projectId)
        .select()
        .single();
    if (error) throw error;
    return data;
}

// ── Files ──

export async function uploadProjectFile(projectId, file, fileType, uploadedBy) {
    const filePath = `projects/${projectId}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage
        .from('project-files')
        .upload(filePath, file);
    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
        .from('project-files')
        .getPublicUrl(filePath);

    const { data, error } = await supabase
        .from('project_files')
        .insert({
            project_id: projectId,
            file_url: publicUrl,
            file_name: file.name,
            file_type: fileType,
            uploaded_by: uploadedBy,
        })
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function getProjectFiles(projectId, fileType) {
    let query = supabase
        .from('project_files')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
    if (fileType) query = query.eq('file_type', fileType);
    const { data, error } = await query;
    if (error) throw error;
    return data;
}

// ── Messages ──

export async function sendMessage(projectId, senderId, content) {
    const { data, error } = await supabase
        .from('project_messages')
        .insert({
            project_id: projectId,
            sender_id: senderId,
            content,
        })
        .select('*, profiles(full_name, role)')
        .single();
    if (error) throw error;
    return data;
}

export async function getMessages(projectId) {
    const { data, error } = await supabase
        .from('project_messages')
        .select('*, profiles(full_name, role)')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });
    if (error) throw error;
    return data;
}

// ── Mailing List ──

export async function addToMailingList({ email, name, tags, source }) {
    const { data, error } = await supabase
        .from('mailing_list')
        .upsert(
            { email, name, tags, source },
            { onConflict: 'email' }
        )
        .select()
        .single();
    if (error) throw error;
    return data;
}

// ── Dashboard Stats ──

export async function getDashboardStats() {
    const [projectsRes, ordersRes] = await Promise.all([
        supabase.from('projects').select('status'),
        supabase.from('orders').select('amount, status').eq('status', 'paid'),
    ]);

    const projects = projectsRes.data || [];
    const orders = ordersRes.data || [];

    const statusCounts = {};
    projects.forEach(p => {
        statusCounts[p.status] = (statusCounts[p.status] || 0) + 1;
    });

    const totalRevenue = orders.reduce((sum, o) => sum + (o.amount || 0), 0);

    return {
        totalProjects: projects.length,
        statusCounts,
        totalRevenue,
        totalOrders: orders.length,
    };
}
