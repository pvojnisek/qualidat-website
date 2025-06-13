# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a static website (microsite under /waterpolo/) for water polo tournaments, specifically for the San Diego Shores 16U team's Summer Campaign 2025. The site showcases tournament schedules, results, and provides detailed information about water polo events. In the key matches sections, focus on San Diego Shores teams.


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
