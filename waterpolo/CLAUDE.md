# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a static website (microsite under /waterpolo/) for water polo tournaments, specifically for the San Diego Shores 16U team's Summer Campaign 2025. The site showcases tournament schedules, results, and provides detailed information about water polo events. In the key matches sections, focus on San Diego Shores teams.

## Documentation Structure

### Core Documentation
- **CLAUDE.md** (this file) - Core project architecture and development workflows
- **MATCH_BROWSER.md** - Live results system with TDD workflow and testing
- **POOLS.md** - Venue management and pool location templates

### Tournament-Specific Documentation
- **TOURNAMENT_FUTURES_SUPER_FINALS.md** - Kahuna Events live data tournament
- **TOURNAMENT_US_CLUB_CHAMPIONSHIP.md** - Google Sheets CSV tournament
- **TOURNAMENT_JO_QUALIFICATION.md** - Google Sheets bracket tournament
- **TOURNAMENT_JUNIOR_OLYMPICS_LIVE.md** -  Junior Olympics tournament

### Usage Guidelines
- **Individual tournament work**: Refer to specific TOURNAMENT_*.md files
- **Live results development**: Use MATCH_BROWSER.md for TDD workflow
- **Venue management**: Use POOLS.md for adding new pool locations
- **Core architecture changes**: Use this file for general project guidance

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

## Tournament Information

### Tournament-Specific Documentation
Detailed tournament information has been moved to individual files:

- **TOURNAMENT_FUTURES_SUPER_FINALS.md**: Kahuna Events live data, real-time streaming, advanced filters
- **TOURNAMENT_US_CLUB_CHAMPIONSHIP.md**: Google Sheets CSV data, match updates, venue coverage
- **TOURNAMENT_JO_QUALIFICATION.md**: Bracket structure, placements, seeding information

### Common Tournament Elements
- **Venues**: BBMAC (Brian Bent Memorial Aquatics Complex), Granite Hills High School
- **Focus**: San Diego Shores teams highlighted in all tournaments
- **Data Integration**: Multiple data sources (Kahuna Events, Google Sheets, embedded JSON)
- **Navigation**: Clickable venue names link to pools.html with anchor navigation

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

**Responsive Design Standards:**
- **Base styles optimized for mobile** (320px+ screens) with compact spacing
- **Progressive enhancement** for larger screens (768px+ and 1200px+)
- **Consistent grid systems** for matches, standings, and statistics
- **Responsive typography** using `clamp()` for fluid text sizing
- **Touch-friendly interactions** with adequate tap targets

### Design System

**Color Palette:**
- **Primary Blues**: #0077be, #00a8cc, #4fc3f7
- **Backgrounds**: Linear gradients with water polo theme
- **Accent Colors**: Water polo team colors and highlighting

**Typography:**
- **Font Stack**: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif
- **Responsive Sizing**: `clamp()` functions for fluid scaling
- **Hierarchy**: Clear distinction between headings, body text, and metadata

## JavaScript Features

The script.js handles:
- **Dynamic video integration**: Automatically displays YouTube video links in brackets and match tables
- **Interactive match popups**: Click team names to see all their matches with video links
- **Tournament data loading**: Supports both external JSON files and embedded data
- **Live data streaming**: Real-time tournament results via CORS proxy systems
- **Team highlighting**: Automatic detection and highlighting of SD Shores teams
- **Future match integration**: Displays upcoming matches for teams in match card details
- **Calendar icons**: Visual indicators for teams with scheduled future games  
- **Match advancement tracking**: Parses tournament progression and next game scheduling
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

## Pool Locations

### Venue Management
Pool and venue information is managed through a dedicated system. For detailed information on:

- **Adding new venues**: See POOLS.md for comprehensive templates and procedures
- **Existing venues**: BBMAC, Granite Hills High School, and other tournament locations
- **Navigation system**: Anchor links and clickable venue names in tournament pages

### Current Venues
- **BBMAC**: Brian Bent Memorial Aquatics Complex (Coronado, CA)
- **Granite Hills High School**: El Cajon, CA
- **Additional venues**: See POOLS.md for complete listing and details

### Venue Integration
Venue names in tournament pages automatically link to detailed pool information via the venue mapping system in `script.js`.

## Live Data Integration

### Data Sources
The project integrates with multiple data sources:

- **Kahuna Events**: Real-time live data feeds (see TOURNAMENT_FUTURES_SUPER_FINALS.md)
- **Google Sheets**: CSV export functionality (see TOURNAMENT_US_CLUB_CHAMPIONSHIP.md and TOURNAMENT_JO_QUALIFICATION.md)
- **Embedded JSON**: Fallback data for offline functionality

### Match Browser System
The Match Browser provides real-time tournament data streaming with:

