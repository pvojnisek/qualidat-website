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
