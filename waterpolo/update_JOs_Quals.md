# Tournament Data Update Instructions

## Overview
This document provides step-by-step instructions for updating the 16U Boys Junior Olympics Qualification tournament page (`20250613_16U_JOs_Quals.html`) with the latest match results from the official Google Sheet data source.

## Data Source
- **Official Google Sheet**: https://docs.google.com/spreadsheets/d/1C_yU7MyVHzL1_rubWOHVqAeDto9BApOgw7MarJzQoLk/edit?gid=0#gid=0
- **CSV Export URL**: https://docs.google.com/spreadsheets/d/1C_yU7MyVHzL1_rubWOHVqAeDto9BApOgw7MarJzQoLk/export?format=csv&gid=0
- **Sheet Name**: "16U BOYS"

## LLM Prompt for Future Updates

```
I need you to update the 16U Boys Junior Olympics Qualification tournament page with the latest match results. Here's what you need to do:

1. **Fetch Latest Data**: 
   - Get the current tournament data from the CSV export URL: https://docs.google.com/spreadsheets/d/1C_yU7MyVHzL1_rubWOHVqAeDto9BApOgw7MarJzQoLk/export?format=csv&gid=0
   - Use bash curl command with -L flag to follow redirects: 
     `curl -L -s "https://docs.google.com/spreadsheets/d/1C_yU7MyVHzL1_rubWOHVqAeDto9BApOgw7MarJzQoLk/export?format=csv&gid=0"`

2. **Read Current Tournament Page**:
   - Read the file `waterpolo/20250613_16U_JOs_Quals.html`
   - Focus on the embedded JavaScript data in window.TOURNAMENT_DATA.matches array (lines 72-736)

3. **Compare and Identify Changes**:
   - Look for matches with updated scores (CSV shows scores in columns 5 and 8)
   - Identify games that changed from "SCHEDULED" to "COMPLETED" status
   - Note any new match times or venue changes
   - Pay attention to matches involving San Diego Shores teams (Shores Black, Shores Gold, Shores White)

4. **Update Rules**:
   - ONLY update data that has actually changed - do not modify unchanged matches
   - When updating a match result, change both:
     - score1 and score2 from null to actual scores
     - status from "SCHEDULED" to "COMPLETED"
   - Preserve all other match data (game_number, date, time, venue, teams, phase, notes)
   - Do not add or remove matches unless they appear/disappear from the source

5. **CSV Data Format Reference**:
   - Game numbers are in format "Game # X" in column 4
   - Team 1 (White Caps) is in column 5, score in column 6
   - Team 2 (Dark Caps) is in column 8, score in column 9
   - Times are in column 3, venues in column 2
   - Status notes are in column 10 (OPT OUT, NO CONTEST, etc.)

6. **Common Match Statuses**:
   - "COMPLETED" - Match played with final score
   - "SCHEDULED" - Match not yet played
   - "OPT OUT" - Team opted out, auto-forfeit (5-0)
   - "NO CONTEST" - Same club teams, auto-forfeit (5-0)

Please update only the changed match data in the tournament page and confirm what updates were made.
```

## Manual Update Process

If you need to update manually:

1. **Get Latest Data**:
   ```bash
   curl -L -s "https://docs.google.com/spreadsheets/d/1C_yU7MyVHzL1_rubWOHVqAeDto9BApOgw7MarJzQoLk/export?format=csv&gid=0" > tournament_data.csv
   ```

2. **Find the Match in HTML**:
   - Look for the game number in the matches array
   - Each match is a JSON object with game_number, teams, scores, etc.

3. **Update Match Data**:
   - Change `score1` and `score2` from `null` to actual scores
   - Change `status` from `"SCHEDULED"` to `"COMPLETED"`
   - Update any other changed fields (time, venue, etc.)

4. **Verify Updates**:
   - Check that JSON syntax remains valid
   - Ensure all commas and brackets are properly placed
   - Test the page loads correctly in a browser

## File Locations
- **Tournament Page**: `20250613_16U_JOs_Quals.html`
- **CSS Styles**: `style.css`
- **JavaScript**: `script.js`

## Data Structure Notes
- Tournament data is embedded in JavaScript as `window.TOURNAMENT_DATA`
- Matches array contains 51 total games across 3 days
- Groups A, B, C, D for initial bracket, then AA, BB, CC, DD for re-bracket
- San Diego Shores teams: "Shores Black", "Shores Gold", "Shores White"

## Troubleshooting
- If CSV fetch fails, the Google Sheet may have moved or permissions changed
- Check that game numbers match between CSV and HTML (Game # X format)
- Verify team names match exactly (case-sensitive)
- Ensure JSON remains valid after edits

---
*Last updated: January 2025*
*Tournament: 16U Boys Junior Olympics Qualification - June 13-15, 2025*