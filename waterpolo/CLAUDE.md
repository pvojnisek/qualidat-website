# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a static website (microsite under /waterpolo/) for water polo tournaments, specifically for the San Diego Shores 16U team's Summer Campaign 2025. The site showcases tournament schedules, results, and provides detailed information about water polo events. In the key matches sections, focus on San Diego Shores teams.

## Video Content Management

The tournament pages now feature **dynamic video integration** that automatically displays YouTube video links for recorded matches. Videos appear in two locations:
1. **Under the relevant team brackets** (e.g., Group C for SD Shores teams)
2. **In the complete match table** (Videos column)

### How to Add Videos During Tournament

To add new videos to any tournament page, follow these steps:

#### Method 1: Update JSON Data File (Recommended)
1. **Edit the tournament JSON file** (e.g., `jos_quali_matches.json`)
2. **Find the match** you want to add videos to by `game_number`
3. **Add a `videos` array** to the match object:

```json
{
  "game_number": 13,
  "date": "6/13/2025",
  "team1": "Shores Black",
  "team2": "Odin B",
  "score1": 20,
  "score2": 0,
  "status": "COMPLETED",
  "videos": [
    {
      "quarter": "Q1",
      "url": "https://youtu.be/VIDEO_ID_HERE",
      "title": "Team1 vs Team2 - Q1"
    },
    {
      "quarter": "Q2", 
      "url": "https://youtu.be/VIDEO_ID_HERE",
      "title": "Team1 vs Team2 - Q2"
    }
  ]
}
```

#### Method 2: Update HTML Embedded Data (Alternative)
1. **Edit the tournament HTML file** (e.g., `20250613_16U_JOs_Quals.html`)
2. **Find the match in the `window.TOURNAMENT_DATA.matches` array**
3. **Add the same `videos` array structure** as shown above

#### Video Object Format
Each video in the `videos` array should have:
- **`quarter`**: Display name (e.g., "Q1", "Q2", "Q3", "Q4", "Full", "Highlights")
- **`url`**: Full YouTube URL (e.g., `https://youtu.be/VIDEO_ID`)
- **`title`**: Descriptive title for accessibility

### Video Display Features

**Automatic Display**: Once videos are added to the data, they automatically appear:
- **Bracket sections**: Videos show under relevant team groups with match details
- **Match table**: Clickable red buttons (Q1, Q2, etc.) in the Videos column
- **Team popups**: Videos appear when clicking on team names in brackets

**Dynamic Updates**: No code changes needed - just update the JSON data and videos appear instantly.

### Current Video Sources

#### Videos from Donald Nelson
Document contains SD Shores Black team match recordings with YouTube links:
- **Source**: https://docs.google.com/document/d/14Q1lVQQbu2w1qPZsN-6UN3NeZhFSjXT2YhX0J-WXlto/export?format=txt
- **Content**: Match videos organized by tournament and opponent
- **Usage**: Extract YouTube URLs and match them to tournament games

#### Example: Current Videos Added
**SD Shores Black vs ODIN B (Game 13)**:
- Q1: https://youtu.be/0ZMirckqmmQ?si=W6poOUCYQjy1WHrn
- Q2: https://youtu.be/XTzXxmc82Nk?si=rTQeAw31b6MdzCNf  
- Q3: https://youtu.be/WxiiKWTiboQ?si=AqM08ye_-ZAvMFrM
- Q4: https://youtu.be/-8Qq811WlDg?si=-MjIoZdoIHtEZ7Gv

### Best Practices

1. **Prioritize current tournament videos** over archived matches
2. **Use consistent quarter naming** (Q1, Q2, Q3, Q4)
3. **Include full YouTube URLs** with any tracking parameters
4. **Focus on SD Shores teams** but include videos for any relevant matches
5. **Test video links** before adding to ensure they work
6. **Update both JSON and HTML** if using embedded data as fallback

## Tournament information

### 16U Boys Junior Olympics Qualification Tournament (June 13-15, 2025)

- Reference of the official google drice sheet as datasource: https://docs.google.com/spreadsheets/d/1C_yU7MyVHzL1_rubWOHVqAeDto9BApOgw7MarJzQoLk/edit?gid=0#gid=0 "16U BOYS" sheet
- the specific sheet can be fetched directly in csv format here: https://docs.google.com/spreadsheets/d/1C_yU7MyVHzL1_rubWOHVqAeDto9BApOgw7MarJzQoLk/export?format=csv&gid=0#gid=0 - use this url to process the tournament official live data
- The data is public and updated regularly

