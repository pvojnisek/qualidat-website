# TOURNAMENT_US_CLUB_CHAMPIONSHIP.md

## Tournament Overview

**16U Boys US Club Championship (June 20-22, 2025)**

Elite 16U Boys water polo championship featuring the top club teams from across the United States. Tournament utilizes Google Sheets for live data management with CSV export functionality.

**Tournament Status**: ✅ COMPLETED - Final Results Available

## Data Sources

### Official Google Sheet
- **Primary Data Source**: https://docs.google.com/spreadsheets/d/1FuCUomKqgfg8d83zYxld0B2mnTmcbefwyxKFEebMgiY/edit?gid=0#gid=0
- **CSV Export URL**: https://docs.google.com/spreadsheets/d/1FuCUomKqgfg8d83zYxld0B2mnTmcbefwyxKFEebMgiY/export?format=csv&gid=0
- **Update Frequency**: Live updates during tournament
- **Data Format**: CSV with structured columns for matches, scores, and venues

## Updating Tournament Results

### Method 1: Download and Update CSV Data (Recommended)

#### Step 1: Download Latest CSV Data
```bash
curl -L "https://docs.google.com/spreadsheets/d/1FuCUomKqgfg8d83zYxld0B2mnTmcbefwyxKFEebMgiY/export?format=csv&gid=0" 2>/dev/null
```

#### Step 2: Clean CSV Data
Extract only match rows and remove irrelevant data:
```bash
curl -L "https://docs.google.com/spreadsheets/d/1FuCUomKqgfg8d83zYxld0B2mnTmcbefwyxKFEebMgiY/export?format=csv&gid=0" 2>/dev/null | grep -E "^[0-9]+/[0-9]+/[0-9]+" | grep -v "18 BOYS" | awk -F',' '{print $1","$2","$3","$4","$5","$6","$7","$8}' > cleaned_matches.csv
```

#### Step 3: Add CSV Header
```bash
echo "DATE,LOCATION,TIME,WHITE TEAM,S,DARK TEAM,S,COMMENTS" > final_data.csv && cat cleaned_matches.csv >> final_data.csv
```

#### Step 4: Update HTML File
Update `20250620 US_Club_Championship_16U.html`:
- Locate the `csvData` section (around lines 113-152)
- Replace entire content between backticks with new CSV data from `final_data.csv`

### Method 2: Direct CSV Replacement (Quick Update)

For quick score updates:
1. **Identify completed matches** in Google Sheet (matches with scores in both S columns)
2. **Find corresponding match** in HTML file's csvData section
3. **Update score columns** (5th and 7th columns in CSV format)
4. **Change status indicators** (empty scores = scheduled, filled = completed)

## CSV Data Format

### Structure Reference
```csv
DATE,LOCATION,TIME,WHITE TEAM,S,DARK TEAM,S,COMMENTS
6/20/2025,RIVERSIDE POLY #1,4:30 PM,D1 - THUNDER,12,D4 - KERN PREMIER,8,bracket
```

### Key Column Information
- **Columns 5 & 7 (S)**: Score columns for WHITE TEAM and DARK TEAM
- **Empty scores**: Match is scheduled
- **Filled scores**: Match is completed
- **Column 8 (COMMENTS)**: Match phase/bracket info and placement indicators

## Score Update Detection

### Automatic Detection Logic
JavaScript automatically detects completed matches when:
- Both score columns (5th and 7th) contain numeric values
- Status changes from "SCHEDULED" to "COMPLETED"
- Match highlighting updates for key games

### Match Status Indicators
- **Scheduled**: Empty score fields
- **Completed**: Numeric values in both score columns
- **Key Games**: Highlighted based on team importance or elimination rounds

## Multiple Data Update Points ⚠️ **IMPORTANT**

When updating match data, you **MUST** update multiple locations:

### 1. Main Match Table
All matches display in the "All Tournament Matches" section

