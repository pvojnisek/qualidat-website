// Core JavaScript functionality shared across all pages
// Contains: photo zoom, venue links, collapsible elements, basic utilities

// Function to convert venue names to clickable links
function createVenueLink(venueName) {
    if (!venueName || venueName === 'TBD') {
        return venueName || 'TBD';
    }
    
    // Define venue mappings to anchor links
    const venueMap = {
        'BBMAC': { anchor: 'bbmac', display: 'BBMAC' },
        'BBMAC #2': { anchor: 'bbmac', display: 'BBMAC #2' },
        'GRANITE_HILLS': { anchor: 'granite-hills', display: 'Granite Hills' },
        'GRANITE HILLS': { anchor: 'granite-hills', display: 'Granite Hills' },
        'GRANITE_HILLS #2': { anchor: 'granite-hills', display: 'Granite Hills #2' },
        'GRANITE HILLS #2': { anchor: 'granite-hills', display: 'Granite Hills #2' },
        'RIVERSIDE POLY #1': { anchor: 'riverside-poly', display: 'Riverside Poly #1' },
        'RIVERSIDE POLY #2': { anchor: 'riverside-poly', display: 'Riverside Poly #2' },
        'RAMONA HS': { anchor: 'ramona', display: 'Ramona HS' },
        'NORCO HS': { anchor: 'norco', display: 'Norco HS' },
        'SANTIAGO HS': { anchor: 'santiago', display: 'Santiago HS' },
        'CHINO HILLS HS': { anchor: 'chino-hills', display: 'Chino Hills HS' }
    };
    
    // Clean venue name (remove underscores, normalize)
    const cleanVenue = venueName.replace(/_/g, ' ').trim();
    
    // Check for exact match first
    if (venueMap[venueName]) {
        const venue = venueMap[venueName];
        return `<a href="pools.html#${venue.anchor}" style="color: #0077be; text-decoration: none; font-weight: inherit;">${venue.display}</a>`;
    }
    
    // Check for cleaned match
    if (venueMap[cleanVenue]) {
        const venue = venueMap[cleanVenue];
        return `<a href="pools.html#${venue.anchor}" style="color: #0077be; text-decoration: none; font-weight: inherit;">${venue.display}</a>`;
    }
    
    // Check for partial matches (for cases like "BBMAC" in "BBMAC #2")
    for (const [key, venue] of Object.entries(venueMap)) {
        if (cleanVenue.includes(key.replace(/_/g, ' ')) || key.includes(cleanVenue)) {
            return `<a href="pools.html#${venue.anchor}" style="color: #0077be; text-decoration: none; font-weight: inherit;">${cleanVenue}</a>`;
        }
    }
    
    // Fallback: return as-is if no match found
    return cleanVenue;
}

// Photo zoom functionality
function zoomImage(img) {
    // Create overlay if it doesn't exist
    let overlay = document.querySelector('.photo-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'photo-overlay';
        
        // Create close button
        const closeBtn = document.createElement('div');
        closeBtn.className = 'close-btn';
        closeBtn.innerHTML = '×';
        closeBtn.onclick = closeZoom;
        
        // Create zoomed image
        const zoomedImg = document.createElement('img');
        zoomedImg.src = img.src;
        zoomedImg.alt = img.alt;
        
        overlay.appendChild(closeBtn);
        overlay.appendChild(zoomedImg);
        document.body.appendChild(overlay);
        
        // Close on click outside image
        overlay.onclick = function(e) {
            if (e.target === overlay) {
                closeZoom();
            }
        };
        
        // Close on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeZoom();
            }
        });
    } else {
        // Update existing overlay with new image
        const zoomedImg = overlay.querySelector('img');
        zoomedImg.src = img.src;
        zoomedImg.alt = img.alt;
    }
    
    // Show overlay
    overlay.classList.add('show');
    // Disable body scroll
    document.body.style.overflow = 'hidden';
}

function closeZoom() {
    const overlay = document.querySelector('.photo-overlay');
    if (overlay) {
        overlay.classList.remove('show');
        // Don't set display: none since CSS handles it
    }
    
    // Restore body scroll
    document.body.style.overflow = '';
}

// Initialize core functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Core JavaScript loaded');
    
    // Initialize collapsible functionality
    const collapsibles = document.querySelectorAll('.collapsible');
    collapsibles.forEach(collapsible => {
        collapsible.addEventListener('click', function() {
            this.classList.toggle('active');
            const content = this.nextElementSibling;
            if (content && content.classList.contains('collapsible-content')) {
                content.classList.toggle('active');
            }
        });
    });
    
    // Initialize stat number animations on scroll
    const statNumbers = document.querySelectorAll('.stat-number');
    if (statNumbers.length > 0) {
        const animateStats = () => {
            statNumbers.forEach(stat => {
                const rect = stat.getBoundingClientRect();
                if (rect.top < window.innerHeight && rect.bottom > 0) {
                    if (!stat.classList.contains('animated')) {
                        stat.classList.add('animated');
                        const finalValue = parseFloat(stat.textContent);
                        let currentValue = 0;
                        const increment = finalValue / 50;

                        const timer = setInterval(() => {
                            currentValue += increment;
                            if (currentValue >= finalValue) {
                                currentValue = finalValue;
                                clearInterval(timer);
                            }
                            stat.textContent = Math.floor(currentValue * 10) / 10;
                        }, 20);
                    }
                }
            });
        };

        // Initial check
        animateStats();
        
        // Check on scroll
        window.addEventListener('scroll', animateStats);
    }
    
    // Add hover effects for cards
    const cards = document.querySelectorAll('.match-card, .fact-card, .stat-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
});