#### Updating Tournament Results from Google Sheets

To fetch and update tournament results from the official Google Sheet, use this curl command:

```bash
curl -L "https://docs.google.com/spreadsheets/d/1C_yU7MyVHzL1_rubWOHVqAeDto9BApOgw7MarJzQoLk/export?format=csv&gid=0" 2>/dev/null
```

**How to identify completed matches from CSV data:**
- Look for rows with game numbers (e.g., "Game # 4", "Game # 6")
- Check for scores in columns S (score1) and S (score2) - if both have numeric values, the match is completed
- Parse team names from "Whites Caps" (team1) and "Dark Caps" (team2) columns
- Update both `jos_quali_matches.json` and `20250613_16U_JOs_Quals.html` files with:
  - `score1` and `score2` values
  - `status` changed from "SCHEDULED" to "COMPLETED"

**CSV Data Format:**
- Column structure: DATE, LOCATION, TIME, [Game #], Whites Caps, S, VS, Dark Caps, S, NOTES
- Completed matches have numeric scores in the S columns
- Game numbers are in format "Game # X" where X is the game number

#### Updating Final Tournament Placements

The tournament results table displays official final placements. The Google Sheet contains a "Final Placement" section at the bottom that shows the official tournament standings.

**Current Official Placements (from Google Sheet):**
```
Final Placement,,,,,,,,,
1,SHORES BLACK,Championship,,,,,,,
2,LJ UNITED - A,Championship,,,,,,,
3,DEL MAR BLUE,Championship,,,,,,,
4,,Championship,,,,,,,
5,,Classic,,,,,,,
...
```

**How to Update Final Placements:**

1. **Check Google Sheet for Updates**: The "Final Placement" section shows official standings
2. **Only update officially announced positions**: Do not guess or calculate - wait for official announcement
3. **Update the HTML table** in `20250613_16U_JOs_Quals.html` in the "Final Tournament Results" section
4. **Replace "To be announced" entries** with actual team names when officially confirmed

**Template for updating a placement:**
```html
<!-- Before (pending) -->
<tr style="background: #f8f9fa;">
    <td style="padding: 12px 8px; border: 1px solid #ddd; text-align: center;">4</td>
    <td style="padding: 12px 8px; border: 1px solid #ddd; color: #888; font-style: italic;">To be announced</td>
    <td style="padding: 12px 8px; border: 1px solid #ddd; text-align: center; color: #888;">Championship</td>
</tr>

<!-- After (official result) -->
<tr style="background: #f8f9fa;">
    <td style="padding: 12px 8px; border: 1px solid #ddd; text-align: center;">4</td>
    <td style="padding: 12px 8px; border: 1px solid #ddd;">⚫ CBAD BLACK</td>
    <td style="padding: 12px 8px; border: 1px solid #ddd; text-align: center;">Championship</td>
</tr>
```

**Important Notes:**
- Only update positions when they appear in the official Google Sheet Final Placement section
- Keep team emoji prefixes consistent (🌊 for Shores, ⚪ for LJ United, 🔵 for Del Mar, etc.)
- Remove gray color and italic styling when updating from "To be announced"
- The table automatically shows qualification levels (Championship 1-4, Classic 5-8, Invitational 9-11, DNQ 12-16)

### Locations

- BBMAC: Brian Bent Memorial Aquatics Complex (location: MRVC+33 Coronado, California)
- Granite Hills High School (location: Q3XP+86 El Cajon, California)

### Teams, matches

Bracket
- 4 groups: A, B, C, D
  - A: Del Mar Blue, Del Mar White, Southern, Southern B
  - B: LJ United A, Poway, LJ United B, NADO
  - C: Shores Black, Shores Gold, NSD Stars, Odin B
  - D: CBAD Black, Odin A, Shores White, CBAD Silver

Re-bcacket
- 4 groups: AA, BB, CC, DD
  - AA - 1st A, 1st B, 1st C, 1st D
  - BB - 2nd A, 2nd B, 2nd C, 2nd D
  - CC - 3rd A, 3rd B, 3rd C, 3rd D
  - DD - 4th A, 4th B, 4th C, 4th D

Championship winner will be the winner of the AA group. (AA: 1-4 places, BB: 5-8 places, CC: 9-12 places, DD: 13-16 places)

### Sections on the webpage (in order)
- Tournament information
- Bracket
- Bracket matches (foldable)
- Re-bracket
- Re-bracket matches
- Championship matches
- Statistics (matches, goals, etc..)
- Format summary, fun facts, etc..
- Data source

## Architecture

The website follows a simple static architecture:

- **index.html**: Main landing page with tournament schedule and navigation
- **Tournament pages**: Individual HTML files for specific tournaments (e.g., `20250607_KJVR_memorial_18U.html`, `20250613_16U_JOs_Quals.html`)
- **style.css**: Comprehensive CSS with water polo-themed styling, responsive design, and interactive elements
- **script.js**: JavaScript for animations, interactive stats, collapsible content, and hover effects

## Styling System

The CSS uses a cohesive water polo theme with:
- Blue gradient backgrounds (#0077be, #00a8cc, #4fc3f7)
- Card-based layout with hover animations
- Responsive grid systems for matches, standings, and statistics
- Collapsible sections for detailed tournament data
- CSS animations including wave effects and stat counter animations

## JavaScript Features

The script.js handles:
- **Dynamic video integration**: Automatically displays YouTube video links in brackets and match tables
- **Interactive match popups**: Click team names to see all their matches with video links
- **Tournament data loading**: Supports both external JSON files and embedded data
- Animated stat counters that count up when scrolled into view
- Hover effects for cards (match-card, fact-card, stat-card)
- Collapsible content functionality for tournament details
- Scroll-triggered animations

## Tournament Page Structure

Each tournament page follows a consistent structure:
- Hero section with tournament name and memorial information
- Tournament standings with medal indicators
- Match results in card format
- Statistics grids with animated counters
- Collapsible sections for complete match listings
- Fun facts about water polo
- Data source attribution

## Development Workflow

This is a static site with no build process or package management. Changes can be made directly to HTML, CSS, and JavaScript files. The site uses modern CSS features and vanilla JavaScript without external dependencies.

## File Naming Convention

Tournament files follow the pattern: `YYYYMMDD_tournament_description.html` (e.g., `20250607_KJVR_memorial_18U.html`)

## Browser Compatibility

The site uses modern CSS features like CSS Grid, Flexbox, and CSS custom properties. JavaScript uses modern DOM APIs and should work in all current browsers. Designed to work on mobile phone and computer dispalys also.

## Pool locations

- BBMC
<a href="https://maps.google.com/maps?q=818+6th+St,+Coronado,+CA+92118">
  Navigate to Brian Bent Memorial Aquatics Complex
</a>
- Granite Hills High School - 1719 E Madison Ave, El Cajon, CA 92019, United States

## Adding New Pool Locations to pools.html

When adding a new pool/venue to the pools.html page, follow this template structure:

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

### 4. Styling Guidelines
- **Navigation buttons** must have the blue background (#0077be) and full-width styling
- **Collapsible icons** should match the venue type (🏫 for schools, 🏊‍♂️ for aquatic centers)
- **Fact card icons** should be relevant (📍 location, 🏊‍♂️ pools, 🏆 tournaments, etc.)
- **Additional resources** should use appropriate icons (🏠 websites, 📘 Facebook, 📞 phone, etc.)

### 5. Placement
- Insert new pool sections **before the closing `</div>` of the container**
- Maintain alphabetical or logical order (by tournament importance/geographic location)
- Ensure proper spacing between sections

### 6. Anchor Link System
Each pool section has an anchor ID for direct linking:
- **BBMAC**: `#bbmac` - `pools.html#bbmac`
- **Granite Hills**: `#granite-hills` - `pools.html#granite-hills`
- **Norco**: `#norco` - `pools.html#norco`
- **Riverside Poly**: `#riverside-poly` - `pools.html#riverside-poly`
- **Ramona**: `#ramona` - `pools.html#ramona`
- **Santiago**: `#santiago` - `pools.html#santiago`

When creating anchor IDs for new pools:
- Use lowercase letters and hyphens only
- Keep it short but descriptive
- Follow pattern: `[school-name]` or `[facility-abbreviation]`

### 7. JavaScript Behavior
The page automatically:
- **Closes all sections** when page loads
- **Opens only the linked section** if URL contains anchor hash
- **Smooth scrolls** to the opened section
- **Handles hash changes** when users click anchor links
- **Maintains collapsible functionality** from script.js

### 8. Required Information to Gather
Before adding a new pool, collect:
- Full address and location details
- Pool specifications (size, lanes, features)
- Tournament role and significance
- Website and contact information
- Parking and access information
- Any unique features or history
- **Anchor ID** (lowercase, hyphenated, unique)
