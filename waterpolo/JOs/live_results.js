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

// CORS proxy configuration - ordered by speed (fastest first)
const JO_URL = 'https://feeds.kahunaevents.org/joboys16u.php';
const PROXIES = [
    { name: 'CodeTabs', url: 'https://api.codetabs.com/v1/proxy/?quest=' },
    { name: 'ThingProxy', url: 'https://thingproxy.freeboard.io/fetch/' },
    { name: 'AllOrigins', url: 'https://api.allorigins.win/raw?url=' }
];

// SD Shores team detection patterns for JO format - more specific to avoid false positives
const SHORES_PATTERNS = [
    /\bsd shores\b/i,
    /\bsan diego shores\b/i,
    /\bshores black\b/i,
    /\bshores gold\b/i,
    /\bshores white\b/i,
    /\bshores blue\b/i,
    /\bshores red\b/i,
    /\d+-shores/i,                    // JO format: "22-SHORES"
    /\d+-san diego shores/i,          // JO format: "22-SAN DIEGO SHORES"
    /\d+-sd shores/i                  // JO format: "22-SD SHORES"
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

function applyFilters() {
    // Re-run the display with current data to apply new filters
    const statusBadge = document.getElementById('statusBadge');
    if (statusBadge && !statusBadge.classList.contains('status-loading')) {
        // Only re-filter if we have data loaded
        loadLiveResults();
    }
}

function applyCustomTeamFilter(line, searchTerm) {
    // Parse team names from the JO line
    const matchData = parseJOMatchLine(line);
    const team1Name = matchData.team1.name.toLowerCase();
    const team2Name = matchData.team2.name.toLowerCase();
    const search = searchTerm.toLowerCase();
    
    // Return true if either team name contains the search term
    return team1Name.includes(search) || team2Name.includes(search);
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
    const lines = data.split('\n').filter(line => line.trim() && !line.startsWith('#'));
    
    // Filter out invalid/malformed match lines
    const validLines = lines.filter(line => isValidJOMatchLine(line));
    const invalidCount = lines.length - validLines.length;
    
    // Log filtering results for debugging
    if (invalidCount > 0) {
        console.log(`🧹 Filtered out ${invalidCount} invalid/malformed rows from JO data`);
        console.log(`✅ Processing ${validLines.length} valid match rows`);
    }
    
    // Remove duplicate entries from source data
    const uniqueLines = deduplicateMatches(validLines);
    
    // Apply filters based on checkboxes
    const allFilteredResults = applyActiveFilters(uniqueLines);
    
    // FINALLY limit to 50 matches for display (after all filtering)
    const filteredResults = allFilteredResults.slice(0, 50);
    
    matchCount = filteredResults.length;
    shoresCount = 0;
    venueCount = 0;
    
    // Count venues in use
    const venuesInUse = new Set();
    
    const matchGrid = document.getElementById('matchGrid');
    if (!matchGrid) return; // Null check for test environments
    
    matchGrid.innerHTML = '';
    if (filteredResults.length === 0) {
        matchGrid.innerHTML = '<div class="empty-state">📭 No JO tournament results match the current filters</div>';
        return;
    }

    filteredResults.forEach((line, index) => {
        const isShoresMatch = detectShoresTeam(line);
        if (isShoresMatch) shoresCount++;
        
        // Extract venue for counting
        const venueMatch = line.match(/#(\d+)/);
        if (venueMatch) {
            venuesInUse.add(venueMatch[1]);
        }
        
        const matchCard = createJOMatchCard(line, index, isShoresMatch);
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
    
    matchDiv.innerHTML = `
        <div class="match-header">
            <div class="match-info-left">
                ${matchData.venue ? `<span class="venue-info">${matchData.venue}</span>` : ''}
                ${matchData.category ? `<span class="tournament-info">${matchData.category}</span>` : ''}
            </div>
            <div class="match-info-right">
                ${matchData.time ? `<span class="datetime-combined">⏰ ${matchData.time}</span>` : ''}
                ${matchStatus ? `<span class="match-status status-${matchStatus.type}">${matchStatus.label}</span>` : ''}
            </div>
        </div>
        
        <div class="match-teams">
            <div class="teams-row">
                <div class="team-info team-left">
                    <div class="team-name ${matchData.team1.isShores ? 'shores-team' : ''} ${team1Winner ? 'winner' : ''}" onclick="selectTeam('${escapeHtml(matchData.team1.name).replace(/'/g, "\\'")}')">${matchData.team1.prefix ? `<span class="team-prefix">${matchData.team1.prefix}-</span>` : ''}${team1Html}</div>
                </div>
                <div class="team-info team-right">
                    <div class="team-name ${matchData.team2.isShores ? 'shores-team' : ''} ${team2Winner ? 'winner' : ''}" onclick="selectTeam('${escapeHtml(matchData.team2.name).replace(/'/g, "\\'")}')">${matchData.team2.prefix ? `<span class="team-prefix">${matchData.team2.prefix}-</span>` : ''}${team2Html}</div>
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
            </div>
        </div>
        
        <div class="raw-data">${escapeHtml(line)}</div>
    `;
    
    return matchDiv;
}

function parseJOMatchLine(line) {
    // Parse JO format: "19-Jul  #5 SAN JUAN HILLS HS  7:50 AM  22-LONGHORN=10  27-CT PREMIER=14  16U_BOYS_CHAMPIONSHIP"
    const result = {
        team1: { name: 'Team A', score: null, isShores: false, prefix: null },
        team2: { name: 'Team B', score: null, isShores: false, prefix: null },
        time: null,
        venue: null,
        date: null,
        category: null
    };

    // Split by double spaces (field separator in JO format)
    const fields = line.split(/\s{2,}/);
    
    if (fields.length >= 6) {
        // Field structure: [0]DATE [1]VENUE [2]TIME [3]TEAM1-PREFIX=SCORE [4]TEAM2-PREFIX=SCORE [5]CATEGORY
        
        // Parse date (field 0)
        result.date = fields[0]?.trim();
        
        // Parse venue (field 1)
        result.venue = fields[1]?.trim();
        
        // Parse time (field 2)
        result.time = fields[2]?.trim();
        
        // Parse team 1 and score (field 3) - format: "22-LONGHORN=10"
        const team1Match = fields[3]?.match(/^(\d+)-(.+?)=(.+)$/);
        if (team1Match) {
            result.team1.prefix = team1Match[1];
            result.team1.name = team1Match[2].trim();
            result.team1.score = team1Match[3];
        }
        
        // Parse team 2 and score (field 4) - format: "27-CT PREMIER=14"
        const team2Match = fields[4]?.match(/^(\d+)-(.+?)=(.+)$/);
        if (team2Match) {
            result.team2.prefix = team2Match[1];
            result.team2.name = team2Match[2].trim();
            result.team2.score = team2Match[3];
        }
        
        // Parse category (field 5)
        result.category = fields[5]?.trim();
        
        // Check if teams are Shores
        result.team1.isShores = detectShoresTeam(result.team1.name) || detectShoresTeam(fields[3] || '');
        result.team2.isShores = detectShoresTeam(result.team2.name) || detectShoresTeam(fields[4] || '');
    }

    return result;
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
    
    // Enhanced live detection: matches from last 2 hours
    const isRecentMatch = isJOMatchFromLastHour(line);
    
    if (isRecentMatch && isToday) {
        return { type: 'live', label: 'LIVE 🔥' };
    }
    if (isRecentMatch) {
        return { type: 'recent', label: 'RECENT' };
    }
    if (upperLine.includes('CHAMPIONSHIP')) {
        return { type: 'championship', label: 'CHAMPIONSHIP' };
    }
    
    // Return null for no status badge
    return null;
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
    
    // Validate team 1 format (should be like "22-LONGHORN=10")
    const team1Field = fields[3]?.trim();
    if (!team1Field || !/^\d+-[^=]+=.+$/.test(team1Field)) {
        return false;
    }
    
    // Validate team 2 format (should be like "27-CT PREMIER=14")
    const team2Field = fields[4]?.trim();
    if (!team2Field || !/^\d+-[^=]+=.+$/.test(team2Field)) {
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