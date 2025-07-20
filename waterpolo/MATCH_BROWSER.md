# MATCH_BROWSER.md

## System Overview

**Match Browser** is the live results system that provides real-time tournament data streaming and interactive match browsing. The system features advanced filtering, mobile-first design, and comprehensive testing infrastructure.

**Primary Implementation**: `futures/live_results.html` with supporting CSS and JavaScript files.

## Architecture

### File Structure
```
futures/
├── live_results.html          # Main live results page
├── live_results.css           # Mobile-first responsive styles
├── live_results.js            # Core JavaScript functionality
└── tests/
    ├── test_runner.html       # Interactive test runner
    ├── live_results.test.js   # Main test suite (80+ tests)
    ├── test_data/
    │   ├── sample_matches.js  # Real tournament data samples
    │   └── edge_cases.js      # Edge cases and boundary conditions
    └── README.md              # Testing documentation
```

### Core Components
- **Real-time Data Streaming**: CORS proxy system for Kahuna Events feed
- **Mobile-First Design**: Responsive cards optimized for mobile screens
- **Advanced Filtering**: 7-category filter system with search functionality
- **Interactive Features**: Clickable teams, search highlighting, collapsible details
- **Future Match Tracking**: Displays upcoming scheduled games for tournament advancement
- **Test-Driven Development**: Comprehensive test suite with 90+ test cases

## Test-Driven Development (TDD) - MANDATORY WORKFLOW

### 🚨 CRITICAL TDD Enforcement Rules

**BEFORE making ANY changes to `futures/live_results.js`:**
1. ✅ **Run existing tests** - Ensure baseline functionality
2. ✅ **Understand test coverage** - Know what functions are tested
3. ✅ **Write tests FIRST** - For new features or bug fixes
4. ✅ **Validate all tests pass** - 100% pass rate required

**AFTER making ANY changes:**
1. ✅ **Run complete test suite** - All 90+ tests must pass
2. ✅ **Check performance benchmarks** - No speed regressions
3. ✅ **Update tests if needed** - Reflect behavior changes
4. ✅ **Document test updates** - If new tests added

### Running Tests

**ALWAYS use the interactive test runner:**
```bash
# Option 1: Direct browser access
open futures/tests/test_runner.html

# Option 2: With development server
./serve.sh
# Navigate to: http://localhost:8000/futures/tests/test_runner.html
```

### Test Coverage - 80+ Test Cases

#### Critical Functions (Must Pass)
- **parseMatchLine()** - 25+ tests (team prefix cleaning, penalty scores)
- **deduplicateMatches()** - 15+ tests (duplicate removal, performance)
- **createMatchSignature()** - 10+ tests (game ID extraction, fallbacks)
- **detectShoresTeam()** - 8+ tests (pattern matching, false positives)
- **filterSuperFinalsMatches()** - 5+ tests (date filtering)
- **applyActiveFilters()** - 10+ tests (complex filter combinations)

#### Status & Time Functions
- **detectMatchStatus()** - 8+ tests (HOT!, FINAL, UPCOMING badges)
- **parseKahunaDateTime()** - 12+ tests (midnight/noon, all months)
- **isMatchFromLastHour()** - 5+ tests (recent match detection)

#### UI & Search Functions
- **highlightSearchText()** - 6+ tests (search highlighting)
- **escapeHtml()** - 5+ tests (XSS prevention)
- **applyCustomTeamFilter()** - 4+ tests (team search)

### Performance Requirements

**All functions must meet these speed targets:**
- **parseMatchLine()**: < 1ms average execution
- **deduplicateMatches()**: < 10ms for 500 items
- **detectShoresTeam()**: < 0.1ms average execution
- **Full data pipeline**: < 500ms for 2000 matches

### Test Failure Protocol

**If ANY test fails:**
1. **🛑 STOP all development** - Do not proceed with changes
2. **Analyze failure** - Understand what broke and why
3. **Fix the issue** - Either fix code or update test if behavior intentionally changed
4. **Re-run tests** - Ensure 100% pass rate restored
5. **Only then continue** - No failing tests allowed in production

### Zero Tolerance Policy

**No exceptions to TDD workflow:**
- ❌ No commits with failing tests
- ❌ No new functions without tests
- ❌ No performance regressions
- ❌ No bug fixes without regression tests
- ❌ No deployment with test failures

## Mobile-First Design Principles

### Core Design Philosophy
- **Base styles optimized for mobile** (320px+ screens) with compact spacing
- **Progressive enhancement** for larger screens (768px+ and 1200px+)
- **Fixed-size match cards** - 120-140px height for consistent mobile layout
- **Single column grid** on mobile, multi-column on desktop
- **Compact UI elements** - reduced padding, smaller fonts, minimal spacing
- **Collapsible information** - secondary details hidden by default with toggle buttons

### Match Card Design Standards

#### Fixed-Size Compact Cards
- **Dimensions**: 120-140px height, full width on mobile
- **Padding**: 12px mobile, 16px desktop
- **Layout**: Consistent 3-section structure (header, teams, actions)
- **Typography**: `clamp()` responsive sizing throughout

