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

### Futures Super Finals 2025 - Boys Division (June 27-29, 2025)

**Tournament Overview**: The Futures Water Polo League Super Finals represents the pinnacle of competitive youth water polo in the United States, featuring elite 16U and 18U Boys divisions.

**Official Data Source**: https://feeds.kahunaevents.org/kahuna
- **Real-time tournament feed** with live match results
- **Data format**: Kahuna Events format with structured field separation
- **Update frequency**: Continuous live updates during tournament
- **Access method**: CORS proxy required for web access

#### Kahuna Events Data Structure

**Data Format**: `HOT! RESULT DIVISION  DATE  VENUE  TIME  GAME_ID  TEAM1=SCORE1  TEAM2=SCORE2  PLACEMENT`

**Field Structure** (separated by double spaces):
1. **Status + Division** - `HOT! RESULT 16U_BOYS` 
2. **Date** - `27-Jun` (day-month format)
3. **Venue** - `MARINA HS`
4. **Time** - `3:00 PM`
5. **Game ID** - `16B63`
6. **Team 1 + Score** - `W#38-SANTA CRUZ=17` (prefix removed in parsing)
7. **Team 2 + Score** - `W#40-NAVY=6` (prefix removed in parsing)
8. **Placement** - `9th` (bracket placement or round info)

**Live Results Implementation** (`futures/live_results.html`):
- **Real-time data streaming** via robust CORS proxy system (optimized for speed)
- **Separated code architecture** - CSS (`live_results.css`) and JS (`live_results.js`) files
- **Mobile-first compact design** - fixed-size cards optimized for mobile screens
- **Fancy card layout** with match details parsed from Kahuna format
- **SD Shores highlighting** with specific team detection patterns
- **HOT label filtering** - only shows "HOT! 🔥" for today's matches
- **Auto-refresh** every 3 minutes with countdown timer
- **Enhanced team name parsing** - removes tournament prefixes and level suffixes
- **Collapsible details system** - venue/time info hidden by default with toggle buttons
- **Advanced filter system** - 6 independent filters with separated age and gender categories

#### Live Results Filter System

**Filter Categories (6 total filters):**
1. **Age Group Filters** (OR logic within category):
   - `🏆 14U` - Filters for 14U_BOYS, 14U BOYS, 14U_GIRLS, 14U GIRLS
   - `🏆 16U` - Filters for 16U_BOYS, 16U BOYS, 16U_GIRLS, 16U GIRLS (default: checked)
   - `🏆 18U` - Filters for 18U_BOYS, 18U BOYS, 18U_GIRLS, 18U GIRLS

2. **Gender Filters** (OR logic within category):
   - `👦 BOYS` - Filters for _BOYS, BOYS (default: checked)
   - `👧 GIRLS` - Filters for _GIRLS, GIRLS

3. **Team Filters**:
   - `🌊 Shores` - Filters for SD Shores team matches using pattern matching

**Filter Logic:**
- **Between categories**: AND logic (Age AND Gender AND Teams)
- **Within categories**: OR logic (14U OR 16U OR 18U, BOYS OR GIRLS)
- **Default behavior**: 16U + BOYS = shows only 16U boys matches
- **Sequential filtering**: Each category filters the results from previous category

**Filter Implementation:**
```javascript
// Age groups: if any age filter checked, show matches for selected ages
const hasAgeFilters = filter14U || filter16U || filter18U;
if (hasAgeFilters) {
    // Show matches that match ANY selected age group (OR logic)
    return matches14U || matches16U || matches18U;
}

// Gender: if any gender filter checked, show matches for selected genders  
const hasGenderFilters = filterBoys || filterGirls;
if (hasGenderFilters) {
    // Show matches that match ANY selected gender (OR logic)
    return matchesBoys || matchesGirls;
}
```

#### SD Shores Team Detection Patterns
```javascript
const SHORES_PATTERNS = [
    /\bsd shores\b/i,
    /\bsan diego shores\b/i,
    /\bshores black\b/i,
    /\bshores gold\b/i,
    /\bshores white\b/i,
    /\bshores blue\b/i,
    /\bshores red\b/i
];
```
**Note**: Uses word boundaries to avoid false positives like "SHORE RED"

#### CORS Proxy Configuration (Ordered by Speed)
```javascript
// Proxy order optimized by speed testing (June 2025):
// CodeTabs: 0.67s avg, ThingProxy: 1.40s avg, AllOrigins: FAILED
const PROXIES = [
    { name: 'CodeTabs', url: 'https://api.codetabs.com/v1/proxy/?quest=' },      // Fastest (52% faster)
    { name: 'ThingProxy', url: 'https://thingproxy.freeboard.io/fetch/' },      // Backup  
    { name: 'AllOrigins', url: 'https://api.allorigins.win/raw?url=' }           // Fallback only
];
```

