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
let futureMatchesData = {}; // Store future matches by team name

// CORS proxy configuration - ordered by speed (fastest first)
const JO_URL = 'https://feeds.kahunaevents.org/joboys16u';
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

function deduplicateMatches(lines) {
    const seen = new Set();
    const uniqueLines = [];
    
    for (const line of lines) {
        // Create a unique identifier for each match
        const matchSignature = createJOMatchSignature(line);
        
        if (!seen.has(matchSignature)) {
            seen.add(matchSignature);
            uniqueLines.push(line);
        }
    }
    
    return uniqueLines;
}

function createJOMatchSignature(line) {
    // Parse the JO line to extract key identifying information
    // JO Format: "19-Jul  #5 SAN JUAN HILLS HS  7:50 AM  22-LONGHORN=10  27-CT PREMIER=14  16U_BOYS_CHAMPIONSHIP"
    const fields = line.split(/\s{2,}/);
    
    if (fields.length >= 5) {
        const date = fields[0]?.trim() || '';
        const venue = fields[1]?.trim() || '';
        const time = fields[2]?.trim() || '';
        const team1Data = fields[3]?.trim() || '';
        const team2Data = fields[4]?.trim() || '';
        
        // Extract team names from JO format (e.g., "22-LONGHORN=10")
        const team1Name = team1Data.split('=')[0]?.replace(/^\d+-/, '') || '';
        const team2Name = team2Data.split('=')[0]?.replace(/^\d+-/, '') || '';
        
        return `${date}_${venue}_${time}_${team1Name}_${team2Name}`;
    }
    
    // Last resort: use the entire line (but trim whitespace)
    return line.trim();
}

function applyActiveFilters(lines) {
    const filterShores = document.getElementById('filterShores')?.checked || false;
    const filterVenue1 = document.getElementById('filterVenue1')?.checked || false;
    const filterVenue2 = document.getElementById('filterVenue2')?.checked || false;
    const filterVenue3 = document.getElementById('filterVenue3')?.checked || false;
    const filterVenue4 = document.getElementById('filterVenue4')?.checked || false;
    const filterVenue5 = document.getElementById('filterVenue5')?.checked || false;
    const filterVenue6 = document.getElementById('filterVenue6')?.checked || false;
    const filterVenue7 = document.getElementById('filterVenue7')?.checked || false;
    const filterVenue8 = document.getElementById('filterVenue8')?.checked || false;
    const filterRecent = document.getElementById('filterRecent')?.checked || false;
    
    let filteredLines = lines;
    
    // Apply venue filters (OR logic for venues)
    const hasVenueFilters = filterVenue1 || filterVenue2 || filterVenue3 || filterVenue4 || 
                           filterVenue5 || filterVenue6 || filterVenue7 || filterVenue8;
    if (hasVenueFilters) {
        filteredLines = filteredLines.filter(line => {
            const matchesVenue1 = filterVenue1 && line.includes('#1 ');
            const matchesVenue2 = filterVenue2 && line.includes('#2 ');
            const matchesVenue3 = filterVenue3 && line.includes('#3 ');
            const matchesVenue4 = filterVenue4 && line.includes('#4 ');
            const matchesVenue5 = filterVenue5 && line.includes('#5 ');
            const matchesVenue6 = filterVenue6 && line.includes('#6 ');
            const matchesVenue7 = filterVenue7 && line.includes('#7 ');
            const matchesVenue8 = filterVenue8 && line.includes('#8 ');
            return matchesVenue1 || matchesVenue2 || matchesVenue3 || matchesVenue4 ||
                   matchesVenue5 || matchesVenue6 || matchesVenue7 || matchesVenue8;
        });
    }
    
    // Apply Shores filter
    if (filterShores) {
        filteredLines = filteredLines.filter(line => 
            detectShoresTeam(line)
        );
    }
    
    // Apply recent filter (matches from last 2 hours)
    if (filterRecent) {
        filteredLines = filteredLines.filter(line =>
            isJOMatchFromLastHour(line)
        );
    }
    
    // Apply custom team search filter
    const customSearch = document.getElementById('customTeamSearch')?.value?.trim() || '';
    if (customSearch) {
        filteredLines = filteredLines.filter(line => 
            applyCustomTeamFilter(line, customSearch)
        );
    }
    
    return filteredLines;
}