- **Advanced filtering**: 7-category filter system
- **Mobile-first design**: Responsive cards and interactions
- **Test-driven development**: Comprehensive test suite (80+ tests)
- **Interactive features**: Search, highlighting, and team selection

**For detailed information**: See MATCH_BROWSER.md for complete implementation guide and TDD workflow.

### Integration Best Practices
- **CORS proxy usage**: Required for external data access
- **Fallback systems**: Multiple data sources for reliability
- **Performance optimization**: Efficient parsing and rendering
- **Error handling**: Graceful degradation for data issues

## Future Match System

### Overview
The Junior Olympics live results system now includes **future match tracking** that displays upcoming scheduled games for teams based on tournament advancement data from Kahuna Events feeds. The system features **automatic game grouping** and follows official water polo positioning conventions.

### Water Polo Positioning Convention
**CRITICAL RULE**: The system follows official water polo standards:
- **WHITE team is ALWAYS positioned on the LEFT (team1)**
- **DARK team is ALWAYS positioned on the RIGHT (team2)**
- This positioning is maintained regardless of the order data appears in feeds
- Ensures consistency with official water polo scorekeeping and broadcasting standards

### Future Match Grouping
**NEW FEATURE**: Teams scheduled for the same game are automatically grouped into single match cards:
- **Before**: Two separate cards for "SHORES vs TBD" and "COMMERCE vs TBD"
- **After**: One card showing "SHORES vs COMMERCE" for the same game
- **Benefits**: More accurate representation, cleaner UI, follows water polo conventions

### Data Processing
- **Multi-match parsing**: Handles lines with multiple future games using "; and" separator format
- **Game ID grouping**: Consolidates teams by game ID (e.g., "16B-081") into single match objects
- **Position assignment**: Enforces WHITE left/DARK right positioning regardless of data order
- **Real-time updates**: Future matches update automatically with live tournament data feeds
- **Team association**: Links future games to current match participants for easy access
- **Complex parsing**: Supports descriptive advancement format vs. standard match results

### User Interface Features

#### Dual Display Approach
1. **Calendar Icons**: 📅 icons appear next to teams with upcoming matches (includes debug logging)
2. **Details Integration**: Future matches display in expanded match card details section

#### User Experience
When users click "📋 Details" on any match card, they see:
```
📋 Details (expanded):
⏰ 4:10 PM  📍 PORTOLA HS 1  📅 19-Jul  🏆 16U_BOYS_CHAMPIONSHIP

🔮 Upcoming Matches:
LOWPO:
  DARK in game 16B-064    20-Jul at 7:00 AM    SADDLEBACK COLLEGE 1
  WHITE in game 16B-096   20-Jul at 1:40 PM    SADDLEBACK COLLEGE 1

SAN FRANCISCO:
  DARK in game 16B-059    19-Jul at 7:30 PM    PORTOLA HS 1
```

### Data Format Support

#### Kahuna Events Future Match Format
- **Single match**: `TEAM is 1 in bracket 47 is DARK in game 16B-064 on 20-Jul at 7:00 AM at VENUE`
- **Multiple matches**: `TEAM is 1 in bracket 47 is WHITE in game 16B-081 on 20-Jul at 11:10 AM at VENUE; and WHITE in game 16B-097 on 20-Jul at 2:30 PM in VENUE`

#### Technical Capabilities
- **Multiple venues**: Supports various venue formats ("at VENUE" vs "in VENUE")  
- **Complex team names**: Handles full team names like "SAN DIEGO SHORES BLACK"
- **Team color assignments**: Displays DARK/WHITE color designations for each game
- **Bracket information**: Shows bracket numbers and team positions
- **Complete scheduling**: Includes dates, times, venues, and game IDs

### Implementation Features
- **Backward compatibility**: Single matches work seamlessly alongside multiple matches
- **Performance optimized**: Efficient parsing and lookup with minimal performance impact
- **Error handling**: Graceful degradation for malformed future match data
- **Mobile responsive**: Future match displays work on all screen sizes
- **No filter interference**: Future matches shown regardless of active result filters

### Testing Coverage
- **10+ comprehensive tests** covering all future match scenarios
- **Real data validation** with actual tournament advancement feeds
- **Multiple match parsing** including complex team name and venue variations
- **Edge case handling** for malformed input and missing data

# Documentation Cross-References

## Related Documentation Files
- **TOURNAMENT_FUTURES_SUPER_FINALS.md** - Kahuna Events data, live results system
- **TOURNAMENT_US_CLUB_CHAMPIONSHIP.md** - Google Sheets CSV procedures
- **TOURNAMENT_JO_QUALIFICATION.md** - Bracket structure and placements
- **MATCH_BROWSER.md** - Live results system and TDD workflow
- **POOLS.md** - Venue management templates

## File Organization
This restructured documentation follows the `TOURNAMENT_[IDENTIFIER].md` naming convention for easy identification and focused development work.

# Important Instruction Reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.
