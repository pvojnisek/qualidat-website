// Junior Olympics 2025 - Live Results JavaScript
// Real-time JO 16U Boys Championship data streaming and display

let matchCount = 0;
let shoresCount = 0;
let venueCount = 0;
let refreshInterval = null;
let countdownInterval = null;
let nextRefreshTime = 0;
let isArchivedMode = false; // Flag to track archived vs live data mode
let archivedDataTimestamp = null; // Store timestamp from archived data

// Age group configurations
const JO_CONFIGS = {
    '14-championship': {
        title: '14U Boys Championship',
        feedUrl: 'https://feeds.kahunaevents.org/joboys14u',
        category: '14U_BOYS_CHAMPIONSHIP'
    },
    '14-classic': {
        title: '14U Boys Classic',
        feedUrl: 'https://feeds.kahunaevents.org/joboys14ux',
        category: '14U_BOYS_CLASSIC'
    },
    '16-championship': {
        title: '16U Boys Championship',
        feedUrl: 'https://feeds.kahunaevents.org/joboys16u',
        category: '16U_BOYS_CHAMPIONSHIP'
    },
    '16-classic': {
        title: '16U Boys Classic',
        feedUrl: 'https://feeds.kahunaevents.org/joboys16ux',
        category: '16U_BOYS_CLASSIC'
    },
    '18-championship': {
        title: '18U Boys Championship',
        feedUrl: 'https://feeds.kahunaevents.org/joboys18u',
        category: '18U_BOYS_CHAMPIONSHIP'
    },
    '18-classic': {
        title: '18U Boys Classic',
        feedUrl: 'https://feeds.kahunaevents.org/joboys18ux',
        category: '18U_BOYS_CLASSIC'
    }
};

// Global configuration and CORS proxy configuration
let currentConfig = null;
let JO_URL = 'https://feeds.kahunaevents.org/joboys16u'; // Default URL, will be updated dynamically
const PROXIES = [
    { name: 'CodeTabs', url: 'https://api.codetabs.com/v1/proxy/?quest=' },
    { name: 'ThingProxy', url: 'https://thingproxy.freeboard.io/fetch/' },
    { name: 'AllOrigins', url: 'https://api.allorigins.win/raw?url=' }
];

// SD Shores team detection patterns for JO format - covers both ID prefix and team-only formats
const SHORES_PATTERNS = [
    /\bsd shores\b/i,
    /\bsan diego shores\b/i,
    /\bshores black\b/i,
    /\bshores gold\b/i,
    /\bshores white\b/i,
    /\bshores blue\b/i,
    /\bshores red\b/i,
    /\d+-shores/i,                    // JO format with ID: "22-SHORES"
    /\d+-san diego shores/i,          // JO format with ID: "22-SAN DIEGO SHORES"
    /\d+-sd shores/i,                 // JO format with ID: "22-SD SHORES"
    /^shores\b/i,                     // Team name only: "SHORES" (start of string)
    /^san diego shores\b/i,           // Team name only: "SAN DIEGO SHORES"
    /^sd shores\b/i,                  // Team name only: "SD SHORES"
    /shores=\d+/i,                    // In score format: "SHORES=12"
    /san diego shores=\d+/i,          // In score format: "SAN DIEGO SHORES=12"
    /sd shores=\d+/i                  // In score format: "SD SHORES=12"
];

// JO Tournament dates and venues
const JO_VENUES = ['#1', '#2', '#3', '#4', '#5', '#6', '#7', '#8'];

// NEW MATCH DATABASE SYSTEM - API Functions

// Global match database for centralized storage
let matchDatabase = new Map();

function get_match(match_id) {
    return matchDatabase.get(match_id) || null;
}

function update_match(match_id, data) {
    // Get existing match or create new one
    let match = matchDatabase.get(match_id) || createEmptyMatch(match_id);
    
    // Merge new data into match
    mergeDataIntoMatch(match, data);
    
    // Store updated match
    matchDatabase.set(match_id, match);
    
    return match;
}