### 2. Team Match Modals
- Clickable team names in pools show individual team match histories
- Uses `match.white_team.name` and `match.dark_team.name` for filtering
- Team name mismatches will cause "No matches found" errors

### 3. Pool Structure
- The hardcoded pools array must match actual teams in CSV data
- **Key Update Locations in `20250620 US_Club_Championship_16U.html`**:
  - **CSV Data**: Lines 113-152 (embedded csvData)
  - **Pools Array**: Lines 263-268 (must match actual CSV teams)
  - **Team Name Matching**: Team names in pools must exactly match CSV team names

### 4. Statistics Calculations
Team/match counts auto-update from CSV data

## Interactive Features

### Clickable Teams Feature
- Pool team names are clickable and show all matches for that team
- Venue names in modals are clickable links to `pools.html`
- **Navigation Integration**: Direct links to venue information

### Team Match History
- Click any team name to see complete match history
- Filtered view shows only matches involving selected team
- Includes scores, venues, and match phases

## Tournament Statistics Auto-Update

### Automatically Calculated Statistics
- **Team count**: Extracted from unique team names in CSV
- **Match count**: Total matches in CSV (currently 39)
- **Venue count**: Unique venues (currently 4)
- **Pool standings**: Calculated from completed pool matches

### Statistical Displays
- Real-time updates as matches are completed
- Graphical representation of tournament progress
- Team performance metrics

## Venues Coverage

### Tournament Venues (4 total)
- **Riverside Poly #1**: Primary venue (18 matches)
- **Ramona HS**: Co-host venue (17 matches) 
- **Norco HS**: Pool play venue (2 matches)
- **Chino Hills HS**: Championship finals venue (2 matches)

### Venue Integration
- All venues mapped with navigation links to `pools.html`
- Clickable venue names in match displays
- Direct navigation to venue information and directions

## Data Processing Workflow

### CSV Processing Pipeline
1. **Fetch**: Download latest CSV from Google Sheets
2. **Clean**: Remove non-match rows and irrelevant data
3. **Parse**: Extract match information with proper formatting
4. **Update**: Replace embedded CSV data in HTML file
5. **Validate**: Ensure team names match across all data points

### Error Handling
- **Missing Data**: Graceful handling of incomplete match information
- **Team Name Mismatches**: Warnings for pool/CSV team name inconsistencies
- **Venue Mapping**: Fallback display for unmapped venues

## Future Automation Options

### Direct Google Sheets Integration
For automated updates, modify HTML file to fetch directly:
```javascript
const CSV_URL = 'https://docs.google.com/spreadsheets/d/1FuCUomKqgfg8d83zYxld0B2mnTmcbefwyxKFEebMgiY/export?format=csv&gid=0';
// Replace embedded csvData with fetch(CSV_URL)
```

### Benefits of Current Approach
- **Reliability**: Works across all environments
- **Fallback**: Provides backup if Google Sheets unavailable
- **Performance**: No external dependencies during page load
- **Caching**: Reduces API calls to Google Sheets

## Best Practices

### Data Update Workflow
1. **Backup**: Always save current data before updates
2. **Validation**: Verify team names match across all sections
3. **Testing**: Test functionality after updates
4. **Documentation**: Record changes and update procedures

### Common Pitfalls to Avoid
- **Team Name Inconsistencies**: Ensure exact matches between CSV and pools
- **Incomplete Updates**: Update all required sections simultaneously
- **Score Format Issues**: Maintain consistent numeric formatting
- **Venue Mapping**: Verify all venue names are properly mapped

## File References

### Key Files
- **Tournament page**: `20250620 US_Club_Championship_16U.html`
- **CSV data source**: Google Sheets (see URLs above)
- **Venue information**: `pools.html`
- **Styling**: `style.css`
- **JavaScript functionality**: `script.js`

### Navigation Links
- **Tournament Results**: Complete results embedded in main tournament page
- **Venue Information**: Clickable links to detailed venue pages
- **Team Match History**: Modal popups with individual team records