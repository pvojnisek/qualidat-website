
// ================================
// CALENDAR FUNCTIONALITY
// ================================

// Default venue addresses (can be overridden by specific tournaments)
const DEFAULT_VENUE_ADDRESSES = {
    'BBMAC': 'Brian Bent Memorial Aquatics Complex, 818 6th St, Coronado, CA 92118',
    'BBMAC #2': 'Brian Bent Memorial Aquatics Complex, 818 6th St, Coronado, CA 92118',
    'GRANITE HILLS': 'Granite Hills High School, 1719 E Madison Ave, El Cajon, CA 92019',
    'GRANITE HILLS #2': 'Granite Hills High School, 1719 E Madison Ave, El Cajon, CA 92019',
    'RIVERSIDE POLY #1': 'Riverside Polytechnic High School, 1020 Riverside Dr, Riverside, CA 92506',
    'RIVERSIDE POLY #2': 'Riverside Polytechnic High School, 1020 Riverside Dr, Riverside, CA 92506',
    'RAMONA HS': 'Ramona High School, 1401 Hanson Ln, Ramona, CA 92065',
    'NORCO HS': 'Norco High School, 2065 Temescal Ave, Norco, CA 92860',
    'CHINO HILLS HS': 'Chino Hills High School, 4100 Carbon Canyon Rd, Chino Hills, CA 91709',
    'SANTIAGO HS': 'Santiago High School, 9725 Magnolia Ave, Riverside, CA 92503'
};

// Calendar event generation function
function generateCalendarEvent(matchData, options = {}) {
    if (!matchData) {
        alert('Match data not found');
        return;
    }

    try {
        // Parse date and time to create proper Date object
        const matchDate = parseMatchDateTime(matchData.date, matchData.time);
        if (!matchDate) {
            alert('Invalid date/time format');
            return;
        }

        // Get venue addresses (use custom or default)
        const venueAddresses = options.venueAddresses || DEFAULT_VENUE_ADDRESSES;
        
        // Get tournament info
        const tournamentName = options.tournamentName || 'Water Polo Tournament';
        const websiteSource = options.websiteSource || 'SD Shores Tournament Website';

        // Create event details
        const eventDetails = {
            title: `${matchData.team1 || matchData.white_team?.name} vs ${matchData.team2 || matchData.dark_team?.name} - Water Polo`,
            startDate: matchDate,
            endDate: new Date(matchDate.getTime() + (60 * 60 * 1000)), // 1 hour duration
            location: venueAddresses[matchData.venue] || matchData.venue,
            description: `${tournamentName}\nGame #${matchData.game_number || matchData.match_id}\nVenue: ${matchData.venue}\n\nGenerated from ${websiteSource}`
        };

        // Show calendar options modal
        showCalendarModal(eventDetails);

    } catch (error) {
        console.error('Error generating calendar event:', error);
        alert('Error creating calendar event. Please try again.');
    }
}

// Parse match date and time to Date object (California timezone)
function parseMatchDateTime(dateStr, timeStr) {
    if (!dateStr || !timeStr) return null;
    
    try {
        // Handle different date formats
        let dateParts;
        if (dateStr.includes('/')) {
            // Format: 6/20/2025 or 06/20/2025
            dateParts = dateStr.split('/');
        } else if (dateStr.includes('-')) {
            // Format: 2025-06-20
            const isoDate = dateStr.split('-');
            dateParts = [isoDate[1], isoDate[2], isoDate[0]]; // Convert to M/D/Y
        } else {
            return null;
        }
        
        if (dateParts.length !== 3) return null;
        
        const month = parseInt(dateParts[0]) - 1; // JS months are 0-based
        const day = parseInt(dateParts[1]);
        const year = parseInt(dateParts[2]);
        
        // Parse time (format: 4:30 PM or 16:30)
        let hours, minutes;
        const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
        if (!timeMatch) return null;
        
        hours = parseInt(timeMatch[1]);
        minutes = parseInt(timeMatch[2]);
        const ampm = timeMatch[3]?.toUpperCase();
        
        // Convert to 24-hour format if AM/PM specified
        if (ampm) {
            if (ampm === 'PM' && hours !== 12) hours += 12;
            if (ampm === 'AM' && hours === 12) hours = 0;
        }
        
        // Create date in California timezone
        const date = new Date(year, month, day, hours, minutes);
        return date;
        
    } catch (error) {
        console.error('Error parsing date/time:', error);
        return null;
    }
}

