import { supabase } from './supabase';

/* ========================================
   カタチらぼ — API Layer
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
        .update({ full_name: updates.full_name, company: updates.company, avatar_url: updates.avatar_url })
        .eq('id', userId)
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
        .select('*, projects(*), order_internal_notes(notes)')
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
        .select('*, orders(*), project_internal_notes(notes), project_files(*), project_messages(*, profiles(full_name, role))')
        .eq('id', projectId)
        .single();
    if (error) throw error;
    return { ...data, notes: data.project_internal_notes?.notes || '', project_files: await Promise.all((data.project_files || []).map(withPrivateFileUrl)) };
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
        .select('*, orders(amount, status), profiles(full_name, company), project_internal_notes(notes)')
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data.map(project => ({ ...project, notes: project.project_internal_notes?.notes || '' }));
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
    const { data, error } = await supabase.from('project_internal_notes')
        .upsert({ project_id: projectId, notes, updated_at: new Date().toISOString() })
        .select().single();
    if (error) throw error;
    return data;
}

// ── Files ──

async function withPrivateFileUrl(file) {
    let path = file.file_url;
    if (path.startsWith('http')) {
        const url = new URL(path);
        const ownOrigin = new URL(import.meta.env.VITE_SUPABASE_URL).origin;
        const prefix = '/storage/v1/object/public/project-files/';
        if (url.origin !== ownOrigin || !url.pathname.startsWith(prefix)) throw new Error('Unsupported project file URL');
        path = decodeURIComponent(url.pathname.slice(prefix.length));
    }
    const bucket = path.startsWith('order/') ? 'submission-files' : 'project-files';
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 300);
    if (error) throw error;
    return { ...file, file_url: data.signedUrl };
}

export async function uploadProjectFile(projectId, file, fileType, uploadedBy) {
    const { data: project, error: projectError } = await supabase.from('projects').select('tenant_id').eq('id', projectId).single();
    if (projectError) throw projectError;
    const safeName = file.name.replace(/[^\p{L}\p{N}._ -]/gu, '_');
    const filePath = `projects/${projectId}/${crypto.randomUUID()}_${safeName}`;
    const { error: uploadError } = await supabase.storage
        .from('project-files')
        .upload(filePath, file);
    if (uploadError) throw uploadError;

    const { data, error } = await supabase
        .from('project_files')
        .insert({
            project_id: projectId,
            tenant_id: project.tenant_id,
            file_url: filePath,
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
    return Promise.all(data.map(withPrivateFileUrl));
}

// ── Messages ──

export async function sendMessage(projectId, senderId, content) {
    const { data: project, error: projectError } = await supabase.from('projects').select('tenant_id').eq('id', projectId).single();
    if (projectError) throw projectError;
    const { data, error } = await supabase
        .from('project_messages')
        .insert({
            project_id: projectId,
            sender_id: senderId,
            tenant_id: project.tenant_id,
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
        supabase.from('orders').select('amount, status').eq('payment_status', 'paid'),
    ]);

    if (projectsRes.error) throw projectsRes.error;
    if (ordersRes.error) throw ordersRes.error;
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