#### Match Details Layout Rules
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

#### Information Hierarchy
1. **Always visible**: Team names, scores, match number, status badge
2. **Toggle "📋 Details"**: Time, venue, date, division, placement, game ID
3. **Toggle "📄 Raw"**: Raw Kahuna data for debugging

#### Responsive Text Handling
- **Team names**: `text-overflow: ellipsis` with `white-space: nowrap`
- **Score display**: Highlighted with blue background on wide, centered on narrow
- **Meta items**: Small badges with icons, flex-wrap for overflow

## Advanced Filter System

### Filter Categories (7 total filters)
1. **Age Group Filters** (OR logic within category):
   - `🏆 14U` - Filters for 14U_BOYS, 14U BOYS, 14U_GIRLS, 14U GIRLS
   - `🏆 16U` - Filters for 16U_BOYS, 16U BOYS, 16U_GIRLS, 16U GIRLS (default: checked)
   - `🏆 18U` - Filters for 18U_BOYS, 18U BOYS, 18U_GIRLS, 18U GIRLS

2. **Gender Filters** (OR logic within category):
   - `👦 BOYS` - Filters for _BOYS, BOYS (default: checked)
   - `👧 GIRLS` - Filters for _GIRLS, GIRLS

3. **Team Filters**:
   - `🌊 Shores` - Filters for SD Shores team matches using pattern matching
   - `🔍 Custom Search` - Free text search for any team name (partial matching, debounced)

### Filter Logic Implementation
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

// Custom team search: partial team name matching
const customSearch = document.getElementById('customTeamSearch')?.value?.trim() || '';
if (customSearch) {
    filteredLines = filteredLines.filter(line => 
        applyCustomTeamFilter(line, customSearch)
    );
}
```

### Filter Behavior
- **Between categories**: AND logic (Age AND Gender AND Teams)
- **Within categories**: OR logic (14U OR 16U OR 18U, BOYS OR GIRLS)
- **Default behavior**: 16U + BOYS = shows only 16U boys matches
- **Sequential filtering**: Each category filters results from previous category

## Future Match Integration

### Parsing System
The system parses future match data from Kahuna Events advancement updates with support for complex formats:

#### Supported Data Formats
- **Single matches**: `TEAM is 1 in bracket 47 is DARK in game 16B-064 on 20-Jul at 7:00 AM at VENUE`
- **Multiple matches**: `TEAM is 1 in bracket 47 is WHITE in game 16B-081 on 20-Jul at 11:10 AM at VENUE; and WHITE in game 16B-097 on 20-Jul at 2:30 PM in VENUE`
- **Venue variations**: Supports both "at VENUE" and "in VENUE" formats
- **Complex team names**: Handles full names like "SAN DIEGO SHORES BLACK"

#### Processing Flow
1. **Data filtering**: Identifies future match lines using pattern matching
2. **Multi-match splitting**: Parses "; and" separators for multiple games per line
3. **Team association**: Links future matches to completed match participants
4. **Data structure**: Builds efficient lookup table by team name

### Display Methods

#### 1. Calendar Icons
- **Visual indicators**: 📅 icons appear next to team names with future matches
- **Debug logging**: Enhanced logging to troubleshoot display issues
- **Click functionality**: Opens detailed popup modal with all future match information

#### 2. Details Section Integration
- **Seamless integration**: Future matches appear in existing match card details
- **No extra clicks**: Information available when users expand match details
- **Comprehensive display**: Shows all upcoming games for both teams in a match

#### Details Display Format
```
🔮 Upcoming Matches:
LOWPO:
  DARK in game 16B-064    20-Jul at 7:00 AM    SADDLEBACK COLLEGE 1
  WHITE in game 16B-096   20-Jul at 1:40 PM    SADDLEBACK COLLEGE 1

SAN DIEGO SHORES BLACK:
  WHITE in game 16B-081   20-Jul at 11:10 AM   WOOLLETT NEAR RIGHT
  WHITE in game 16B-097   20-Jul at 2:30 PM    WOOLLETT NEAR RIGHT
```

### Technical Implementation

#### Key Functions
- **`parseFutureMatchLine()`**: Enhanced to handle single and multiple matches per line
- **`buildFutureMatchesData()`**: Processes arrays and flattens into team lookup structure
- **`getFutureMatchesForDetails()`**: Formats future matches for details section display
- **`teamHasFutureMatches()`**: Efficient lookup for calendar icon display

#### Performance Features
- **Backward compatibility**: Single matches work seamlessly alongside multiple matches
- **Efficient parsing**: Optimized regex patterns with proper error handling
- **Memory management**: Future matches stored in global lookup for fast access
- **No filter interference**: Future matches display regardless of active result filters

### Testing Coverage
- **10+ new tests** added for future match parsing functionality
- **Multiple match scenarios** validated with real tournament data
- **Edge case handling** for malformed input and missing fields
- **Integration testing** for complete workflow validation
- **Real data validation** with actual Kahuna Events advancement feeds

## Interactive Features

### Enhanced Search System
- **Clickable team names**: Click any team name in match cards to automatically populate search filter
- **Clear button**: "×" button inside search input to instantly clear search text
- **Debounced search**: 300ms delay prevents excessive filtering while typing
- **Hover indication**: Team names show pointer cursor and subtle opacity change (0.7) on hover
- **Case-insensitive matching**: Search works regardless of letter case
- **Partial matching**: Search for any part of team name (e.g., "shores" matches "SD SHORES BLACK")
- **Search highlighting**: Matched text highlighted with yellow background in real-time
- **Winner indication**: Winning team names are underlined when match has completed scores

### Search Implementation
```javascript
// Team name highlighting with search term
function highlightSearchText(teamName, searchTerm) {
    if (!searchTerm.trim()) return teamName;
    const regex = new RegExp(`(${escapeRegex(searchTerm)})`, 'gi');
    return teamName.replace(regex, '<span class="highlight-match">$1</span>');
}

