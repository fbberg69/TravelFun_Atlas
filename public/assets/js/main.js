// Main JavaScript for Travel4Fun4U

// Initialize Supabase
const SUPABASE_URL = 'https://uxwdcfblazcmgicgjrxh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4d2RjZmJsYXpjbWdpY2dqcnhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwMjEzNjgsImV4cCI6MjA3NzU5NzM2OH0.YZ91Xc5EWZrVhG86iZM9KsFitn7F1_unMpC2c15ckHA';

let supabase;
if (typeof window.supabase !== 'undefined') {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('Supabase client initialized');
}

// Navigation functionality
document.addEventListener('DOMContentLoaded', () => {
    // Mobile navigation toggle
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
        
        // Close menu when clicking on a link
        const navLinkElements = document.querySelectorAll('.nav-link');
        navLinkElements.forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
            });
        });
    }
    
    // Navbar scroll effect
    const navbar = document.getElementById('mainNav');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.style.background = 'rgba(0, 17, 34, 0.98)';
            } else {
                navbar.style.background = 'rgba(0, 17, 34, 0.95)';
            }
        });
    }
    
    // Initialize subscribe form handlers
    initializeSubscribeForms();
});

// Scroll to tools section
function scrollToTools() {
    const toolsSection = document.getElementById('tools');
    if (toolsSection) {
        toolsSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Modal functions
function showSubscribeModal() {
    const modal = document.getElementById('subscribeModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeSubscribeModal() {
    const modal = document.getElementById('subscribeModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// Initialize all subscribe forms
function initializeSubscribeForms() {
    // Home page modal form
    const subscribeForm = document.getElementById('subscribeForm');
    if (subscribeForm) {
        subscribeForm.addEventListener('submit', handleSubscribe);
    }
    
    // Atlas page form
    const atlasSubscribeForm = document.getElementById('atlasSubscribeForm');
    if (atlasSubscribeForm) {
        atlasSubscribeForm.addEventListener('submit', handleAtlasSubscribe);
    }
}

// Handle subscribe form submission (Home page modal)
async function handleSubscribe(e) {
    e.preventDefault();
    
    const emailInput = document.getElementById('emailInput');
    const messageElement = document.getElementById('subscribeMessage');
    const email = emailInput.value.trim();
    
    if (!email) {
        showMessage(messageElement, 'Please enter a valid email address', 'error');
        return;
    }
    
    try {
        // Get engagement score from tracking
        const engagementScore = window.userEngagementScore || 0;
        
        await subscribeUser(email, 'home_modal', engagementScore);
        
        showMessage(messageElement, 'Thank you! Check your email for confirmation.', 'success');
        emailInput.value = '';
        
        // Close modal after 2 seconds
        setTimeout(() => {
            closeSubscribeModal();
            messageElement.style.display = 'none';
        }, 2000);
        
    } catch (error) {
        console.error('Subscribe error:', error);
        showMessage(messageElement, 'Something went wrong. Please try again.', 'error');
    }
}

// Handle Atlas page subscribe form
async function handleAtlasSubscribe(e) {
    e.preventDefault();
    
    const emailInput = document.getElementById('atlasEmailInput');
    const messageElement = document.getElementById('atlasSubscribeMessage');
    const email = emailInput.value.trim();
    
    if (!email) {
        showMessage(messageElement, 'Please enter a valid email address', 'error');
        return;
    }
    
    try {
        const engagementScore = window.userEngagementScore || 0;
        
        await subscribeUser(email, 'atlas_page', engagementScore);
        
        showMessage(messageElement, 'Thank you! You\'ll be notified about Atlas v42 access.', 'success');
        emailInput.value = '';
        
    } catch (error) {
        console.error('Subscribe error:', error);
        showMessage(messageElement, 'Something went wrong. Please try again.', 'error');
    }
}

// Subscribe user to database
async function subscribeUser(email, source, engagementScore) {
    if (!supabase) {
        throw new Error('Supabase not initialized');
    }
    
    const { data, error } = await supabase
        .from('early_access_subscribers')
        .insert([
            {
                email: email,
                source: source,
                engagement_score: engagementScore
            }
        ])
        .select()
        .maybeSingle();
    
    if (error) {
        // If email already exists, update engagement score
        if (error.code === '23505') {
            const { data: updateData, error: updateError } = await supabase
                .from('early_access_subscribers')
                .update({ 
                    engagement_score: engagementScore,
                    source: source
                })
                .eq('email', email)
                .select()
                .maybeSingle();
            
            if (updateError) {
                throw updateError;
            }
            return updateData;
        }
        throw error;
    }
    
    return data;
}

// Show message helper
function showMessage(element, message, type) {
    if (!element) return;
    
    element.textContent = message;
    element.className = `form-message ${type}`;
    element.style.display = 'block';
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    const modal = document.getElementById('subscribeModal');
    if (e.target === modal) {
        closeSubscribeModal();
    }
});

// Expose functions to global scope
window.scrollToTools = scrollToTools;
window.showSubscribeModal = showSubscribeModal;
window.closeSubscribeModal = closeSubscribeModal;