function mergeDataIntoMatch(match, data) {
    // Always add source line for debugging
    if (data.sourceLine) {
        match.sourceLines.push(data.sourceLine);
    }
    
    // Handle different types of data updates
    if (data.type === 'advancement') {
        // From advancement lines: team positioning
        if (data.position === 1) {
            match.whiteTeam = data.team;
        } else if (data.position === 2) {
            match.darkTeam = data.team;
        }
        
        // Store advancement info
        if (data.color && data.team) {
            if (data.position === 1) {
                match.winnerAdvancement.push({
                    team: data.team,
                    color: data.color,
                    futureGames: data.futureGames || []
                });
            } else if (data.position === 2) {
                match.loserAdvancement.push({
                    team: data.team,
                    color: data.color,
                    futureGames: data.futureGames || []
                });
            }
        }
    }
    
    else if (data.type === 'future_assignment') {
        // Team assigned to future match
        if (data.color === 'WHITE') {
            match.whiteTeam = data.team;
        } else if (data.color === 'DARK') {
            match.darkTeam = data.team;
        }
        
        // Update match scheduling info if provided
        if (data.date) match.date = data.date;
        if (data.time) match.time = data.time;
        if (data.venue) match.venue = data.venue;
        
        match.status = 'SCHEDULED';
    }
    
    else if (data.type === 'result') {
        // From result lines: scores, venue, timing, completion
        match.date = data.date;
        match.time = data.time;
        match.venue = data.venue;
        match.whiteTeam = data.team1;
        match.darkTeam = data.team2;
        match.score = { white: data.score1, dark: data.score2 };
        match.status = 'COMPLETED';
        match.category = data.category;
        match.isComplete = true;
    }
    
    // Update computed properties
    updateMatchShoresStatus(match);
    
    // Update match status based on available data
    if (match.isComplete) {
        match.status = 'COMPLETED';
    } else if (match.whiteTeam || match.darkTeam) {
        match.status = 'SCHEDULED';
    } else {
        match.status = 'BUILDING';
    }
}

function parseLineData(line, matchId) {
    const data = {
        sourceLine: line,
        targetMatchId: matchId
    };
    
    if (isAdvancementLine(line)) {
        const advancement = parseAdvancementLine(line);
        if (advancement && advancement.currentBracket === matchId) {
            // Team played in this match (past)
            data.type = 'advancement';
            data.team = advancement.team;
            data.position = advancement.position;
            data.color = advancement.color;
            data.futureGames = advancement.futureMatches;
        } else if (advancement && advancement.futureMatches) {
            // Check if this match is a future game for the team
            const futureGame = advancement.futureMatches.find(game => game.matchId === matchId);
            if (futureGame) {
                data.type = 'future_assignment';
                data.team = advancement.team;
                data.color = advancement.color;
                data.date = futureGame.date;
                data.time = futureGame.time;
                data.venue = futureGame.venue;
            }
        }
    }
    
    else if (isResultLine(line)) {
        const result = parseResultLine(line);
        if (result && result.matchId === matchId) {
            data.type = 'result';
            data.date = result.date;
            data.time = result.time;
            data.venue = result.venue;
            data.team1 = result.team1;
            data.team2 = result.team2;
            data.score1 = result.score1;
            data.score2 = result.score2;
            data.category = result.category;
        }
    }
    
    return data;
}

// NEW MATCH DATABASE SYSTEM - Core Functions

