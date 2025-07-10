# 2025 Quiksilver International Water Polo Cup - Tournament Documentation

## Tournament Overview

**Tournament Name**: 2025 QUIKSILVER INTERNATIONAL WATER POLO CUP
**Division**: 16U BOYS
**Dates**: July 11-13, 2025
**Teams**: 16 teams
**Format**: 7 minute quarters, 40 games total, 5 games per team

## Data Source

- **Primary Data**: Google Sheets CSV export
- **CSV URL**: https://docs.google.com/spreadsheets/d/15Jjzt1sg6QgFa6Z8yhTDvUs4KSpgRLmV/export?format=csv&gid=1811120689
- **Local File**: quiksilver_tournament_data.csv
- **Update Method**: Periodic CSV download and refresh - download the csv file using curl

## Tournament Structure Analysis

### Pool Structure (4 Pools, 4 Teams Each)

**Pool A (Seeds 1, 8, 9, 16)**:
- A1: SD SHORES (Seed #1 - TOP SEED)
- A2: SAND CANYON (Seed #8) 
- A3: CT PREMIER (Seed #9)
- A4: FRASER VALLEY (Seed #16)

**Pool B (Seeds 2, 7, 10, 15)**:
- B1: CHANNEL ISLANDS UNITED (Seed #2)
- B2: CARLSBAD (Seed #7)
- B3: FOOTHILL WPC (Seed #10)
- B4: PASADENA AC (Seed #15)

**Pool C (Seeds 3, 6, 11, 14)**:
- C1: LA PREMIER (Seed #3)
- C2: VEGAS/NORTH IRVINE (Seed #6)
- C3: VANGUARD (Seed #11)
- C4: LB SHORE (Seed #14)

**Pool D (Seeds 4, 5, 12, 13)**:
- D1: LA JOLLA UNITED (Seed #4)
- D2: 680 (Seed #5)
- D3: COMMERCE (Seed #12)
- D4: IMPERIAL (Seed #13)

### Tournament Progression System

**Day 1 (July 11) - Pool Play**:
1. **Pool Matches**: Each team plays 2 games (A1 vs A4, A2 vs A3, etc.)
2. **Pool Finals**: Winners and losers bracket within each pool
   - Winners play for 1st/2nd place in pool
   - Losers play for 3rd/4th place in pool

**Day 2 (July 12) - Elimination Brackets**:

**Championship Bracket (Places 1-8)**:
- **Quarterfininals**: 1st/2nd place teams from each pool cross-over
  - 1stC vs 2ndD, 2ndA vs 1stB, 1stA vs 2ndB, 2ndC vs 1stD
- **Semifinals**: QF winners advance to championship, losers to 3rd place match

**Consolation Bracket (Places 9-16)**:
- **Quarterfininals**: 3rd/4th place teams from each pool
  - Multiple bracket progression for comprehensive placement

**Day 3 (July 13) - Finals & Placement**:
- **Championship Final**: 1st place (Long Beach City College)
- **3rd Place Match**: Bronze medal (Golden West College)
- **Placement Matches**: 5th, 7th, 9th, 11th, 13th, 15th place determination

## Venue Information

**Primary Venues**:
- **BUENA PARK HS**: Main tournament venue, most pool play and elimination games
- **EL MODENA**: Secondary venue, pool play and consolation bracket
- **GOLDEN WEST COLLEGE**: 3rd place match venue
- **LONG BEACH CITY COLLEGE**: Championship final venue (prestigious location)

## SD Shores Analysis

**Seeding**: #1 Overall Seed (A1) - Tournament Favorite
**Pool**: Pool A with moderate competition
**Expected Path**: 
- Pool A winner → Championship bracket
- Potential semifinal or final appearance
- Strong medal contention

## Tournament Format Highlights

1. **Comprehensive Bracketing**: Every team gets final ranking 1-16
2. **Dual Elimination Structure**: Championship (1-8) and Consolation (9-16) brackets
3. **Pool Advancement**: Top 2 from each pool → Championship bracket, Bottom 2 → Consolation
4. **Multiple Venues**: Prestigious final venue at Long Beach City College
5. **High Competition**: 16 elite teams with structured seeding system

## CSV Data Structure

**Key Columns**:
- DATE: Match date
- TIME: Match time
- LOCATION: Venue name
- GAME#: Match identifier (16B01-16B40)
- WHITE/DARK: Team names
- COMMENTS: Match description (pool, bracket, placement)
- DIVISION: 16U_BOYS

## Development Notes

- **Focus on SD Shores**: Highlight as #1 seed and track championship path
- **Pool A**: Emphasize SD Shores' pool and advancement opportunities
- **Championship Potential**: Tournament structure favors top seed advancement
- **Venue Prestige**: Championship final at Long Beach City College
- **Bracket Complexity**: Multiple elimination brackets require clear visualization

## Integration with Main Site

This tournament represents a significant opportunity for SD Shores as the #1 seed in a prestigious 16-team tournament. The complex bracket structure and multiple venues provide excellent content for detailed coverage and results tracking.cs