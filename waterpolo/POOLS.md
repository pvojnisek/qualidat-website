# POOLS.md

## Pool Venue Management System

This document provides comprehensive guidance for managing venue information and adding new pool locations to the `pools.html` page. The system features clickable navigation, venue-specific information, and integrated tournament links.

## Current Pool Locations

### Existing Venues
- **BBMAC**: Brian Bent Memorial Aquatics Complex - `pools.html#bbmac`
- **Granite Hills**: Granite Hills High School - `pools.html#granite-hills`
- **Norco**: Norco High School - `pools.html#norco`
- **Riverside Poly**: Riverside Polytechnic High School - `pools.html#riverside-poly`
- **Ramona**: Ramona High School - `pools.html#ramona`
- **Santiago**: Santiago High School - `pools.html#santiago`

### Venue Integration
- **Tournament Pages**: Venue names automatically link to pool information
- **Navigation System**: Direct anchor links for quick access
- **Mobile Responsive**: Optimized for mobile and desktop viewing

## Adding New Pool Locations

### 1. Create New Pool Section

Add a new content section following this exact pattern:

```html
<!-- [POOL NAME] -->
<div class="content-section" id="[pool-anchor-id]">
    <button class="collapsible">🏫 [Pool Name]</button>
    <div class="collapsible-content">
        <div class="memorial-story">
            <h3>🏆 [Brief Description] - [City]</h3>
            <p>[First paragraph describing the facility, its significance, and key features]</p>
            <p>[Second paragraph with additional details, history, or tournament role]</p>
        </div>
        <div class="fun-facts">
            [Fact cards - see template below]
        </div>
        <div class="fun-facts">
            [Navigation and resources - see template below]
        </div>
    </div>
</div>
```

### 2. Fact Cards Template

Use 4 fact cards with these typical categories:

```html
<div class="fact-card">
    <div class="fact-icon">📍</div>
    <div class="fact-title">Location & Access</div>
    <div class="fact-text">
        <strong>Address:</strong> [Full address]<br>
        <strong>School/District:</strong> [If applicable]<br>
        <strong>Access:</strong> [Highway/freeway access]<br>
        <strong>Parking:</strong> [Parking information]
    </div>
</div>

<div class="fact-card">
    <div class="fact-icon">🏊‍♂️</div>
    <div class="fact-title">Pool Specifications</div>
    <div class="fact-text">
        <strong>Size:</strong> [Pool dimensions]<br>
        <strong>Configuration:</strong> [Pool setup]<br>
        <strong>Lanes:</strong> [Number of lanes]<br>
        <strong>Features:</strong> [Special features]
    </div>
</div>

<div class="fact-card">
    <div class="fact-icon">🏆</div>
    <div class="fact-title">Tournament Role</div>
    <div class="fact-text">
        <strong>Events:</strong> [Which tournaments]<br>
        <strong>Role:</strong> [Primary venue, co-host, finals, etc.]<br>
        <strong>Standards:</strong> [Competition level]<br>
        <strong>Capacity:</strong> [Spectator/event capacity]
    </div>
</div>

<div class="fact-card">
    <div class="fact-icon">🎯</div>
    <div class="fact-title">[Custom Category]</div>
    <div class="fact-text">
        [Custom content based on what makes this venue unique]
    </div>
</div>
```

### 3. Navigation and Resources Template

Always include these two fact cards at the end:

```html
<div class="fun-facts">
    <div class="fact-card">
        <div class="fact-icon">🗺️</div>
        <div class="fact-title">Navigation</div>
        <div class="fact-text">
            <a href="https://maps.google.com/maps?q=[URL_ENCODED_ADDRESS]" 
               target="_blank" rel="noopener noreferrer" 
               style="display: inline-block; background: #0077be; color: white; padding: 12px 20px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 1.1rem; margin: 5px 0; width: 100%; text-align: center; box-sizing: border-box;">
                📍 Navigate to [Pool Name]
            </a>
        </div>
    </div>
    <div class="fact-card">
        <div class="fact-icon">🌐</div>
        <div class="fact-title">Additional Resources</div>
        <div class="fact-text">
            <a href="[WEBSITE_URL]" target="_blank" rel="noopener noreferrer" 
               style="color: #0077be; text-decoration: none; font-weight: bold;">
                🏠 [Website Name]
            </a><br>
            <a href="[ADDITIONAL_URL]" target="_blank" rel="noopener noreferrer" 
               style="color: #0077be; text-decoration: none; font-weight: bold;">
                [ICON] [Additional Resource Name]
            </a>
        </div>
    </div>
</div>
```

## Styling Guidelines