#### Live Results Access
- **Main tournament page**: `20250627_Futures_Super_Finals_2025.html`
- **Live results page**: `futures/live_results.html`
- **Index.html integration**: Red pulsing "🔴 Live Results" button on Futures card

#### Status Badge Logic
- **HOT! 🔥**: Today's matches only (date-filtered)
- **LIVE**: Active/playing matches
- **FINAL**: Completed finals
- **UPCOMING**: Scheduled matches
- **No badge**: Historical results (RESULT tags removed)

### 16U US Club Championship (June 20-22)

Official google sheet: https://docs.google.com/spreadsheets/d/1FuCUomKqgfg8d83zYxld0B2mnTmcbefwyxKFEebMgiY/edit?gid=0#gid=0

#### Updating US Club Championship Match Data

**IMPORTANT**: Match scores and results are now being updated live in the official Google Sheet. To update the website with the latest match results, follow these steps:

##### Method 1: Download and Update CSV Data (Recommended)

1. **Download the latest CSV data** from Google Sheets:
```bash
curl -L "https://docs.google.com/spreadsheets/d/1FuCUomKqgfg8d83zYxld0B2mnTmcbefwyxKFEebMgiY/export?format=csv&gid=0" 2>/dev/null
```

2. **Clean the CSV data** to extract only match rows:
```bash
curl -L "https://docs.google.com/spreadsheets/d/1FuCUomKqgfg8d83zYxld0B2mnTmcbefwyxKFEebMgiY/export?format=csv&gid=0" 2>/dev/null | grep -E "^[0-9]+/[0-9]+/[0-9]+" | grep -v "18 BOYS" | awk -F',' '{print $1","$2","$3","$4","$5","$6","$7","$8}' > cleaned_matches.csv
```

3. **Add the CSV header**:
```bash
echo "DATE,LOCATION,TIME,WHITE TEAM,S,DARK TEAM,S,COMMENTS" > final_data.csv && cat cleaned_matches.csv >> final_data.csv
```

4. **Update the HTML file** (`20250620 US_Club_Championship_16U.html`):
   - Open the file and locate the `csvData` section (around lines 113-152)
   - Replace the entire content between the backticks with the new CSV data from `final_data.csv`

##### Method 2: Direct CSV Replacement (Quick Update)

If you need to quickly update just a few match scores:

1. **Identify completed matches** in the Google Sheet (matches with scores in both S columns)
2. **Find the corresponding match** in the HTML file's csvData section
3. **Update the score columns** (5th and 7th columns in CSV format)
4. **Change status indicators** if needed (empty score columns = scheduled, filled = completed)

##### CSV Data Format Reference

The embedded CSV data follows this structure:
```
DATE,LOCATION,TIME,WHITE TEAM,S,DARK TEAM,S,COMMENTS
6/20/2025,RIVERSIDE POLY #1,4:30 PM,D1 - THUNDER,12,D4 - KERN PREMIER,8,bracket
```

**Key Points:**
- **Columns 5 & 7 (S)**: Score columns for WHITE TEAM and DARK TEAM
- **Empty scores**: Match is scheduled
- **Filled scores**: Match is completed
- **Column 8 (COMMENTS)**: Match phase/bracket info and placement indicators

##### Score Update Detection

The JavaScript automatically detects completed matches when:
- Both score columns (5th and 7th) contain numeric values
- Status changes from "SCHEDULED" to "COMPLETED"
- Match highlighting updates for key games

##### Multiple Data Update Points ⚠️ **IMPORTANT**

**When updating match data, you MUST update multiple places:**

1. **Main Match Table**: All matches display in the "All Tournament Matches" section
2. **Team Match Modals**: Clickable team names in pools show individual team match histories
3. **Pool Structure**: The hardcoded pools array must match actual teams in CSV data
4. **Statistics Calculations**: Team/match counts auto-update from CSV data

**Key Update Locations in `20250620 US_Club_Championship_16U.html`:**
- **CSV Data**: Lines 113-152 (embedded csvData)
- **Pools Array**: Lines 263-268 (must match actual CSV teams)
- **Team Name Matching**: Team names in pools must exactly match CSV team names

**Clickable Teams Feature:**
- Pool team names are clickable and show all matches for that team
- Uses `match.white_team.name` and `match.dark_team.name` for filtering
- Team name mismatches will cause "No matches found" errors
- Venue names in modals are clickable links to pools.html

##### Tournament Statistics Auto-Update

When updating match data, these statistics auto-calculate:
- **Team count**: Extracted from unique team names
- **Match count**: Total matches in CSV (currently 39)
- **Venue count**: Unique venues (currently 4)
- **Pool standings**: Calculated from completed pool matches