// **NEW FUNCTION**: Apply filters to structured match objects instead of raw lines
function applyActiveFiltersToMatches(matchObjects) {
    const filterShores = document.getElementById('filterShores')?.checked || false;
    const filterVenue1 = document.getElementById('filterVenue1')?.checked || false;
    const filterVenue2 = document.getElementById('filterVenue2')?.checked || false;
    const filterVenue3 = document.getElementById('filterVenue3')?.checked || false;
    const filterVenue4 = document.getElementById('filterVenue4')?.checked || false;
    const filterVenue5 = document.getElementById('filterVenue5')?.checked || false;
    const filterVenue6 = document.getElementById('filterVenue6')?.checked || false;
    const filterVenue7 = document.getElementById('filterVenue7')?.checked || false;
    const filterVenue8 = document.getElementById('filterVenue8')?.checked || false;
    const filterRecent = document.getElementById('filterRecent')?.checked || false;
    
    let filteredMatches = matchObjects;
    
    // Apply venue filters (OR logic for venues) - use parsed venue data and venue names for future matches
    const hasVenueFilters = filterVenue1 || filterVenue2 || filterVenue3 || filterVenue4 || 
                           filterVenue5 || filterVenue6 || filterVenue7 || filterVenue8;
    if (hasVenueFilters) {
        filteredMatches = filteredMatches.filter(matchData => {
            // For completed matches, use match number
            const venueNum = matchData.matchNumber;
            let matchesVenue1 = filterVenue1 && venueNum === '1';
            let matchesVenue2 = filterVenue2 && venueNum === '2';
            let matchesVenue3 = filterVenue3 && venueNum === '3';
            let matchesVenue4 = filterVenue4 && venueNum === '4';
            let matchesVenue5 = filterVenue5 && venueNum === '5';
            let matchesVenue6 = filterVenue6 && venueNum === '6';
            let matchesVenue7 = filterVenue7 && venueNum === '7';
            let matchesVenue8 = filterVenue8 && venueNum === '8';
            
            // For future matches, also check venue names (fallback for matches without numbers)
            if (matchData.type === 'future' && matchData.venueDisplayName) {
                const venueName = matchData.venueDisplayName.toUpperCase();
                if (filterVenue1) matchesVenue1 = matchesVenue1 || venueName.includes('1') || venueName.includes('ONE');
                if (filterVenue2) matchesVenue2 = matchesVenue2 || venueName.includes('2') || venueName.includes('TWO');
                if (filterVenue3) matchesVenue3 = matchesVenue3 || venueName.includes('3') || venueName.includes('THREE');
                if (filterVenue4) matchesVenue4 = matchesVenue4 || venueName.includes('4') || venueName.includes('FOUR');
                if (filterVenue5) matchesVenue5 = matchesVenue5 || venueName.includes('5') || venueName.includes('FIVE');
                if (filterVenue6) matchesVenue6 = matchesVenue6 || venueName.includes('6') || venueName.includes('SIX');
                if (filterVenue7) matchesVenue7 = matchesVenue7 || venueName.includes('7') || venueName.includes('SEVEN');
                if (filterVenue8) matchesVenue8 = matchesVenue8 || venueName.includes('8') || venueName.includes('EIGHT');
            }
            
            return matchesVenue1 || matchesVenue2 || matchesVenue3 || matchesVenue4 ||
                   matchesVenue5 || matchesVenue6 || matchesVenue7 || matchesVenue8;
        });
    }
    
    // Apply Shores filter using parsed team data
    if (filterShores) {
        filteredMatches = filteredMatches.filter(matchData => 
            matchData.team1.isShores || matchData.team2.isShores
        );
    }
    
    // Apply recent filter (matches from last 2 hours) - use original line for compatibility
    if (filterRecent) {
        filteredMatches = filteredMatches.filter(matchData =>
            isJOMatchFromLastHour(matchData.originalLine)
        );
    }
    
    // Apply custom team search filter using parsed team data
    const customSearch = document.getElementById('customTeamSearch')?.value?.trim() || '';
    if (customSearch) {
        filteredMatches = filteredMatches.filter(matchData => 
            applyCustomTeamFilterToMatch(matchData, customSearch)
        );
    }
    
    return filteredMatches;
}

function applyFilters() {
    // Re-run the display with current data to apply new filters
    const statusBadge = document.getElementById('statusBadge');
    if (statusBadge && !statusBadge.classList.contains('status-loading')) {
        // Only re-filter if we have data loaded
        loadLiveResults();
    }
}

function applyCustomTeamFilter(line, searchTerm) {
    // Parse team names and venue from the JO line
    const matchData = parseJOMatchLine(line);
    const team1Name = matchData.team1.name.toLowerCase();
    const team2Name = matchData.team2.name.toLowerCase();
    const venueName = matchData.venue ? matchData.venue.toLowerCase() : '';
    const search = searchTerm.toLowerCase();
    
    // Return true if team names OR venue name contains the search term
    return team1Name.includes(search) || team2Name.includes(search) || venueName.includes(search);
}

// **NEW FUNCTION**: Apply custom team filter to structured match objects
function applyCustomTeamFilterToMatch(matchData, searchTerm) {
    const team1Name = matchData.team1.name.toLowerCase();
    const team2Name = matchData.team2.name.toLowerCase();
    const venueName = matchData.venueDisplayName ? matchData.venueDisplayName.toLowerCase() : '';
    const search = searchTerm.toLowerCase();
    
    // Return true if team names OR venue name contains the search term
    return team1Name.includes(search) || team2Name.includes(search) || venueName.includes(search);
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
    // First, parse the data format - handle both archived format and live email format
    let lines = data.split('\n').filter(line => line.trim() && !line.startsWith('#'));
    
    // If data contains email-style headers, extract both completed and future match lines
    if (data.includes('Subject:') || data.includes('HOT!')) {
        lines = data.split('\n').filter(line => {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#') || trimmed.includes('Subject:') || trimmed.includes('HOT!') || 
                trimmed.includes('ADVANCEMENT UPDATE') || trimmed.includes('RESULT UPDATE')) {
                return false;
            }
            
            // Include completed matches (date at start) AND future matches (team advancement format)
            return /^\d{1,2}-[A-Za-z]{3}\s/.test(trimmed) || isFutureMatchLine(trimmed);
        });
    }
    
    // Separate completed and future match lines
    const completedLines = lines.filter(line => isValidJOMatchLine(line));
    const futureLines = lines.filter(line => isFutureMatchLine(line));
    const validLines = [...completedLines, ...futureLines];
    const invalidCount = lines.length - validLines.length;
    
    // Log filtering results for debugging
    if (invalidCount > 0) {
        console.log(`🧹 Filtered out ${invalidCount} invalid/malformed rows from JO data`);
        console.log(`✅ Processing ${validLines.length} valid match rows`);
    }
    
    // Remove duplicate entries from completed matches only
    const uniqueCompletedLines = deduplicateMatches(completedLines);
    
    // **NEW**: Build completed match index for efficient filtering
    const completedIndex = buildCompletedMatchIndex(uniqueCompletedLines);
    
    // **NEW**: Filter future match lines early (before expensive parsing)
    const allFutureLines = lines.filter(line => isFutureMatchLine(line));
    const filteredFutureLines = filterFutureMatchLines(allFutureLines, completedIndex);
    
    // Log filtering results
    if (allFutureLines.length > filteredFutureLines.length) {
        console.log(`🧹 Filtered out ${allFutureLines.length - filteredFutureLines.length} completed future matches (${filteredFutureLines.length} remaining)`);
    }
    
    // **NEW**: Build future matches data from filtered lines only
    buildFutureMatchesData(filteredFutureLines);
    
    // **NEW**: Group future matches by game ID to create proper match objects
    const groupedFutureMatches = groupFutureMatchesByGameId(filteredFutureLines);
    
    // **NEW APPROACH**: Parse completed matches and combine with grouped future matches
    const completedMatchObjects = uniqueCompletedLines.map(line => {
        const matchData = parseJOMatchLine(line);
        // Attach original line for backward compatibility
        matchData.originalLine = line;
        return matchData;
    });
    
    // Combine completed and future match objects
    const allMatchObjects = [...completedMatchObjects, ...groupedFutureMatches];
    
    // Apply filters using structured match objects
    const allFilteredMatches = applyActiveFiltersToMatches(allMatchObjects);
    
    // FINALLY limit to 50 matches for display (after all filtering)
    const filteredMatches = allFilteredMatches.slice(0, 50);
    
    matchCount = filteredMatches.length;
    shoresCount = 0;
    venueCount = 0;
    
    // **FIXED**: Count venues using parsed venueDisplayName instead of match numbers
    const venuesInUse = new Set();
    
    const matchGrid = document.getElementById('matchGrid');
    if (!matchGrid) return; // Null check for test environments
    
    matchGrid.innerHTML = '';
    if (filteredMatches.length === 0) {
        matchGrid.innerHTML = '<div class="empty-state">📭 No JO tournament results match the current filters</div>';
        return;
    }

    filteredMatches.forEach((matchData, index) => {
        // Count Shores matches using parsed data
        const isShoresMatch = matchData.team1.isShores || matchData.team2.isShores;
        if (isShoresMatch) shoresCount++;
        
        // **FIXED**: Count venues using venueDisplayName (not match numbers)
        if (matchData.venueDisplayName) {
            venuesInUse.add(matchData.venueDisplayName);
        }
        
        // Create match card using structured data
        const matchCard = createJOMatchCardFromData(matchData, index, isShoresMatch);
        matchGrid.appendChild(matchCard);
    });
    
    venueCount = venuesInUse.size;
    
    // Update stats
    updateStats();
}

