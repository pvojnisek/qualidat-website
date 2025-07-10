# TOURNAMENT_JO_QUALIFICATION.md

## Tournament Overview

**16U Boys Junior Olympics Qualification Tournament (June 13-15, 2025)**

Elite qualification tournament determining seeding for the Junior Olympics Championship. Features bracket-style competition with re-bracket system for final placement determination.

**Tournament Status**: ✅ COMPLETED - Final Results Available  
**🌊 SD Shores Result**: 🥇 **CHAMPIONSHIP WINNERS** - Shores Black took 1st place!

## Data Sources

### Official Google Sheet
- **Primary Data Source**: https://docs.google.com/spreadsheets/d/1C_yU7MyVHzL1_rubWOHVqAeDto9BApOgw7MarJzQoLk/edit?gid=0#gid=0 ("16U BOYS" sheet)
- **CSV Export URL**: https://docs.google.com/spreadsheets/d/1C_yU7MyVHzL1_rubWOHVqAeDto9BApOgw7MarJzQoLk/export?format=csv&gid=0
- **Update Frequency**: Live updates during tournament
- **Data Format**: CSV with game numbers, team names, scores, and notes

## Tournament Structure

### Initial Bracket Groups
**4 groups: A, B, C, D**

- **Group A**: Del Mar Blue, Del Mar White, Southern, Southern B
- **Group B**: LJ United A, Poway, LJ United B, NADO
- **Group C**: Shores Black, Shores Gold, NSD Stars, Odin B
- **Group D**: CBAD Black, Odin A, Shores White, CBAD Silver

### Re-Bracket System
**4 re-bracket groups: AA, BB, CC, DD**

- **AA Group** (1st place teams): 1st A, 1st B, 1st C, 1st D
- **BB Group** (2nd place teams): 2nd A, 2nd B, 2nd C, 2nd D
- **CC Group** (3rd place teams): 3rd A, 3rd B, 3rd C, 3rd D
- **DD Group** (4th place teams): 4th A, 4th B, 4th C, 4th D

### Final Placement Logic
- **Championship (1-4 places)**: Winner of AA group becomes overall champion
- **Classic (5-8 places)**: Winner of BB group places 5th overall
- **Invitational (9-12 places)**: Winner of CC group places 9th overall
- **DNQ (13-16 places)**: Winner of DD group places 13th overall

## Seeding for Junior Olympics Championship

### Official Seeding Formula
Final tournament positions translate to Junior Olympics seeds:
- **1st position**: 2nd seed in Junior Olympics
- **2nd position**: 9th seed in Junior Olympics
- **3rd position**: 19th seed in Junior Olympics
- **4th position**: 30th seed in Junior Olympics

### SD Shores Achievement
🥇 **Shores Black - 1st Place**: Earned **2nd seed** in Junior Olympics Championship

## Data Update Procedures

### Fetching Tournament Results
Use curl command to fetch latest data from Google Sheets:
```bash
curl -L "https://docs.google.com/spreadsheets/d/1C_yU7MyVHzL1_rubWOHVqAeDto9BApOgw7MarJzQoLk/export?format=csv&gid=0" 2>/dev/null
```