##### Venues Covered

All tournament venues are mapped with navigation links:
- **Riverside Poly #1**: Primary venue (18 matches)
- **Ramona HS**: Co-host venue (17 matches) 
- **Norco HS**: Pool play venue (2 matches)
- **Chino Hills HS**: Championship finals venue (2 matches)

##### Future Automation Option

For automated updates, the HTML file can be modified to fetch directly from Google Sheets:
```javascript
const CSV_URL = 'https://docs.google.com/spreadsheets/d/1FuCUomKqgfg8d83zYxld0B2mnTmcbefwyxKFEebMgiY/export?format=csv&gid=0';
// Replace embedded csvData with fetch(CSV_URL)
```

**Note**: Current embedded approach works reliably across all environments and provides fallback if Google Sheets is unavailable.

### 16U Boys Junior Olympics Qualification Tournament (June 13-15, 2025)

- Reference of the official google drice sheet as datasource: https://docs.google.com/spreadsheets/d/1C_yU7MyVHzL1_rubWOHVqAeDto9BApOgw7MarJzQoLk/edit?gid=0#gid=0 "16U BOYS" sheet
- the specific sheet can be fetched directly in csv format here: https://docs.google.com/spreadsheets/d/1C_yU7MyVHzL1_rubWOHVqAeDto9BApOgw7MarJzQoLk/export?format=csv&gid=0#gid=0 - use this url to process the tournament official live data
- The data is public and updated regularly
- final positions mean seed places in Junior Olympics Championship class:
  - 1. position: 2. seed
  - 2. position: 9. seed
  - 3. position: 19. seed
  - 4. position: 30. seed

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

### Mobile-First Design Principles

**Live Results Pages Follow Mobile-First Architecture:**
- **Base styles optimized for mobile** (320px+ screens) with compact spacing
- **Progressive enhancement** for larger screens (768px+ and 1200px+)
- **Fixed-size match cards** - 120-140px height for consistent mobile layout
- **Single column grid** on mobile, multi-column on desktop
- **Compact UI elements** - reduced padding, smaller fonts, minimal spacing
- **Collapsible information** - secondary details hidden by default with toggle buttons

### Match Card Design Standards

**Fixed-Size Compact Cards for Mobile:**
- **Dimensions**: 120-140px height, full width on mobile
- **Padding**: 12px mobile, 16px desktop
- **Layout**: Consistent 3-section structure (header, teams, actions)
- **Typography**: `clamp()` responsive sizing throughout

**Match Details Layout Rules:**
```css
/* Wide screens (>360px): Team A    22 - 12    Team B */
.details-summary {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

/* Narrow screens (<360px): Stacked with centered score */
.details-summary {
    flex-direction: column;
    /* Team A (order: 1), 22 - 12 (order: 2), Team B (order: 3) */
}
```

**Information Hierarchy:**
1. **Always visible**: Team names, scores, match number, status badge
2. **Toggle "📋 Details"**: Time, venue, date, division, placement, game ID
3. **Toggle "📄 Raw"**: Raw Kahuna data for debugging

**Responsive Text Handling:**
- **Team names**: `text-overflow: ellipsis` with `white-space: nowrap`
- **Score display**: Highlighted with blue background on wide, centered on narrow
- **Meta items**: Small badges with icons, flex-wrap for overflow

## JavaScript Features

The script.js handles:
- **Dynamic video integration**: Automatically displays YouTube video links in brackets and match tables
- **Interactive match popups**: Click team names to see all their matches with video links
- **Tournament data loading**: Supports both external JSON files and embedded data
- **Live data streaming**: Real-time tournament results via CORS proxy systems
- **Team highlighting**: Automatic detection and highlighting of SD Shores teams
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

### Development Server

Use the included `serve.sh` script to run a lightweight development server:

```bash
# Local server (Python/PHP/Ruby/Node.js)
./serve.sh

# Docker container with nginx (requires Docker)
./serve.sh --docker

# Custom port
./serve.sh --port 3000

# Docker with custom port
./serve.sh --docker --port 80

# Help and options
./serve.sh --help
```

**Server Options:**
- **Local mode**: Automatically detects and uses Python 3, Python 2, PHP, Ruby, or Node.js
- **Docker mode**: Uses nginx:alpine container with volume mounting for live file changes
- **Custom ports**: Default 8000, configurable with `--port`
- **Network access**: Shows both localhost and network IP addresses

**IMPORTANT**: Always use `./serve.sh` when you need to run a development server for testing changes.

## File Naming Convention

Tournament files follow the pattern: `YYYYMMDD_tournament_description.html` (e.g., `20250607_KJVR_memorial_18U.html`)