function createJOMatchCard(line, cardNumber, isShoresMatch) {
    const matchDiv = document.createElement('div');
    matchDiv.className = `match-card ${isShoresMatch ? 'shores-highlight' : ''}`;
    matchDiv.style.animationDelay = `${cardNumber * 0.1}s`;
    
    // Parse match data
    const matchData = parseJOMatchLine(line);
    const matchStatus = detectJOMatchStatus(line);
    
    return createJOMatchCardFromData(matchData, cardNumber, isShoresMatch, matchStatus, line);
}

// **NEW FUNCTION**: Create match card from pre-parsed structured data
function createJOMatchCardFromData(matchData, cardNumber, isShoresMatch, matchStatus = null, originalLine = null) {
    const matchDiv = document.createElement('div');
    const futureClass = matchData.type === 'future' ? 'future-match' : '';
    matchDiv.className = `match-card ${futureClass} ${isShoresMatch ? 'shores-highlight' : ''}`.trim();
    matchDiv.style.animationDelay = `${cardNumber * 0.1}s`;
    
    // Use provided status or detect from match data and original line
    if (!matchStatus) {
        if (matchData.type === 'future') {
            matchStatus = detectFutureMatchStatus(matchData);
        } else if (originalLine) {
            matchStatus = detectJOMatchStatus(originalLine);
        } else if (matchData.originalLine) {
            matchStatus = detectJOMatchStatus(matchData.originalLine);
        }
    }
    
    // Determine winner
    let team1Winner = false;
    let team2Winner = false;
    if (matchData.team1.score !== null && matchData.team2.score !== null) {
        const score1 = parseInt(matchData.team1.score);
        const score2 = parseInt(matchData.team2.score);
        if (score1 > score2) team1Winner = true;
        else if (score2 > score1) team2Winner = true;
    }
    
    // Get search term for highlighting
    const customSearch = document.getElementById('customTeamSearch')?.value?.trim() || '';
    const team1Html = highlightSearchText(matchData.team1.name, customSearch);
    const team2Html = highlightSearchText(matchData.team2.name, customSearch);
    
    // Use original line for raw data display
    const lineForRawData = originalLine || matchData.originalLine || 'No raw data available';
    
    matchDiv.innerHTML = `
        <div class="match-header match-header-prominent">
            <div class="match-info-left">
                ${matchData.matchNumber ? `<span class="match-number-circle">#${matchData.matchNumber}</span>` : ''}
                ${matchData.type === 'future' && matchData.gameId ? `<span class="game-id-circle">${matchData.gameId}</span>` : ''}
                ${matchData.venueDisplayName ? `<span class="venue-info-large" onclick="selectVenue('${escapeHtml(matchData.venueDisplayName).replace(/'/g, "\\'")}')">${highlightSearchText(matchData.venueDisplayName, customSearch)}</span>` : ''}
            </div>
            <div class="match-info-right">
                ${matchData.time ? `<span class="datetime-combined">⏰ ${matchData.time}${matchData.date ? ` • 📅 ${matchData.date}` : ''}</span>` : ''}
                ${matchStatus ? `<span class="match-status status-${matchStatus.type}">${matchStatus.label}</span>` : ''}
            </div>
        </div>
        
        <div class="match-teams">
            <div class="teams-row">
                <div class="team-info team-left">
                    <div class="team-name ${matchData.team1.isShores ? 'shores-team' : ''} ${team1Winner ? 'winner' : ''}" onclick="selectTeam('${escapeHtml(matchData.team1.name).replace(/'/g, "\\'")}')">${matchData.team1.prefix ? `<span class="team-prefix">${matchData.team1.prefix}-</span>` : ''}${team1Html}${getFutureMatchIcon(matchData.team1.name)}</div>
                </div>
                <div class="team-info team-right">
                    <div class="team-name ${matchData.team2.isShores ? 'shores-team' : ''} ${team2Winner ? 'winner' : ''}" onclick="selectTeam('${escapeHtml(matchData.team2.name).replace(/'/g, "\\'")}')">${matchData.team2.prefix ? `<span class="team-prefix">${matchData.team2.prefix}-</span>` : ''}${team2Html}${getFutureMatchIcon(matchData.team2.name)}</div>
                </div>
            </div>
            <div class="score-row">
                <div class="score-center">
                    ${matchData.team1.score !== null && matchData.team2.score !== null ?
                        `<span class="center-score-display">${matchData.team1.score} - ${matchData.team2.score}</span>` :
                        (matchData.team1.score !== null || matchData.team2.score !== null ?
                            `<span class="center-score-display">${matchData.team1.score !== null ? matchData.team1.score : '-'} - ${matchData.team2.score !== null ? matchData.team2.score : '-'}</span>` :
                            `<span class="vs-text-center">VS</span>`)
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
                ${matchData.time ? `<span class="meta-item">⏰ ${matchData.time}</span>` : ''}
                ${matchData.venue ? `<span class="meta-item venue">📍 ${matchData.venue}</span>` : ''}
                ${matchData.date ? `<span class="meta-item">📅 ${matchData.date}</span>` : ''}
                ${matchData.category ? `<span class="meta-item championship">🏆 ${matchData.category}</span>` : ''}
                ${matchData.team1.prefix ? `<span class="meta-item">Team 1 ID: ${matchData.team1.prefix}</span>` : ''}
                ${matchData.team2.prefix ? `<span class="meta-item">Team 2 ID: ${matchData.team2.prefix}</span>` : ''}
                
                ${getFutureMatchesForDetails(matchData.team1.name, matchData.team2.name)}
            </div>
        </div>
        
        <div class="raw-data">${escapeHtml(lineForRawData)}</div>
    `;
    
    return matchDiv;
}

function parseJOMatchLine(line) {
    // Parse both completed and future match formats
    // Completed: "19-Jul  #5 SAN JUAN HILLS HS  7:50 AM  22-LONGHORN=10  27-CT PREMIER=14  16U_BOYS_CHAMPIONSHIP"
    // Future: "SHORES is 1 in bracket 41 is WHITE in game 16B-081 on 20-Jul at 11:10 AM at WOOLLETT NEAR RIGHT"
    
    // Check if this is a future match format
    if (isFutureMatchLine(line)) {
        return parseFutureMatchAsJOFormat(line);
    }
    
    // Continue with standard completed match parsing
    const result = {
        type: 'completed',
        team1: { name: 'Team A', score: null, isShores: false, prefix: null },
        team2: { name: 'Team B', score: null, isShores: false, prefix: null },
        time: null,
        venue: null,
        venueDisplayName: null,
        matchNumber: null,
        date: null,
        category: null,
        status: 'COMPLETED'
    };

    // Split by double spaces (field separator in JO format)
    const fields = line.split(/\s{2,}/);
    
    if (fields.length >= 6) {
        // Field structure: [0]DATE [1]VENUE [2]TIME [3]TEAM1-PREFIX=SCORE [4]TEAM2-PREFIX=SCORE [5]CATEGORY
        
        // Parse date (field 0)
        result.date = fields[0]?.trim();
        
        // Parse venue (field 1) and extract match number
        const venueField = fields[1]?.trim();
        result.venue = venueField;
        
        // Extract match number from venue (e.g., "#23 PORTOLA HS 1" → "23", "PORTOLA HS 1")
        const venueMatch = venueField?.match(/^#(\d+)\s+(.+)$/);
        if (venueMatch) {
            result.matchNumber = venueMatch[1];
            result.venueDisplayName = venueMatch[2];
        } else {
            result.venueDisplayName = venueField;
        }
        
        // Parse time (field 2)
        result.time = fields[2]?.trim();
        
        // Parse team 1 and score (field 3) - handle both formats:
        // Format 1: "22-LONGHORN=10" (with ID prefix)
        // Format 2: "OAHU=4" (team name only)
        const team1WithPrefix = fields[3]?.match(/^(\d+)-(.+?)=(.+)$/);
        const team1WithoutPrefix = fields[3]?.match(/^([^=]+)=(.+)$/);
        
        if (team1WithPrefix) {
            result.team1.prefix = team1WithPrefix[1];
            result.team1.name = team1WithPrefix[2].trim();
            result.team1.score = team1WithPrefix[3];
        } else if (team1WithoutPrefix) {
            result.team1.prefix = null;
            result.team1.name = team1WithoutPrefix[1].trim();
            result.team1.score = team1WithoutPrefix[2];
        }
        
        // Parse team 2 and score (field 4) - handle both formats:
        const team2WithPrefix = fields[4]?.match(/^(\d+)-(.+?)=(.+)$/);
        const team2WithoutPrefix = fields[4]?.match(/^([^=]+)=(.+)$/);
        
        if (team2WithPrefix) {
            result.team2.prefix = team2WithPrefix[1];
            result.team2.name = team2WithPrefix[2].trim();
            result.team2.score = team2WithPrefix[3];
        } else if (team2WithoutPrefix) {
            result.team2.prefix = null;
            result.team2.name = team2WithoutPrefix[1].trim();
            result.team2.score = team2WithoutPrefix[2];
        }
        
        // Parse category (field 5)
        result.category = fields[5]?.trim();
        
        // Try to extract game ID from match number and venue
        if (result.matchNumber && result.venueDisplayName) {
            // For completed matches, construct a game ID based on available data
            // This might not be exactly the same format as future matches, but provides consistency
            result.gameId = `JO-${result.matchNumber}`;
        }
        
        // Check if teams are Shores
        result.team1.isShores = detectShoresTeam(result.team1.name) || detectShoresTeam(fields[3] || '');
        result.team2.isShores = detectShoresTeam(result.team2.name) || detectShoresTeam(fields[4] || '');
    }

    return result;
}

function parseFutureMatchLine(line) {
    // Parse future match format: can handle single or multiple matches per line
    // Single: "LOWPO is 2 in bracket 47 is DARK in game 16B-064 on 20-Jul at 7:00 AM at SADDLEBACK COLLEGE 1"
    // Multiple: "TEAM is 1 in bracket 41 is WHITE in game 16B-081 on 20-Jul at 11:10 AM at VENUE; and WHITE in game 16B-097 on 20-Jul at 2:30 PM in VENUE"
    
    const results = [];

    try {
        // Split on "; and" to handle multiple matches per line
        const matchSegments = line.split(/;\s*and\s+/i);
        
        for (let i = 0; i < matchSegments.length; i++) {
            const segment = matchSegments[i].trim();
            const result = {
                team: null,
                bracket: null,
                position: null,
                color: null,
                gameId: null,
                date: null,
                time: null,
                venue: null
            };

            if (i === 0) {
                // First segment has full format: "TEAM is POSITION in bracket BRACKET is COLOR in game GAME on DATE at TIME at/in VENUE"
                const fullPattern = /^(.+?)\s+is\s+(\d+)\s+in\s+bracket\s+(\d+)\s+is\s+(DARK|WHITE)\s+in\s+game\s+([\w-]+)\s+on\s+([\d-A-Za-z]+)\s+at\s+([\d:]+\s*(?:AM|PM))\s+(?:at|in)\s+(.+)$/i;
                const match = segment.match(fullPattern);
                
                if (match) {
                    result.team = match[1].trim();
                    result.position = match[2];
                    result.bracket = match[3];
                    result.color = match[4].toUpperCase();
                    result.gameId = match[5];
                    result.date = match[6];
                    result.time = match[7];
                    result.venue = match[8].trim();
                }
            } else {
                // Subsequent segments have shortened format: "COLOR in game GAME on DATE at TIME at/in VENUE"
                const shortPattern = /^(DARK|WHITE)\s+in\s+game\s+([\w-]+)\s+on\s+([\d-A-Za-z]+)\s+at\s+([\d:]+\s*(?:AM|PM))(?:\s+(?:at|in)\s+(.+))?$/i;
                const match = segment.match(shortPattern);
                
                if (match && results.length > 0) {
                    // Copy team info from first match
                    const firstMatch = results[0];
                    result.team = firstMatch.team;
                    result.bracket = firstMatch.bracket;
                    result.position = firstMatch.position;
                    
                    // Parse new match info
                    result.color = match[1].toUpperCase();
                    result.gameId = match[2];
                    result.date = match[3];
                    result.time = match[4];
                    result.venue = match[5] ? match[5].trim() : firstMatch.venue; // Use first venue if not specified
                }
            }

            // Only add if we successfully parsed the match
            if (result.team && result.gameId) {
                results.push(result);
            }
        }
        
    } catch (error) {
        console.warn('Error parsing future match line:', error);
    }

    // Return array of matches (maintain backward compatibility by returning single object if only one match)
    return results.length === 1 ? results[0] : results;
}

function parseFutureMatchAsJOFormat(line) {
    // Convert future match format to JO match object format
    // Input: "SHORES is 1 in bracket 41 is WHITE in game 16B-081 on 20-Jul at 11:10 AM at WOOLLETT NEAR RIGHT"
    const result = {
        type: 'future',
        team1: { name: 'TBD', score: null, isShores: false, prefix: null, color: null },
        team2: { name: 'TBD', score: null, isShores: false, prefix: null, color: null },
        time: null,
        venue: null,
        venueDisplayName: null,
        matchNumber: null,
        date: null,
        category: '16U_BOYS_CHAMPIONSHIP',
        gameId: null,
        status: 'SCHEDULED'
    };

    try {
        // Parse the future match format
        const futureData = parseFutureMatchLine(line);
        
        // Handle both single match and array results
        const match = Array.isArray(futureData) ? futureData[0] : futureData;
        
        if (match && match.team) {
            // Extract data from the future match
            result.date = match.date;
            result.time = match.time;
            result.venue = match.venue;
            result.venueDisplayName = match.venue;
            result.gameId = match.gameId;
            
            // Set the known team
            result.team1.name = match.team;
            result.team1.color = match.color;
            result.team1.isShores = detectShoresTeam(match.team);
            
            // Second team is TBD until advancement is resolved
            result.team2.name = "TBD";
            result.team2.isShores = false;
        }
    } catch (error) {
        console.warn('Error converting future match to JO format:', error);
    }

    return result;
}

function resolveTeamAdvancement(futureMatch, completedMatches) {
    // Resolve team advancement placeholders like "Winner of 16B-047"
    const resolved = { ...futureMatch };
    
    try {
        // Check if team1 needs resolution
        if (futureMatch.team1.name.startsWith('Winner of ')) {
            const sourceGameId = futureMatch.team1.name.replace('Winner of ', '');
            const sourceMatch = completedMatches.find(m => m.gameId === sourceGameId);
            
            if (sourceMatch && sourceMatch.team1.score !== null && sourceMatch.team2.score !== null) {
                const score1 = parseInt(sourceMatch.team1.score);
                const score2 = parseInt(sourceMatch.team2.score);
                
                if (score1 > score2) {
                    resolved.team1.name = sourceMatch.team1.name;
                    resolved.team1.isShores = sourceMatch.team1.isShores;
                } else if (score2 > score1) {
                    resolved.team1.name = sourceMatch.team2.name;
                    resolved.team1.isShores = sourceMatch.team2.isShores;
                }
            }
        }
        
        // Check if team2 needs resolution
        if (futureMatch.team2.name.startsWith('Winner of ')) {
            const sourceGameId = futureMatch.team2.name.replace('Winner of ', '');
            const sourceMatch = completedMatches.find(m => m.gameId === sourceGameId);
            
            if (sourceMatch && sourceMatch.team1.score !== null && sourceMatch.team2.score !== null) {
                const score1 = parseInt(sourceMatch.team1.score);
                const score2 = parseInt(sourceMatch.team2.score);
                
                if (score1 > score2) {
                    resolved.team2.name = sourceMatch.team1.name;
                    resolved.team2.isShores = sourceMatch.team1.isShores;
                } else if (score2 > score1) {
                    resolved.team2.name = sourceMatch.team2.name;
                    resolved.team2.isShores = sourceMatch.team2.isShores;
                }
            }
        }
        
        // Update status if teams are resolved
        if (resolved.team1.name !== 'TBD' && resolved.team1.name !== futureMatch.team1.name &&
            resolved.team2.name !== 'TBD' && resolved.team2.name !== futureMatch.team2.name) {
            resolved.status = 'READY';
        }
        
    } catch (error) {
        console.warn('Error resolving team advancement:', error);
    }
    
    return resolved;
}

function sortMatchesByDateTime(matches) {
    // Sort matches chronologically regardless of type
    return matches.sort((a, b) => {
        try {
            // Parse dates and times for comparison
            const dateTimeA = parseJODateTime(a.date, a.time, new Date().getFullYear());
            const dateTimeB = parseJODateTime(b.date, b.time, new Date().getFullYear());
            
            if (!dateTimeA) return 1;  // Put invalid dates at end
            if (!dateTimeB) return -1;
            
            return dateTimeA - dateTimeB;
        } catch (error) {
            console.warn('Error sorting matches by date/time:', error);
            return 0;
        }
    });
}

function updateMatchStatus(match, currentTime = new Date()) {
    // Update match status based on current time and match time
    if (match.status === 'COMPLETED') return 'COMPLETED';
    
    try {
        const matchDateTime = parseJODateTime(match.date, match.time, currentTime.getFullYear());
        if (!matchDateTime) return match.status;
        
        const timeDiff = matchDateTime - currentTime;
        const threeHours = 3 * 60 * 60 * 1000; // 3 hours in milliseconds
        const ninetyMinutes = 90 * 60 * 1000; // 90 minutes for match duration
        
        if (timeDiff <= threeHours && timeDiff > 0) {
            return 'COMING_UP';
        } else if (timeDiff <= 0 && Math.abs(timeDiff) <= ninetyMinutes) {
            return 'LIVE';
        }
        
        return match.status;
    } catch (error) {
        console.warn('Error updating match status:', error);
        return match.status;
    }
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

function buildFutureMatchesData(lines) {
    // Reset the global future matches data
    futureMatchesData = {};
    
    console.log('🔮 Processing future match data...');
    
    // Filter and parse future match lines
    const futureLines = lines.filter(line => isFutureMatchLine(line));
    console.log(`📅 Found ${futureLines.length} future match lines`);
    
    futureLines.forEach(line => {
        const parseResult = parseFutureMatchLine(line);
        
        // Handle both single match objects and arrays of matches
        const matches = Array.isArray(parseResult) ? parseResult : [parseResult];
        
        matches.forEach(futureMatch => {
            if (futureMatch && futureMatch.team) {
                // Initialize team array if it doesn't exist
                if (!futureMatchesData[futureMatch.team]) {
                    futureMatchesData[futureMatch.team] = [];
                }
                
                // Add the future match to the team's array
                futureMatchesData[futureMatch.team].push(futureMatch);
            }
        });
    });
    
    // Log results for debugging
    const teamsWithFutureMatches = Object.keys(futureMatchesData).length;
    const totalFutureMatches = Object.values(futureMatchesData).reduce((total, matches) => total + matches.length, 0);
    
    console.log(`📊 Future matches processed: ${teamsWithFutureMatches} teams, ${totalFutureMatches} total matches`);
    console.log(`🔄 Multi-match lines now supported - teams can have multiple future games`);
    
    return futureMatchesData;
}

function buildCompletedMatchIndex(completedLines) {
    // Build fast lookup index: "date|time|venue" → Set<teamNames>
    const index = new Map();
    
    completedLines.forEach(line => {
        const fields = line.split(/\s{2,}/);
        if (fields.length >= 6) {
            const date = fields[0]?.trim();
            const venue = fields[1]?.trim().replace(/^#\d+\s+/, ''); // Remove "#41 " prefix
            const time = fields[2]?.trim();
            
            // Extract team names from "TEAM=SCORE" format
            const team1 = fields[3]?.split('=')[0]?.replace(/^\d+-/, '')?.trim();
            const team2 = fields[4]?.split('=')[0]?.replace(/^\d+-/, '')?.trim();
            
            if (date && venue && time && team1 && team2) {
                const key = `${date}|${time}|${venue}`;
                if (!index.has(key)) {
                    index.set(key, new Set());
                }
                index.get(key).add(team1);
                index.get(key).add(team2);
            }
        }
    });
    
    return index;
}

function filterFutureMatchLines(futureLines, completedIndex) {
    // Filter future match lines before parsing - exact match on date+time+venue+team
    return futureLines.filter(line => {
        // Extract: "TEAM is ... on DATE at TIME at/in VENUE"
        const teamMatch = line.match(/^([^\s]+(?:\s+[^\s]+)*?)\s+is\s+/);
        const dateMatch = line.match(/\bon\s+(\d{1,2}-[A-Za-z]{3})\s+/);
        const timeMatch = line.match(/\bat\s+(\d{1,2}:\d{2}\s*(?:AM|PM))\s+/);
        const venueMatch = line.match(/.*\s(?:at|in)\s+(.+)$/);
        
        if (teamMatch && dateMatch && timeMatch && venueMatch) {
            const team = teamMatch[1].trim();
            const date = dateMatch[1];
            const time = timeMatch[1];
            const venue = venueMatch[1].trim();
            
            const key = `${date}|${time}|${venue}`;
            const completedTeams = completedIndex.get(key);
            
            if (completedTeams && completedTeams.has(team)) {
                return false; // Don't process this future match - already completed
            }
        }
        
        return true; // Process this future match
    });
}

function groupFutureMatchesByGameId(lines) {
    // Group future matches by game ID to create proper match objects
    // Water polo convention: WHITE team always on left (team1), DARK team on right (team2)
    
    console.log('🏆 Grouping future matches by game ID...');
    
    // Filter and parse all future match lines
    const futureLines = lines.filter(line => isFutureMatchLine(line));
    const allFutureMatches = [];
    
    // Parse all future matches first
    futureLines.forEach(line => {
        const parseResult = parseFutureMatchLine(line);
        const matches = Array.isArray(parseResult) ? parseResult : [parseResult];
        
        matches.forEach(futureMatch => {
            if (futureMatch && futureMatch.team && futureMatch.gameId) {
                allFutureMatches.push(futureMatch);
            }
        });
    });
    
    // Group by game ID
    const gameGroups = {};
    allFutureMatches.forEach(match => {
        if (!gameGroups[match.gameId]) {
            gameGroups[match.gameId] = [];
        }
        gameGroups[match.gameId].push(match);
    });
    
    // Create grouped match objects
    const groupedMatches = [];
    
    Object.entries(gameGroups).forEach(([gameId, matches]) => {
        if (matches.length === 0) return;
        
        // Find WHITE and DARK teams (water polo positioning convention)
        const whiteTeam = matches.find(m => m.color === 'WHITE');
        const darkTeam = matches.find(m => m.color === 'DARK');
        
        // Use first match as template for shared data
        const templateMatch = matches[0];
        
        // Create grouped match object following water polo convention
        const groupedMatch = {
            type: 'future',
            team1: { // LEFT side - WHITE team in water polo
                name: whiteTeam ? whiteTeam.team : 'TBD',
                score: null,
                isShores: whiteTeam ? detectShoresTeam(whiteTeam.team) : false,
                prefix: null,
                color: 'WHITE'
            },
            team2: { // RIGHT side - DARK team in water polo
                name: darkTeam ? darkTeam.team : 'TBD',
                score: null,
                isShores: darkTeam ? detectShoresTeam(darkTeam.team) : false,
                prefix: null,
                color: 'DARK'
            },
            time: templateMatch.time,
            venue: templateMatch.venue,
            venueDisplayName: templateMatch.venue,
            matchNumber: null,
            date: templateMatch.date,
            category: '16U_BOYS_CHAMPIONSHIP',
            gameId: gameId,
            status: 'SCHEDULED',
            originalLine: `Future match: ${gameId}` // Composite original line
        };
        
        groupedMatches.push(groupedMatch);
    });
    
    console.log(`🏊‍♂️ Grouped ${allFutureMatches.length} individual future matches into ${groupedMatches.length} game objects`);
    console.log(`⚪ WHITE teams positioned left (team1), ⚫ DARK teams positioned right (team2)`);
    
    return groupedMatches;
}

function teamHasFutureMatches(teamName) {
    return futureMatchesData[teamName] && futureMatchesData[teamName].length > 0;
}

function getFutureMatchIcon(teamName) {
    const hasFuture = teamHasFutureMatches(teamName);
    
    // Debug logging
    if (teamName && teamName.includes('SHORES') || teamName.includes('LOWPO') || teamName.includes('SAN FRANCISCO')) {
        console.log(`🔍 getFutureMatchIcon for "${teamName}": ${hasFuture ? 'HAS future matches' : 'NO future matches'}`);
        console.log(`📊 futureMatchesData keys:`, Object.keys(futureMatchesData));
    }
    
    if (hasFuture) {
        return `<span class="future-match-icon" onclick="showFutureMatches('${escapeHtml(teamName).replace(/'/g, "\\'")}'); event.stopPropagation();" title="View upcoming matches">📅</span>`;
    }
    return '';
}