### CSV Data Format
- **Column structure**: DATE, LOCATION, TIME, [Game #], Whites Caps, S, VS, Dark Caps, S, NOTES
- **Completed matches**: Have numeric scores in both S columns
- **Game numbers**: Format "Game # X" where X is the game number
- **Team identification**: Parse from "Whites Caps" (team1) and "Dark Caps" (team2) columns

### Identifying Completed Matches
- Look for rows with game numbers (e.g., "Game # 4", "Game # 6")
- Check for scores in columns S (score1) and S (score2)
- If both have numeric values, the match is completed
- Update both `jos_quali_matches.json` and `20250613_16U_JOs_Quals.html` files

### Required Updates
When updating match data:
- **`score1` and `score2`**: Add numeric values from CSV
- **`status`**: Change from "SCHEDULED" to "COMPLETED"
- **JSON consistency**: Ensure both JSON and HTML data match

## Final Tournament Placements

### Official Placement System
The tournament results table displays official final placements from the Google Sheet's "Final Placement" section.

### Current Official Placements
```
Final Placement:
1. SHORES BLACK - Championship
2. LJ UNITED - A - Championship
3. DEL MAR BLUE - Championship
4. [To be announced] - Championship
5. [To be announced] - Classic
...
```

### Updating Final Placements

#### Rules for Updates
1. **Check Google Sheet**: Only update when positions appear in official "Final Placement" section
2. **No speculation**: Do not guess or calculate - wait for official announcement
3. **HTML table updates**: Update in `20250613_16U_JOs_Quals.html` "Final Tournament Results" section
4. **Replace pending entries**: Change "To be announced" to actual team names when confirmed

#### HTML Update Template
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

### Team Emoji Conventions
- **🌊 Shores**: For all Shores teams (Black, Gold, White)
- **⚪ LJ United**: For La Jolla United teams
- **🔵 Del Mar**: For Del Mar teams (Blue, White)
- **⚫ CBAD**: For Carlsbad teams (Black, Silver)
- **🔴 Odin**: For Odin teams (A, B)

### Styling Updates
- **Remove gray color**: Remove `color: #888;` when updating from pending
- **Remove italic**: Remove `font-style: italic;` when updating from pending
- **Maintain hierarchy**: Keep qualification levels (Championship 1-4, Classic 5-8, Invitational 9-11, DNQ 12-16)

## Tournament Venues

### Official Locations
- **BBMAC**: Brian Bent Memorial Aquatics Complex (location: MRVC+33 Coronado, California)
- **Granite Hills High School**: (location: Q3XP+86 El Cajon, California)

### Venue Navigation
- Direct links to `pools.html` with venue-specific anchors
- **BBMAC**: `pools.html#bbmac`
- **Granite Hills**: `pools.html#granite-hills`

## Webpage Section Structure

### Tournament Page Organization (in order)
1. **Tournament information**: Dates, venues, overview
2. **Bracket**: Initial group standings and matches
3. **Bracket matches**: Detailed match results (collapsible)
4. **Re-bracket**: Re-bracket group formations
5. **Re-bracket matches**: Re-bracket match results
6. **Championship matches**: Final placement matches
7. **Statistics**: Tournament statistics (matches, goals, etc.)
8. **Format summary**: Tournament format explanation and fun facts
9. **Data source**: Attribution and data source information

### Interactive Features
- **Collapsible sections**: Tournament details can be expanded/collapsed
- **Video integration**: YouTube video links for recorded matches
- **Team popups**: Click team names to see match history
- **Venue links**: Clickable venue names linking to pool information

## Data File Management

### Key Files
- **Tournament page**: `20250613_16U_JOs_Quals.html`
- **JSON data**: `jos_quali_matches.json`
- **Venue information**: `pools.html`
- **Styling**: `style.css`
- **JavaScript**: `script.js`

### Data Consistency
- **Dual format**: Maintain both JSON and HTML embedded data
- **Synchronization**: Ensure both data sources match exactly
- **Fallback system**: HTML embedded data serves as backup for JSON

## Tournament Achievement

### Historic Result
🥇 **Shores Black - CHAMPIONSHIP WINNERS**
- **Final Position**: 1st place overall
- **Junior Olympics Seed**: 2nd seed (highest possible)
- **Tournament Impact**: Dominant performance throughout bracket and re-bracket play
- **Team Achievement**: First championship title for SD Shores in this elite tournament

### Qualification Impact
- **Championship Division**: Earned spot in highest competitive level
- **Elite Seeding**: 2nd seed provides favorable Junior Olympics bracket position
- **Regional Recognition**: Establishes SD Shores as premier Southern California program

## File References

### Navigation Links
- **Tournament Results**: Complete results embedded in main tournament page
- **Venue Information**: Clickable links to detailed venue pages
- **Team Match History**: Modal popups with individual team records
- **Video Content**: YouTube integration for recorded matches