### Visual Design Standards
- **Navigation buttons** must have the blue background (#0077be) and full-width styling
- **Collapsible icons** should match the venue type (🏫 for schools, 🏊‍♂️ for aquatic centers)
- **Fact card icons** should be relevant (📍 location, 🏊‍♂️ pools, 🏆 tournaments, etc.)
- **Additional resources** should use appropriate icons (🏠 websites, 📘 Facebook, 📞 phone, etc.)

### Color Scheme
- **Primary Blue**: #0077be (navigation buttons, links)
- **Background Colors**: Consistent with site theme
- **Text Colors**: High contrast for readability
- **Hover Effects**: Smooth transitions matching site animations

## Placement Guidelines

### Organization Rules
- Insert new pool sections **before the closing `</div>` of the container**
- Maintain alphabetical or logical order (by tournament importance/geographic location)
- Ensure proper spacing between sections
- Consider regional grouping (San Diego County, Orange County, etc.)

### Content Hierarchy
1. **Primary Tournament Venues**: Most frequently used pools first
2. **Secondary Venues**: Co-host and specialty venues
3. **Regional Venues**: Grouped by geographic proximity
4. **Historic Venues**: Special or memorial pools

## Anchor Link System

### Current Anchor IDs
- **BBMAC**: `#bbmac` - `pools.html#bbmac`
- **Granite Hills**: `#granite-hills` - `pools.html#granite-hills`
- **Norco**: `#norco` - `pools.html#norco`
- **Riverside Poly**: `#riverside-poly` - `pools.html#riverside-poly`
- **Ramona**: `#ramona` - `pools.html#ramona`
- **Santiago**: `#santiago` - `pools.html#santiago`

### Anchor ID Creation Rules
- Use lowercase letters and hyphens only
- Keep it short but descriptive
- Follow pattern: `[school-name]` or `[facility-abbreviation]`
- Ensure uniqueness across all venue IDs
- Avoid special characters or spaces

### Examples
- `chino-hills` (Chino Hills High School)
- `marina-hs` (Marina High School)
- `irvine-aquatic` (Irvine Aquatic Center)
- `uci-pool` (UC Irvine Pool)

## JavaScript Integration

### Automatic Behavior
The pools.html page automatically:
- **Closes all sections** when page loads
- **Opens only the linked section** if URL contains anchor hash
- **Smooth scrolls** to the opened section
- **Handles hash changes** when users click anchor links
- **Maintains collapsible functionality** from `script.js`

### Script.js Integration
The main `script.js` file contains venue mapping for automatic linking:

```javascript
// Define venue mappings to anchor links
const venueMap = {
    'BBMAC': { anchor: 'bbmac', display: 'BBMAC' },
    'BBMAC #2': { anchor: 'bbmac', display: 'BBMAC #2' },
    'GRANITE_HILLS': { anchor: 'granite-hills', display: 'Granite Hills' },
    'GRANITE HILLS': { anchor: 'granite-hills', display: 'Granite Hills' },
    'RIVERSIDE POLY #1': { anchor: 'riverside-poly', display: 'Riverside Poly #1' },
    'RAMONA HS': { anchor: 'ramona', display: 'Ramona HS' },
    'NORCO HS': { anchor: 'norco', display: 'Norco HS' },
    'SANTIAGO HS': { anchor: 'santiago', display: 'Santiago HS' },
    'CHINO HILLS HS': { anchor: 'chino-hills', display: 'Chino Hills HS' }
};
```

### Adding New Venues to Script.js
When adding a new venue to pools.html, also update the venueMap in script.js:

```javascript
'NEW VENUE NAME': { anchor: 'new-venue-anchor', display: 'Display Name' },
```

## Required Information Checklist

### Essential Details to Gather
Before adding a new pool, collect:
- **Full address** and location details
- **Pool specifications** (size, lanes, features)
- **Tournament role** and significance
- **Website** and contact information
- **Parking** and access information
- **Any unique features** or history
- **Anchor ID** (lowercase, hyphenated, unique)

### Data Sources
- **School/facility websites**
- **Tournament documentation**
- **Google Maps** for addresses and directions
- **Local water polo organizations**
- **Tournament directors** for specific details

### Verification Steps
1. **Address accuracy** - Verify with Google Maps
2. **Website links** - Ensure all URLs work
3. **Anchor uniqueness** - Check no conflicts with existing IDs
4. **Mobile responsiveness** - Test on various screen sizes
5. **Navigation functionality** - Test links from tournament pages

## Maintenance Guidelines

### Regular Updates
- **Check links** - Verify external links still work
- **Update information** - Keep specifications current
- **Add new tournaments** - Update tournament role information
- **Seasonal changes** - Update availability and access information

### Quality Assurance
- **Consistent formatting** - Maintain template structure
- **Accurate information** - Verify all details
- **Responsive design** - Test on mobile devices
- **Performance** - Ensure fast loading times

## Integration with Tournament System

### Tournament Page Links
Tournament pages automatically create clickable venue links using the venue mapping system. When a venue appears in match data, it becomes a clickable link to the appropriate pools.html section.

### Link Creation Function
```javascript
function createVenueLink(venueName) {
    // Check for exact match in venueMap
    if (venueMap[venueName]) {
        const venue = venueMap[venueName];
        return `<a href="pools.html#${venue.anchor}" style="color: #0077be; text-decoration: none; font-weight: inherit;">${venue.display}</a>`;
    }
    // Fallback: return as-is if no match found
    return venueName;
}
```

### Benefits of Integration
- **Seamless navigation** - Users can quickly find venue information
- **Consistent experience** - All venue references are clickable
- **Detailed information** - Complete venue profiles with directions
- **Mobile optimization** - Works perfectly on mobile devices

## File References

### Key Files
- **Main venue page**: `pools.html`
- **Styling**: `style.css`
- **JavaScript integration**: `script.js`
- **Tournament pages**: All tournament HTML files with venue references

### Cross-References
- **Tournament documentation** - See individual tournament .md files
- **JavaScript features** - See main CLAUDE.md for script.js details
- **Styling system** - See main CLAUDE.md for CSS architecture