function showFutureMatches(teamName) {
    const matches = futureMatchesData[teamName];
    if (!matches || matches.length === 0) {
        console.warn('No future matches found for team:', teamName);
        return;
    }

    // Remove any existing popup
    closeFutureMatchesPopup();

    // Create popup HTML
    const popupHtml = `
        <div id="futureMatchesPopup" class="future-matches-popup">
            <div class="future-matches-content">
                <div class="future-matches-header">
                    <h3>Upcoming Matches - ${escapeHtml(teamName)}</h3>
                    <button onclick="closeFutureMatchesPopup()" class="close-popup">×</button>
                </div>
                <div class="future-matches-list">
                    ${matches.map(match => `
                        <div class="future-match-item">
                            <div class="future-match-header">
                                <span class="game-id">${escapeHtml(match.gameId || 'TBD')}</span>
                                <span class="match-color ${match.color ? match.color.toLowerCase() : ''}">${escapeHtml(match.color || 'TBD')}</span>
                            </div>
                            <div class="future-match-details">
                                <div class="match-time">
                                    <span class="date">📅 ${escapeHtml(match.date || 'TBD')}</span>
                                    <span class="time">⏰ ${escapeHtml(match.time || 'TBD')}</span>
                                </div>
                                <div class="match-venue">
                                    <span class="venue">📍 ${escapeHtml(match.venue || 'TBD')}</span>
                                </div>
                                <div class="match-bracket">
                                    <span class="bracket">🏆 Bracket ${escapeHtml(match.bracket || 'TBD')} - Position ${escapeHtml(match.position || 'TBD')}</span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="popup-overlay" onclick="closeFutureMatchesPopup()"></div>
        </div>
    `;

    // Add popup to DOM
    document.body.insertAdjacentHTML('beforeend', popupHtml);
}

function closeFutureMatchesPopup() {
    const popup = document.getElementById('futureMatchesPopup');
    if (popup) {
        popup.remove();
    }
}

function getFutureMatchesForDetails(team1Name, team2Name) {
    const team1Matches = futureMatchesData[team1Name] || [];
    const team2Matches = futureMatchesData[team2Name] || [];
    
    if (team1Matches.length === 0 && team2Matches.length === 0) {
        return ''; // No future matches for either team
    }
    
    let html = '<div class="future-matches-details">';
    html += '<div class="future-matches-header">🔮 Upcoming Matches:</div>';
    
    // Team 1 future matches
    if (team1Matches.length > 0) {
        html += `<div class="team-future-matches">`;
        html += `<div class="team-future-name">${escapeHtml(team1Name)}:</div>`;
        team1Matches.forEach(match => {
            html += `<div class="future-match-item-details">`;
            html += `<span class="future-game-info">${match.color} in game ${match.gameId}</span>`;
            html += `<span class="future-schedule">${match.date} at ${match.time}</span>`;
            html += `<span class="future-venue">${match.venue}</span>`;
            html += `</div>`;
        });
        html += `</div>`;
    }
    
    // Team 2 future matches
    if (team2Matches.length > 0) {
        html += `<div class="team-future-matches">`;
        html += `<div class="team-future-name">${escapeHtml(team2Name)}:</div>`;
        team2Matches.forEach(match => {
            html += `<div class="future-match-item-details">`;
            html += `<span class="future-game-info">${match.color} in game ${match.gameId}</span>`;
            html += `<span class="future-schedule">${match.date} at ${match.time}</span>`;
            html += `<span class="future-venue">${match.venue}</span>`;
            html += `</div>`;
        });
        html += `</div>`;
    }
    
    html += '</div>';
    return html;
}

function detectJOMatchStatus(line) {
    const upperLine = line.toUpperCase();
    
    // Check if this is today's match for live label
    const today = new Date();
    const todayString = today.toLocaleDateString('en-US', { 
        day: 'numeric', 
        month: 'short' 
    }).replace(' ', '-'); // Format: "19-Jul"
    
    const isToday = line.includes(todayString);
    
    // Enhanced recent match detection: matches from last 2 hours (completed matches only)
    const isRecentMatch = isJOMatchFromLastHour(line);
    
    if (isRecentMatch) {
        return { type: 'recent', label: 'RECENT' };
    }
    if (upperLine.includes('CHAMPIONSHIP')) {
        return { type: 'championship', label: 'CHAMPIONSHIP' };
    }
    
    // Return null for no status badge
    return null;
}

function detectFutureMatchStatus(matchData) {
    // Detect status for future matches based on match data
    if (!matchData || matchData.type !== 'future') {
        return null;
    }
    
    try {
        const currentTime = new Date();
        const status = updateMatchStatus(matchData, currentTime);
        
        switch (status) {
            case 'COMING_UP':
                return { type: 'coming_up', label: 'COMING UP ⏰' };
            case 'LIVE':
                return { type: 'live', label: 'LIVE 🔥' };
            case 'READY':
                return { type: 'ready', label: 'READY ✅' };
            case 'SCHEDULED':
            default:
                if (matchData.team2.name === 'TBD') {
                    return { type: 'waiting', label: 'WAITING 📝' };
                } else {
                    return { type: 'scheduled', label: 'SCHEDULED 📅' };
                }
        }
    } catch (error) {
        console.warn('Error detecting future match status:', error);
        return { type: 'scheduled', label: 'SCHEDULED 📅' };
    }
}

function isJOMatchFromLastHour(line) {
    try {
        // Parse JO format: "19-Jul  #5 SAN JUAN HILLS HS  7:50 AM  ..."
        const fields = line.split(/\s{2,}/);
        
        if (fields.length < 3) return false;
        
        const dateStr = fields[0]?.trim(); // "19-Jul"
        const timeStr = fields[2]?.trim(); // "7:50 AM"
        
        if (!dateStr || !timeStr) return false;
        
        // Parse the match date and time
        const currentYear = new Date().getFullYear();
        const matchDateTime = parseJODateTime(dateStr, timeStr, currentYear);
        
        if (!matchDateTime) return false;
        
        // Check if match was within the last 2 hours
        const now = new Date();
        const twoHoursAgo = new Date(now.getTime() - (2 * 60 * 60 * 1000));
        
        return matchDateTime >= twoHoursAgo && matchDateTime <= now;
        
    } catch (error) {
        console.warn('Error parsing JO match time:', error);
        return false;
    }
}

function parseJODateTime(dateStr, timeStr, year) {
    try {
        // Parse date like "19-Jul"
        const [day, monthName] = dateStr.split('-');
        const monthMap = {
            'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
            'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
        };
        
        const month = monthMap[monthName];
        if (month === undefined) return null;
        
        // Parse time like "7:50 AM"
        const timeMatch = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (!timeMatch) return null;
        
        let hours = parseInt(timeMatch[1]);
        const minutes = parseInt(timeMatch[2]);
        const ampm = timeMatch[3].toUpperCase();
        
        if (ampm === 'PM' && hours !== 12) hours += 12;
        if (ampm === 'AM' && hours === 12) hours = 0;
        
        return new Date(year, month, parseInt(day), hours, minutes);
        
    } catch (error) {
        return null;
    }
}

function isValidJOMatchLine(line) {
    // Validate that the line has proper JO tournament format
    if (!line || typeof line !== 'string' || line.trim().length === 0) {
        return false;
    }
    
    // Split by double spaces (field separator in JO format)
    const fields = line.split(/\s{2,}/);
    
    // Must have at least 6 fields: DATE, VENUE, TIME, TEAM1-ID=SCORE, TEAM2-ID=SCORE, CATEGORY
    if (fields.length < 6) {
        return false;
    }
    
    // Validate date format (should be like "19-Jul")
    const dateField = fields[0]?.trim();
    if (!dateField || !/^\d{1,2}-[A-Za-z]{3}$/.test(dateField)) {
        return false;
    }
    
    // Validate venue format (should be like "#5 SAN JUAN HILLS HS")
    const venueField = fields[1]?.trim();
    if (!venueField || !venueField.startsWith('#')) {
        return false;
    }
    
    // Validate time format (should be like "7:50 AM" or "7:50 PM")
    const timeField = fields[2]?.trim();
    if (!timeField || !/^\d{1,2}:\d{2}\s*(AM|PM)$/i.test(timeField)) {
        return false;
    }
    
    // Validate team 1 format - accept both formats:
    // Format 1: "22-LONGHORN=10" (with ID prefix)
    // Format 2: "OAHU=4" (team name only)
    const team1Field = fields[3]?.trim();
    if (!team1Field || !/^(\d+-[^=]+=.+|[^=]+=.+)$/.test(team1Field)) {
        return false;
    }
    
    // Validate team 2 format - accept both formats:
    const team2Field = fields[4]?.trim();
    if (!team2Field || !/^(\d+-[^=]+=.+|[^=]+=.+)$/.test(team2Field)) {
        return false;
    }
    
    // Category field should exist and not be empty
    const categoryField = fields[5]?.trim();
    if (!categoryField) {
        return false;
    }
    
    return true;
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