// Format date for calendar (UTC format for ICS)
function formatDateForCalendar(date) {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

// Show calendar options modal
function showCalendarModal(eventDetails) {
    // Create modal if it doesn't exist
    let modal = document.getElementById('calendarModal');
    if (!modal) {
        modal = createCalendarModal();
    }

    // Update modal content
    const modalBody = modal.querySelector('.calendar-modal-body');
    modalBody.innerHTML = `
        <h4 style="margin: 0 0 15px 0; color: #0077be;">Add Match to Calendar</h4>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <div style="font-weight: bold; margin-bottom: 8px;">${eventDetails.title}</div>
            <div style="font-size: 0.9rem; color: #666; margin-bottom: 4px;">
                📅 ${eventDetails.startDate.toLocaleDateString()} at ${eventDetails.startDate.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
            </div>
            <div style="font-size: 0.9rem; color: #666; margin-bottom: 4px;">
                📍 ${eventDetails.location}
            </div>
            <div style="font-size: 0.9rem; color: #666;">
                ⏱️ Duration: 1 hour
            </div>
        </div>
        <div style="display: grid; gap: 10px;">
            <button onclick="addToGoogleCalendar(${JSON.stringify(eventDetails).replace(/"/g, '&quot;')})" 
                    style="background: #4285f4; color: white; border: none; padding: 12px; border-radius: 6px; cursor: pointer; font-weight: bold;">
                📅 Google Calendar
            </button>
            <button onclick="downloadICS(${JSON.stringify(eventDetails).replace(/"/g, '&quot;')})" 
                    style="background: #0077be; color: white; border: none; padding: 12px; border-radius: 6px; cursor: pointer; font-weight: bold;">
                📋 Download .ics file (Outlook, Apple Calendar)
            </button>
            <button onclick="copyEventText(${JSON.stringify(eventDetails).replace(/"/g, '&quot;')})" 
                    style="background: #28a745; color: white; border: none; padding: 12px; border-radius: 6px; cursor: pointer; font-weight: bold;">
                📄 Copy Event Details
            </button>
        </div>
    `;

    // Show modal
    modal.style.display = 'block';
}

// Create calendar modal
function createCalendarModal() {
    const modal = document.createElement('div');
    modal.id = 'calendarModal';
    modal.className = 'modal';
    modal.style.cssText = 'display: none; position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5);';
    
    modal.innerHTML = `
        <div class="modal-content" style="background: white; margin: 10% auto; padding: 0; width: 90%; max-width: 500px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
            <div class="modal-header" style="padding: 20px; border-bottom: 1px solid #ddd; display: flex; justify-content: space-between; align-items: center;">
                <h3 style="margin: 0; color: #0077be;">Add to Calendar</h3>
                <span class="close" onclick="closeCalendarModal()" 
                      style="color: #aaa; font-size: 28px; font-weight: bold; cursor: pointer;">&times;</span>
            </div>
            <div class="calendar-modal-body" style="padding: 20px;">
                <!-- Content will be inserted here -->
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close when clicking outside
    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeCalendarModal();
        }
    });
    
    // Close on escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && modal.style.display === 'block') {
            closeCalendarModal();
        }
    });
    
    return modal;
}

// Close calendar modal
function closeCalendarModal() {
    const modal = document.getElementById('calendarModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Add to Google Calendar
function addToGoogleCalendar(eventDetails) {
    const startDate = new Date(eventDetails.startDate);
    const endDate = new Date(eventDetails.endDate);
    
    const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: eventDetails.title,
        dates: formatDateForCalendar(startDate) + '/' + formatDateForCalendar(endDate),
        location: eventDetails.location,
        details: eventDetails.description
    });
    
    const url = `https://calendar.google.com/calendar/render?${params.toString()}`;
    window.open(url, '_blank');
    closeCalendarModal();
}

// Download ICS file
function downloadICS(eventDetails) {
    const startDate = new Date(eventDetails.startDate);
    const endDate = new Date(eventDetails.endDate);
    
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//SD Shores//Water Polo Tournament//EN
BEGIN:VEVENT
UID:${Date.now()}@sdshores.org
DTSTAMP:${formatDateForCalendar(new Date())}
DTSTART:${formatDateForCalendar(startDate)}
DTEND:${formatDateForCalendar(endDate)}
SUMMARY:${eventDetails.title}
LOCATION:${eventDetails.location}
DESCRIPTION:${eventDetails.description.replace(/\n/g, '\\n')}
BEGIN:VALARM
TRIGGER:-PT30M
ACTION:DISPLAY
DESCRIPTION:Water Polo Match Reminder
END:VALARM
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `waterpolo-match-${Date.now()}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    closeCalendarModal();
}

// Copy event details to clipboard
function copyEventText(eventDetails) {
    const startDate = new Date(eventDetails.startDate);
    const textToCopy = `${eventDetails.title}

Date: ${startDate.toLocaleDateString()}
Time: ${startDate.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
Location: ${eventDetails.location}
Duration: 1 hour

${eventDetails.description}`;

    navigator.clipboard.writeText(textToCopy).then(function() {
        alert('Event details copied to clipboard!');
        closeCalendarModal();
    }, function(err) {
        console.error('Could not copy text: ', err);
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Event details copied to clipboard!');
        closeCalendarModal();
    });
}

// Helper function to create a calendar button for time cells
function createCalendarButton(matchData, options = {}) {
    const button = document.createElement('button');
    button.className = 'calendar-btn';
    button.style.cssText = `
        background: none; 
        border: none; 
        color: #0077be; 
        font-weight: bold; 
        cursor: pointer; 
        font-size: 0.9rem; 
        padding: 4px 8px; 
        border-radius: 4px; 
        transition: all 0.2s;
        font-family: inherit;
    `;
    button.innerHTML = `📅 ${matchData.time}`;
    button.title = 'Add to Calendar';
    
    // Hover effects
    button.addEventListener('mouseenter', function() {
        this.style.background = '#e3f2fd';
        this.style.transform = 'scale(1.05)';
    });
    
    button.addEventListener('mouseleave', function() {
        this.style.background = 'none';
        this.style.transform = 'scale(1)';
    });
    
    // Click handler
    button.addEventListener('click', function() {
        generateCalendarEvent(matchData, options);
    });
    
    return button;
}