function extractMatchIds(line) {
    const matchIds = [];
    
    // Extract from bracket numbers: "bracket 41" → 41
    const bracketMatch = line.match(/bracket\s+(\d+)/);
    if (bracketMatch) {
        matchIds.push(parseInt(bracketMatch[1]));
    }
    
    // Extract from game IDs: "game 16B-081" → 81
    const gameMatches = line.matchAll(/game\s+\d+[A-Z]-(\d+)/g);
    for (const match of gameMatches) {
        matchIds.push(parseInt(match[1]));
    }
    
    // Extract from venue numbers: "#41" → 41
    const venueMatch = line.match(/#(\d+)\s/);
    if (venueMatch) {
        matchIds.push(parseInt(venueMatch[1]));
    }
    
    return [...new Set(matchIds)]; // Remove duplicates
}

function createEmptyMatch(id) {
    return {
        id: id,
        date: null,
        time: null,
        venue: null,
        whiteTeam: null,
        darkTeam: null,
        score: { white: null, dark: null },
        status: 'BUILDING',
        category: null,
        bracket: id,
        winnerAdvancement: [],
        loserAdvancement: [],
        sourceLines: [],
        isComplete: false,
        isShoresMatch: false
    };
}

function isAdvancementLine(line) {
    return line.includes(' is ') && 
           line.includes(' in bracket ') && 
           (line.includes(' is DARK ') || line.includes(' is WHITE '));
}

function isResultLine(line) {
    return /^\d{1,2}-[A-Za-z]{3}\s+#\d+/.test(line.trim());
}

function buildMatchesDatabase(rawData) {
    console.log('🔨 Building matches database with API functions...');
    
    // Clear database for fresh build
    matchDatabase.clear();
    
    const lines = rawData.split('\n').filter(line => line.trim() && !line.startsWith('#'));
    
    lines.forEach((line, lineNumber) => {
        const lineNum = lineNumber + 1;
        console.log(`Processing line ${lineNum}: ${line.substring(0, 50)}...`);
        
        // Extract match IDs from this line
        const matchIds = extractMatchIds(line);
        
        // Process each match mentioned in this line
        matchIds.forEach(matchId => {
            console.log(`  → Updating match ${matchId}`);
            
            // Parse data from this line for this specific match
            const data = parseLineData(line, matchId);
            
            // Update match with new data using API
            update_match(matchId, data);
        });
    });
    
    // Return all matches as array
    const matches = Array.from(matchDatabase.values());
    console.log(`✅ Built database with ${matches.length} matches using API`);
    
    // Debug: Show match details
    matches.forEach(match => {
        console.log(`  Match ${match.id}: ${match.status} - ${match.whiteTeam || 'TBD'} vs ${match.darkTeam || 'TBD'}`);
    });
    
    return matches;
}


function parseAdvancementLine(line) {
    // Handle advancement lines: "TEAM is POSITION in bracket BRACKET is COLOR in game GAME..."
    const pattern = /^(.+?)\s+is\s+(\d+)\s+in\s+bracket\s+(\d+)\s+is\s+(DARK|WHITE)\s+in\s+game\s+(\d+[A-Z]-\d+)(.*)$/i;
    const match = line.match(pattern);
    
    if (!match) {
        console.warn('Failed to parse advancement line:', line);
        return null;
    }
    
    const team = match[1].trim();
    const position = parseInt(match[2]);
    const bracket = parseInt(match[3]);
    const color = match[4].toUpperCase();
    const gameId = match[5];
    const remainder = match[6];
    
    const futureMatches = parseFutureGames(gameId + remainder);
    
    return {
        team,
        position,
        currentBracket: bracket,
        color,
        futureMatches
    };
}

function parseFutureGames(gameString) {
    const games = [];
    // Updated pattern to capture venue information too
    const gamePattern = /(\d+[A-Z]-\d+)\s+on\s+([\d-A-Za-z]+)\s+at\s+([\d:]+\s*(?:AM|PM))(?:\s+(?:at|in)\s+(.+?))?(?:\s*;|$)/gi;
    let match;
    
    while ((match = gamePattern.exec(gameString)) !== null) {
        const gameId = match[1];
        const matchId = parseInt(gameId.split('-')[1]);
        games.push({
            gameId,
            matchId,
            date: match[2],
            time: match[3],
            venue: match[4] ? match[4].trim() : null
        });
    }
    
    return games;
}

function parseResultLine(line) {
    const pattern = /^(\d{1,2}-[A-Za-z]{3})\s+#(\d+)\s+(.+?)\s+(\d{1,2}:\d{2}\s*(?:AM|PM))\s+(.+?)=(\d+)\s+(.+?)=(\d+)\s+(.+)$/;
    const match = line.match(pattern);
    
    if (!match) return null;
    
    return {
        date: match[1],
        matchId: parseInt(match[2]),
        venue: match[3].trim(),
        time: match[4],
        team1: match[5].trim(),
        score1: parseInt(match[6]),
        team2: match[7].trim(),
        score2: parseInt(match[8]),
        category: match[9].trim()
    };
}

function updateMatchShoresStatus(match) {
    match.isShoresMatch = (match.whiteTeam && detectShoresTeam(match.whiteTeam)) || 
                         (match.darkTeam && detectShoresTeam(match.darkTeam));
}

function applyFiltersToMatchDatabase(matches) {
    const filterShores = document.getElementById('filterShores')?.checked || false;
    const customSearch = document.getElementById('customTeamSearch')?.value?.trim() || '';
    
    let filteredMatches = matches;
    
    // Apply Shores filter
    if (filterShores) {
        filteredMatches = filteredMatches.filter(match => match.isShoresMatch);
    }
    
    // Apply custom team/venue search
    if (customSearch) {
        filteredMatches = filteredMatches.filter(match => 
            applySearchToMatch(match, customSearch)
        );
    }
    
    return filteredMatches;
}

function applySearchToMatch(match, searchTerm) {
    const search = searchTerm.toLowerCase();
    const team1Name = (match.whiteTeam || '').toLowerCase();
    const team2Name = (match.darkTeam || '').toLowerCase();
    const venueName = (match.venue || '').toLowerCase();
    
    return team1Name.includes(search) || 
           team2Name.includes(search) || 
           venueName.includes(search);
}

function createMatchCardFromDatabase(match, cardNumber) {
    const matchDiv = document.createElement('div');
    matchDiv.className = `match-card ${match.isShoresMatch ? 'shores-highlight' : ''}`;
    matchDiv.style.animationDelay = `${cardNumber * 0.1}s`;
    
    // Get search term for highlighting
    const customSearch = document.getElementById('customTeamSearch')?.value?.trim() || '';
    const team1Html = highlightSearchText(match.whiteTeam || 'TBD', customSearch);
    const team2Html = highlightSearchText(match.darkTeam || 'TBD', customSearch);
    const venueHtml = highlightSearchText(match.venue || '', customSearch);
    
    // Determine winner
    let team1Winner = false;
    let team2Winner = false;
    if (match.score.white !== null && match.score.dark !== null) {
        if (match.score.white > match.score.dark) team1Winner = true;
        else if (match.score.dark > match.score.white) team2Winner = true;
    }
    
    // Generate status badge
    let statusBadge = '';
    if (match.status === 'COMPLETED') {
        statusBadge = '<span class="match-status status-completed">COMPLETED</span>';
    } else if (match.status === 'SCHEDULED') {
        statusBadge = '<span class="match-status status-scheduled">SCHEDULED</span>';
    }
    
    matchDiv.innerHTML = `
        <div class="match-header match-header-prominent">
            <div class="match-info-left">
                ${match.id ? `<span class="match-number-circle">#${match.id}</span>` : ''}
                ${match.venue ? `<span class="venue-info-large" onclick="selectVenue('${escapeHtml(match.venue).replace(/'/g, "\\'")}')">${venueHtml}</span>` : ''}
            </div>
            <div class="match-info-right">
                ${match.time ? `<span class="datetime-combined">⏰ ${match.time}${match.date ? ` • ${match.date}` : ''}</span>` : ''}
                ${statusBadge}
            </div>
        </div>
        
        <div class="match-teams">
            <div class="teams-row">
                <div class="team-info team-left">
                    <div class="team-name ${detectShoresTeam(match.whiteTeam || '') ? 'shores-team' : ''} ${team1Winner ? 'winner' : ''}" onclick="selectTeam('${escapeHtml(match.whiteTeam || '').replace(/'/g, "\\'")}')">${team1Html}</div>
                </div>
                <div class="team-info team-right">
                    <div class="team-name ${detectShoresTeam(match.darkTeam || '') ? 'shores-team' : ''} ${team2Winner ? 'winner' : ''}" onclick="selectTeam('${escapeHtml(match.darkTeam || '').replace(/'/g, "\\'")}')">${team2Html}</div>
                </div>
            </div>
            <div class="score-row">
                <div class="score-center">
                    ${match.score.white !== null && match.score.dark !== null ?
                        `<span class="center-score-display">${match.score.white} - ${match.score.dark}</span>` :
                        `<span class="vs-text-center">VS</span>`
                    }
                </div>
            </div>
        </div>
        
        <div class="match-actions">
            <span class="show-details" onclick="toggleMatchDetails(this)">📋 Details</span>
            <span class="show-raw" onclick="toggleRawData(this)">📄 Raw</span>
        </div>
        
        <div class="match-details">
            <div class="match-meta">
                ${match.time ? `<span class="meta-item">⏰ ${match.time}</span>` : ''}
                ${match.venue ? `<span class="meta-item venue">📍 ${match.venue}</span>` : ''}
                ${match.date ? `<span class="meta-item">📅 ${match.date}</span>` : ''}
                ${match.category ? `<span class="meta-item championship">🏆 ${match.category}</span>` : ''}
                <span class="meta-item">🆔 Match ID: ${match.id}</span>
                <span class="meta-item">📊 Status: ${match.status}</span>
            </div>
        </div>
        
        <div class="raw-data">
            <strong>Source Lines:</strong><br>
            ${match.sourceLines.map(line => escapeHtml(line)).join('<br>')}
        </div>
    `;
    
    return matchDiv;
}



function applyFilters() {
    // Re-run the display with current data to apply new filters
    const statusBadge = document.getElementById('statusBadge');
    if (statusBadge && !statusBadge.classList.contains('status-loading')) {
        // Only re-filter if we have data loaded
        loadLiveResults();
    }
}


function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

function selectTeam(teamName) {
    // Update the search input with the selected team name
    const searchInput = document.getElementById('customTeamSearch');
    if (searchInput) {
        searchInput.value = teamName;
        // Trigger immediate filtering (no debounce for direct selection)
        applyFilters();
        updateClearButtonVisibility(); // Show clear button
    }
}

function selectVenue(venueName) {
    // Update the search input with the selected venue name
    const searchInput = document.getElementById('customTeamSearch');
    if (searchInput) {
        searchInput.value = venueName;
        // Trigger immediate filtering (no debounce for direct selection)
        applyFilters();
        updateClearButtonVisibility(); // Show clear button
    }
}

function clearSearch() {
    const searchInput = document.getElementById('customTeamSearch');
    if (searchInput) {
        searchInput.value = '';
        applyFilters(); // Clear filters immediately
        updateClearButtonVisibility(); // Hide clear button
    }
}

function updateClearButtonVisibility() {
    const searchInput = document.getElementById('customTeamSearch');
    const clearBtn = document.getElementById('clearSearchBtn');
    if (searchInput && clearBtn) {
        clearBtn.style.display = searchInput.value.trim() ? 'block' : 'none';
    }
}

function highlightSearchText(teamName, searchTerm) {
    if (!searchTerm.trim()) return teamName;
    
    const regex = new RegExp(`(${escapeRegex(searchTerm)})`, 'gi');
    return teamName.replace(regex, '<span class="highlight-match">$1</span>');
}

function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function parseArchivedDataTimestamp(data) {
    // Look for timestamp in header: "# Downloaded: July 19, 2025 at 4:32 PM PST"
    const lines = data.split('\n');
    for (const line of lines) {
        if (line.startsWith('# Downloaded:')) {
            const timestampMatch = line.match(/# Downloaded: (.+)$/);
            if (timestampMatch) {
                return timestampMatch[1];
            }
        }
    }
    return null;
}

// Parse URL parameters and get current configuration
function getCurrentConfig() {
    const params = new URLSearchParams(window.location.search);
    const age = params.get('age') || '16';
    const classType = params.get('class') || 'championship';
    const configKey = `${age}-${classType}`;
    return JO_CONFIGS[configKey] || JO_CONFIGS['16-championship'];
}

// Switch age group function
function switchAgeGroup() {
    const dropdown = document.getElementById('ageGroupDropdown');
    const selectedValue = dropdown.value;
    const [age, classType] = selectedValue.split('-');
    
    // Navigate to same page with new parameters
    const newUrl = `${window.location.pathname}?age=${age}&class=${classType}`;
    window.location.href = newUrl;
}

// Initialize page with current configuration
function initializePage() {
    // Set current configuration from URL parameters
    currentConfig = getCurrentConfig();
    
    // Update JO_URL for data fetching
    JO_URL = currentConfig.feedUrl;
    
    // Update page elements
    updatePageElements();
    
    console.log(`🏊‍♂️ Initialized page for ${currentConfig.title}`);
    console.log(`📡 Data source: ${currentConfig.feedUrl}`);
}

// Update page elements based on current configuration
function updatePageElements() {
    // Update subtitle
    const subtitle = document.querySelector('.subtitle');
    if (subtitle) {
        subtitle.textContent = currentConfig.title;
    }
    
    // Update dropdown selection
    const dropdown = document.getElementById('ageGroupDropdown');
    if (dropdown) {
        const params = new URLSearchParams(window.location.search);
        const age = params.get('age') || '16';
        const classType = params.get('class') || 'championship';
        const configKey = `${age}-${classType}`;
        dropdown.value = configKey;
    }
    
    // Update footer text
    const footerElement = document.querySelector('.footer div:first-child');
    if (footerElement) {
        footerElement.innerHTML = `Data source: <strong>Junior Olympics ${currentConfig.title} official feed</strong>`;
    }
    
    // Update empty state text
    const emptyState = document.querySelector('.empty-state small');
    if (emptyState) {
        emptyState.textContent = `Showing ${currentConfig.title} • Max 50 matches • SD Shores teams highlighted`;
    }
}

function setupCustomSearchListeners() {
    const searchInput = document.getElementById('customTeamSearch');
    const clearBtn = document.getElementById('clearSearchBtn');
    
    if (searchInput) {
        // Create debounced filter function
        const debouncedFilter = debounce(applyFilters, 300);
        
        // Add input event listener with debouncing
        searchInput.addEventListener('input', (e) => {
            debouncedFilter();
            updateClearButtonVisibility();
        });
        
        // Initialize clear button visibility
        updateClearButtonVisibility();
    }
    
    if (clearBtn) {
        // Add clear button click listener
        clearBtn.addEventListener('click', clearSearch);
    }
}

async function loadLiveResults() {
    console.log('🔄 Loading live JO tournament results...');
    updateStatus('loading', 'Fetching latest JO results...');

    try {
        const data = await fetchViaProxy();
        if (data) {
            displayJOMatchResults(data);
            if (isArchivedMode) {
                updateStatus('archived', 'Using archived JO tournament data');
            } else {
                updateStatus('success', 'JO results loaded successfully');
                updateLastRefreshTime();
            }
            updateLiveIndicatorVisibility(); // Update indicator visibility based on data mode
        } else {
            throw new Error('No data received from JO tournament feed');
        }
    } catch (error) {
        console.error('❌ Failed to load JO results:', error);
        updateStatus('error', 'Failed to load JO results');
        showError(error.message);
    }
}

async function fetchViaProxy() {
    // First, try to load live data from Kahuna Events feed
    isArchivedMode = false; // Set flag for live data mode initially
    
    for (const proxy of PROXIES) {
        try {
            console.log(`🔄 Trying ${proxy.name} for live JO tournament data...`);
            updateStatus('loading', `Connecting via ${proxy.name}...`);

            const proxyUrl = proxy.name === 'ThingProxy' 
                ? proxy.url + JO_URL
                : proxy.url + encodeURIComponent(JO_URL);

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);

            const response = await fetch(proxyUrl, {
                signal: controller.signal,
                mode: 'cors',
                cache: 'no-cache'
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const text = await response.text();

            if (!text || text.trim().length === 0) {
                throw new Error('Empty response received');
            }

            console.log(`✅ Live JO data loaded via ${proxy.name}, data length:`, text.length);
            return text;

        } catch (proxyError) {
            console.warn(`❌ ${proxy.name} failed:`, proxyError.message);
            continue;
        }
    }
    
    // Fallback to archived data if all live sources fail
    try {
        console.log('🔄 Live data failed, falling back to archived JO tournament data...');
        updateStatus('loading', 'Loading archived JO tournament results...');
        
        const response = await fetch('jo_tournament_raw.txt');
        if (!response.ok) {
            throw new Error(`Failed to load archived JO data: ${response.status}`);
        }
        
        const text = await response.text();
        isArchivedMode = true; // Set flag for archived data mode
        archivedDataTimestamp = parseArchivedDataTimestamp(text); // Parse timestamp
        console.log('✅ Archived JO data loaded as fallback, data length:', text.length);
        console.log('📅 Archived data timestamp:', archivedDataTimestamp);
        return text;
    } catch (error) {
        console.warn('❌ Failed to load archived JO data:', error.message);
        throw new Error('All JO data sources failed to load');
    }
}

function displayJOMatchResults(data) {
    console.log('🔄 NEW: Using match database system for display...');
    
    // Build structured match database from raw data
    const matchDatabase = buildMatchesDatabase(data);
    
    // Apply filters to structured match objects
    const filteredMatches = applyFiltersToMatchDatabase(matchDatabase);
    
    // Limit to 50 matches for display
    const displayMatches = filteredMatches.slice(0, 50);
    
    // Update global counters
    matchCount = displayMatches.length;
    shoresCount = displayMatches.filter(match => match.isShoresMatch).length;
    
    // Count unique venues
    const venuesInUse = new Set();
    displayMatches.forEach(match => {
        if (match.venue) venuesInUse.add(match.venue);
    });
    venueCount = venuesInUse.size;
    
    // Generate display
    const matchGrid = document.getElementById('matchGrid');
    if (!matchGrid) return; // Null check for test environments
    
    matchGrid.innerHTML = '';
    if (displayMatches.length === 0) {
        matchGrid.innerHTML = '<div class="empty-state">📭 No JO tournament results match the current filters</div>';
        return;
    }

    displayMatches.forEach((match, index) => {
        const matchCard = createMatchCardFromDatabase(match, index);
        matchGrid.appendChild(matchCard);
    });
    
    // Update stats display
    updateStats();
    
    console.log(`✅ Displayed ${displayMatches.length} matches from database`);
}






function isFutureMatchLine(line) {
    // Check if line matches future match format pattern
    return line.includes(' is ') && 
           line.includes(' in bracket ') && 
           line.includes(' in game ') && 
           line.includes(' on ') && 
           line.includes(' at ') &&
           (line.includes(' is DARK ') || line.includes(' is WHITE '));
}









function detectShoresTeam(line) {
    return SHORES_PATTERNS.some(pattern => pattern.test(line));
}

function toggleMatchDetails(element) {
    const matchDetails = element.parentElement.nextElementSibling;
    const isVisible = matchDetails.style.display === 'block';
    
    matchDetails.style.display = isVisible ? 'none' : 'block';
    element.innerHTML = isVisible ? '📋 Details' : '📋 Hide';
}

function toggleRawData(element) {
    const rawData = element.parentElement.nextElementSibling.nextElementSibling;
    const isVisible = rawData.style.display === 'block';
    
    rawData.style.display = isVisible ? 'none' : 'block';
    element.innerHTML = isVisible ? '📄 Raw' : '📄 Hide';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function updateStatus(type, message) {
    const badge = document.getElementById('statusBadge');
    if (!badge) return; // Null check for test environments
    badge.className = `status-badge status-${type}`;
    badge.innerHTML = type === 'loading' 
        ? `<span class="spinner"></span> ${message}`
        : message;
}

function showError(message) {
    const matchGrid = document.getElementById('matchGrid');
    if (!matchGrid) return; // Null check for test environments
    matchGrid.innerHTML = `
        <div class="empty-state">
            ❌ Error loading JO tournament results<br>
            <small style="margin-top: 10px; display: block; color: #dc3545;">${escapeHtml(message)}</small>
            <small style="margin-top: 10px; display: block;">Will retry automatically in next refresh cycle...</small>
        </div>
    `;
}

function updateStats() {
    const matchCountEl = document.getElementById('matchCount');
    const shoresCountEl = document.getElementById('shoresCount');
    const venueCountEl = document.getElementById('venueCount');
    
    if (matchCountEl) matchCountEl.textContent = matchCount;
    if (shoresCountEl) shoresCountEl.textContent = shoresCount;
    if (venueCountEl) venueCountEl.textContent = venueCount;
}

function updateLastRefreshTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const lastUpdate = document.getElementById('lastUpdate');
    if (lastUpdate) lastUpdate.textContent = timeString; // Null check for test environments
}

function updateLiveIndicatorVisibility() {
    const liveIndicator = document.getElementById('liveIndicator');
    if (liveIndicator) {
        if (isArchivedMode) {
            // Show archived data indicator
            liveIndicator.style.display = 'inline-flex';
            liveIndicator.classList.add('archived');
            
            // Update content to show archived status
            const timestampText = archivedDataTimestamp || 'Unknown time';
            liveIndicator.innerHTML = `
                <div class="live-dot"></div>
                <span>Archived Data • Last updated: ${timestampText}</span>
            `;
            console.log('🏛️ Live indicator showing archived JO data mode');
        } else {
            // Show live data indicator
            liveIndicator.style.display = 'inline-flex';
            liveIndicator.classList.remove('archived');
            liveIndicator.innerHTML = `
                <div class="live-dot"></div>
                <span>Live Results • <span class="countdown" id="countdown">Loading...</span></span>
            `;
            console.log('🔴 Live indicator visible for live JO data mode');
        }
    }
}

function startRefreshCycle() {
    // Set next refresh time (3 minutes)
    nextRefreshTime = Date.now() + (3 * 60 * 1000);
    
    // Clear existing intervals
    if (refreshInterval) clearInterval(refreshInterval);
    if (countdownInterval) clearInterval(countdownInterval);
    
    // Start refresh cycle every 3 minutes
    refreshInterval = setInterval(loadLiveResults, 3 * 60 * 1000);
    
    // Start countdown display
    countdownInterval = setInterval(updateCountdown, 1000);
}

function updateCountdown() {
    const remaining = Math.max(0, nextRefreshTime - Date.now());
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    
    const countdown = document.getElementById('countdown');
    if (!countdown) return; // Null check for test environments
    
    if (remaining > 0) {
        countdown.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    } else {
        countdown.textContent = 'Refreshing...';
        nextRefreshTime = Date.now() + (3 * 60 * 1000);
    }
}

// Initialize the page only if we're in the live results environment
window.addEventListener('load', () => {
    // Check if we're in the JO live results page (has required DOM elements)
    const isJOLiveResultsPage = document.getElementById('matchGrid') && 
                               document.getElementById('statusBadge') && 
                               document.getElementById('customTeamSearch');
    
    if (isJOLiveResultsPage) {
        console.log('🚀 Junior Olympics Live Results page loaded');
        
        // Initialize page configuration first
        initializePage();
        
        setupCustomSearchListeners();
        loadLiveResults().then(() => {
            // Only start refresh cycle if we're in live mode (not archived)
            if (!isArchivedMode) {
                console.log('🔴 Starting refresh cycle for live JO data mode');
                startRefreshCycle();
            } else {
                console.log('🏛️ Skipping refresh cycle for archived JO data mode');
            }
        });
    } else {
        console.log('🧪 JO live results functions loaded in test environment');
    }
});

// Handle page visibility changes for better performance (only in live results environment)
document.addEventListener('visibilitychange', () => {
    // Only run if we're in the live results environment and not in archived mode
    const isJOLiveResultsPage = document.getElementById('matchGrid') && 
                               document.getElementById('statusBadge');
    
    if (isJOLiveResultsPage && !document.hidden && !isArchivedMode) {
        // Page became visible, refresh if it's been more than 1 minute (live mode only)
        const timeSinceRefresh = Date.now() - (nextRefreshTime - (3 * 60 * 1000));
        if (timeSinceRefresh > 60000) {
            console.log('🔄 JO page visible again, refreshing results...');
            loadLiveResults();
            startRefreshCycle();
        }
    }
});