**Live Results Pages**: Located in subdirectories under tournament-specific folders (e.g., `futures/live_results.html`)

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

## Live Data Integration Best Practices

### Kahuna Events Data Access
- **Always use CORS proxy** - Direct access blocked by browser security
- **Implement fallback proxies** - Multiple services for reliability  
- **Parse structured format** - Double-space field separation
- **Handle team name prefixes** - Remove bracketed prefixes (e.g., "W#38-")
- **Filter by date for HOT labels** - Today's matches only
- **Clean team detection** - Use word boundaries to avoid false positives

### Real-time Features Implementation
- **Auto-refresh intervals** - 3-5 minutes for live tournaments
- **Status badge filtering** - Remove redundant "RESULT" tags
- **Team highlighting patterns** - Specific SD Shores variants only
- **Card-based layout** - Fancy animated cards for better UX
- **Navigation integration** - Floating back buttons and live access links

### Data Parsing Standards
```javascript
// Enhanced team name extraction (removes prefixes and tournament level suffixes)
let teamName = team1Match[1];
// Remove various prefixes: W#38-, E4(3rdB)-, D4(4thB)-, F3(3rdA)-, etc.
teamName = teamName.replace(/^[A-Z]+#?\d*[\(\)A-Za-z0-9]*-/, '');
// Remove tournament level suffixes: au=Gold, ag=Silver, pt=Platinum, sl=Silver, br=Bronze, gd=Gold
teamName = teamName.replace(/\s+(au|ag|pt|sl|br|gd)$/, '');
result.team1.name = teamName.trim();

// Proper date filtering for HOT labels  
const todayString = today.toLocaleDateString('en-US', { 
    day: 'numeric', 
    month: 'short' 
}).replace(' ', '-'); // "25-Jun"

// Specific team detection patterns (word boundaries prevent false positives)
const SHORES_PATTERNS = [
    /\bsd shores\b/i,           // Exact match
    /\bshores black\b/i,        // Team variants
    /\bshores gold\b/i,
    /\bshores white\b/i,
    /\bshores blue\b/i,
    /\bshores red\b/i
];
```

### Team Name Parsing Issues and Solutions

**Common Issues in Kahuna Data:**
- Complex prefixes: `E4(3rdB)-TEAM NAME au` → should become `TEAM NAME`
- Tournament levels: `au` (Gold), `ag` (Silver), `pt` (Platinum), `sl` (Silver), `br` (Bronze), `gd` (Gold)
- Bracket positions: `W#38-`, `D4(4thB)-`, `F3(3rdA)-`, `H6(4thD)-`

**Parsing Examples:**
- `E4(3rdB)-NBWP WHITE au=13` → `NBWP WHITE`
- `D4(4thB)-VIPER PIGEONS au=11` → `VIPER PIGEONS`  
- `W#38-SANTA CRUZ=17` → `SANTA CRUZ`
- `F4(3rdB)-LA JOLLA UNITED GOLD au=1` → `LA JOLLA UNITED GOLD`

### Live Results UI Implementation Standards

**Card Structure Template:**
```html
<div class="match-card">
    <div class="match-header">
        <span class="match-number">#1</span>
        <span class="match-status">HOT! 🔥</span>
    </div>
    <div class="match-teams">
        <div class="team-info">
            <div class="team-name">TEAM A</div>
            <div class="team-score">22</div>
        </div>
        <div class="vs-divider">VS</div>
        <div class="team-info">
            <div class="team-name">TEAM B</div>
            <div class="team-score">12</div>
        </div>
    </div>
    <div class="match-actions">
        <span class="show-details">📋 Details</span>
        <span class="show-raw">📄 Raw</span>
    </div>
    <div class="match-details"> <!-- Hidden by default -->
        <div class="details-summary">
            <!-- Responsive team vs team layout -->
        </div>
        <div class="match-meta">
            <!-- Time, venue, division badges -->
        </div>
    </div>
</div>
```

**Toggle Functions Implementation:**
```javascript
function toggleMatchDetails(element) {
    const matchDetails = element.parentElement.nextElementSibling;
    const isVisible = matchDetails.style.display === 'block';
    matchDetails.style.display = isVisible ? 'none' : 'block';
    element.innerHTML = isVisible ? '📋 Details' : '📋 Hide';
}
```

**Design Rules for Future Live Results Pages:**
1. **Always mobile-first** - design for 320px+ screens first
2. **Fixed card heights** - prevent layout jumps and scrolling issues  
3. **Collapsible secondary info** - keep cards compact but informative
4. **Responsive score layout** - horizontal on wide, stacked on narrow
5. **Icon-based actions** - save space with 📋 📄 instead of text
6. **Text truncation** - never let team names break card layout
7. **Progressive enhancement** - improve spacing/layout for larger screens

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.