// Clear search functionality
function clearSearch() {
    const searchInput = document.getElementById('customTeamSearch');
    if (searchInput) {
        searchInput.value = '';
        applyFilters(); // Clear filters immediately
        updateClearButtonVisibility(); // Hide clear button
    }
}

// Team selection and search filtering
function selectTeam(teamName) {
    const searchInput = document.getElementById('customTeamSearch');
    if (searchInput) {
        searchInput.value = teamName;
        applyFilters(); // Immediate filtering (no debounce)
        updateClearButtonVisibility(); // Show clear button
    }
}
```

## Live Results UI Implementation

### Card Structure Template
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

### Toggle Functions Implementation
```javascript
function toggleMatchDetails(element) {
    const matchDetails = element.parentElement.nextElementSibling;
    const isVisible = matchDetails.style.display === 'block';
    matchDetails.style.display = isVisible ? 'none' : 'block';
    element.innerHTML = isVisible ? '📋 Details' : '📋 Hide';
}
```

## CSS Styling Standards

### Search Wrapper Components
```css
/* Search wrapper with clear button */
.search-wrapper {
    position: relative;
    display: inline-block;
    width: 100%;
    max-width: 200px;
}

/* Clear button styling */
.clear-search-btn {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(255, 255, 255, 0.8);
    border: none;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    cursor: pointer;
    display: none; /* Hidden by default */
    transition: all 0.2s ease;
}

/* Winner team underline */
.team-name.winner {
    text-decoration: underline;
    text-decoration-thickness: 2px;
}

/* Search text highlighting */
.highlight-match {
    background-color: rgba(255, 235, 59, 0.6);
    font-weight: bold;
    border-radius: 2px;
    padding: 1px 2px;
    color: #2c3e50;
}

/* Shores team highlight adjustment */
.team-name.shores-team .highlight-match {
    color: #ff6b35; /* Maintain Shores team color */
}
```

## Design Rules for Future Implementation

### Core Principles
1. **Always mobile-first** - design for 320px+ screens first
2. **Fixed card heights** - prevent layout jumps and scrolling issues  
3. **Collapsible secondary info** - keep cards compact but informative
4. **Responsive score layout** - horizontal on wide, stacked on narrow
5. **Icon-based actions** - save space with 📋 📄 instead of text
6. **Text truncation** - never let team names break card layout
7. **Progressive enhancement** - improve spacing/layout for larger screens

### Testing Requirements
- **Test all new features** - Write tests before implementing
- **Performance benchmarks** - Ensure no speed regressions
- **Cross-browser compatibility** - Test on mobile and desktop
- **Edge case handling** - Account for malformed data

## Integration with Tournament Systems

### Tournament Integration
- **Futures Tournament**: Primary implementation with Kahuna Events feed
- **Other Tournaments**: Can be adapted for different data sources
- **Navigation**: Floating back buttons and live access links from tournament pages

### Data Source Compatibility
- **Kahuna Events**: Primary live data source
- **Google Sheets**: Can be adapted for CSV-based tournaments
- **Static Data**: Fallback for completed tournaments

## File References

### Key Files
- **Main implementation**: `futures/live_results.html`
- **Styles**: `futures/live_results.css`
- **JavaScript**: `futures/live_results.js`
- **Test suite**: `futures/tests/test_runner.html`
- **Test data**: `futures/tests/test_data/`

### Navigation Integration
- **Tournament pages**: Link to Match Browser via floating buttons
- **Index page**: Direct access to live results
- **Back navigation**: Floating back buttons to tournament pages

## Quality Assurance

### Test Philosophy
**Tests are not overhead - they are insurance!**
- **Behavior specification** - Tests document expected functionality
- **Regression prevention** - Changes can't break existing features
- **Refactoring confidence** - Safe to improve code structure
- **Documentation** - Tests show how functions should work
- **Quality assurance** - Comprehensive coverage prevents bugs

### Continuous Improvement
- **Regular test updates** - Keep tests current with feature changes
- **Performance monitoring** - Track execution times and optimize
- **User experience** - Gather feedback and improve usability
- **Cross-platform testing** - Ensure compatibility across devices

**This TDD foundation ensures the live tournament results remain reliable for water polo fans, coaches, and players who depend on accurate real-time data! 🏆🧪**