// User behavior tracking and intelligent lead capture
// This module monitors user engagement and triggers CTAs dynamically

// Engagement tracking variables
window.userEngagementScore = 0;

const tracking = {
    scrollDepth: 0,
    timeOnPage: 0,
    interactions: 0,
    scrollEvents: 0,
    hasTriggeredCTA: false,
    startTime: Date.now()
};

// Initialize tracking
document.addEventListener('DOMContentLoaded', () => {
    initializeTracking();
    startTimeTracking();
});

// Initialize all tracking listeners
function initializeTracking() {
    // Scroll depth tracking
    window.addEventListener('scroll', handleScroll);
    
    // Interaction tracking
    document.addEventListener('click', handleInteraction);
    document.addEventListener('mousemove', debounce(handleMouseMove, 1000));
    
    // Page visibility tracking
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Before unload - calculate final score
    window.addEventListener('beforeunload', calculateFinalScore);
}

// Handle scroll events
function handleScroll() {
    tracking.scrollEvents++;
    
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    const scrollPercentage = (scrollTop / (documentHeight - windowHeight)) * 100;
    tracking.scrollDepth = Math.max(tracking.scrollDepth, Math.round(scrollPercentage));
    
    // Update engagement score
    updateEngagementScore();
    
    // Trigger intelligent CTA
    checkAndTriggerCTA();
}

// Handle user interactions
function handleInteraction(e) {
    // Don't count navigation clicks
    if (e.target.closest('.nav-link') || e.target.closest('.nav-logo')) {
        return;
    }
    
    tracking.interactions++;
    updateEngagementScore();
}

// Handle mouse movement (engagement indicator)
function handleMouseMove() {
    tracking.interactions += 0.1; // Small increment for mouse activity
    updateEngagementScore();
}

// Handle visibility changes (tab switching)
function handleVisibilityChange() {
    if (document.hidden) {
        // User switched tab
        tracking.timeOnPage = Date.now() - tracking.startTime;
    } else {
        // User returned
        tracking.startTime = Date.now();
    }
}

// Start time tracking
function startTimeTracking() {
    setInterval(() => {
        if (!document.hidden) {
            tracking.timeOnPage = Date.now() - tracking.startTime;
            updateEngagementScore();
        }
    }, 5000); // Update every 5 seconds
}

// Calculate engagement score
function updateEngagementScore() {
    let score = 0;
    
    // Scroll depth contribution (0-30 points)
    score += Math.min(30, tracking.scrollDepth * 0.3);
    
    // Time on page contribution (0-40 points)
    const minutesOnPage = tracking.timeOnPage / 60000;
    score += Math.min(40, minutesOnPage * 10);
    
    // Interactions contribution (0-30 points)
    score += Math.min(30, tracking.interactions * 2);
    
    // Round and store
    window.userEngagementScore = Math.round(score);
    
    // Log for debugging
    if (tracking.scrollEvents % 10 === 0) {
        console.log('Engagement Score:', window.userEngagementScore, {
            scrollDepth: tracking.scrollDepth,
            timeOnPage: Math.round(minutesOnPage * 10) / 10,
            interactions: tracking.interactions
        });
    }
}

// Intelligent CTA triggering
function checkAndTriggerCTA() {
    // Only trigger once
    if (tracking.hasTriggeredCTA) return;
    
    // Trigger conditions
    const conditions = {
        // User scrolled past 50% and spent at least 30 seconds
        highEngagement: tracking.scrollDepth > 50 && tracking.timeOnPage > 30000,
        
        // User reached bottom of page
        reachedBottom: tracking.scrollDepth > 90,
        
        // High interaction rate
        highInteraction: tracking.interactions > 5 && tracking.scrollDepth > 30
    };
    
    // Check if any condition is met
    if (conditions.highEngagement || conditions.reachedBottom || conditions.highInteraction) {
        triggerSmartCTA();
    }
}

// Trigger smart CTA
function triggerSmartCTA() {
    tracking.hasTriggeredCTA = true;
    
    // Only show modal on pages that have it (Home page)
    if (document.getElementById('subscribeModal')) {
        // Small delay for better UX
        setTimeout(() => {
            if (typeof window.showSubscribeModal === 'function') {
                window.showSubscribeModal();
                console.log('Smart CTA triggered - Engagement Score:', window.userEngagementScore);
            }
        }, 500);
    }
}

// Calculate final score before page unload
function calculateFinalScore() {
    updateEngagementScore();
    console.log('Final Engagement Score:', window.userEngagementScore);
}

// Utility: Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Export tracking data for use in forms
window.getTrackingData = function() {
    return {
        scrollDepth: tracking.scrollDepth,
        timeOnPage: Math.round(tracking.timeOnPage / 1000),
        interactions: tracking.interactions,
        engagementScore: window.userEngagementScore
    };
};
