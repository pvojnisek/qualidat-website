// Futures Super Finals 2025 - Live Results JavaScript
// Real-time tournament data streaming and display

let matchCount = 0;
let shoresCount = 0;
let refreshInterval = null;
let countdownInterval = null;
let nextRefreshTime = 0;

// CORS proxy configuration - ordered by speed (fastest first)
// Speed test results: CodeTabs 0.67s, ThingProxy 1.40s, AllOrigins FAILED
const KAHUNA_URL = 'https://feeds.kahunaevents.org/kahuna';
const PROXIES = [
    { name: 'CodeTabs', url: 'https://api.codetabs.com/v1/proxy/?quest=' },
    { name: 'ThingProxy', url: 'https://thingproxy.freeboard.io/fetch/' },
    { name: 'AllOrigins', url: 'https://api.allorigins.win/raw?url=' }
];

// SD Shores team detection patterns - more specific to avoid false positives
const SHORES_PATTERNS = [
    /\bsd shores\b/i,
    /\bsan diego shores\b/i,
    /\bshores black\b/i,
    /\bshores gold\b/i,
    /\bshores white\b/i,
    /\bshores blue\b/i,
    /\bshores red\b/i
];

// Super Finals dates (June 27-29, 2025)
const SUPER_FINALS_DATES = ['27-Jun', '28-Jun', '29-Jun'];

function filterSuperFinalsMatches(lines) {
    return lines.filter(line => {
        // Check if the line contains any of the Super Finals dates
        return SUPER_FINALS_DATES.some(date => line.includes(date));
    });
}

function deduplicateMatches(lines) {
    const seen = new Set();
    const uniqueLines = [];
    
    for (const line of lines) {
        // Create a unique identifier for each match
        const matchSignature = createMatchSignature(line);
        
        if (!seen.has(matchSignature)) {
            seen.add(matchSignature);
            uniqueLines.push(line);
        }
    }
    
    return uniqueLines;
}

function createMatchSignature(line) {
    // Parse the line to extract key identifying information
    const fields = line.split(/\s{2,}/);
    
    if (fields.length >= 7) {
        // Use game ID as primary identifier if available
        const gameId = fields[4]?.trim();
        if (gameId) {
            return gameId;
        }
        
        // Fallback: create signature from date + time + teams
        const date = fields[1]?.trim() || '';
        const time = fields[3]?.trim() || '';
        const team1 = fields[5]?.split('=')[0] || '';
        const team2 = fields[6]?.split('=')[0] || '';
        
        return `${date}_${time}_${team1}_${team2}`;
    }
    
    // Last resort: use the entire line (but trim whitespace)
    return line.trim();
}

function applyActiveFilters(lines) {
    const filter14U = document.getElementById('filter14U')?.checked || false;
    const filter16U = document.getElementById('filter16U')?.checked || false;
    const filter18U = document.getElementById('filter18U')?.checked || false;
    const filterBoys = document.getElementById('filterBoys')?.checked || false;
    const filterGirls = document.getElementById('filterGirls')?.checked || false;
    const filterShores = document.getElementById('filterShores')?.checked || false;
    
    let filteredLines = lines;
    
    // Apply age group filters (OR logic for age groups)
    const hasAgeFilters = filter14U || filter16U || filter18U;
    if (hasAgeFilters) {
        filteredLines = filteredLines.filter(line => {
            const matches14U = filter14U && (line.includes('14U_BOYS') || line.includes('14U BOYS') || line.includes('14U_GIRLS') || line.includes('14U GIRLS'));
            const matches16U = filter16U && (line.includes('16U_BOYS') || line.includes('16U BOYS') || line.includes('16U_GIRLS') || line.includes('16U GIRLS'));
            const matches18U = filter18U && (line.includes('18U_BOYS') || line.includes('18U BOYS') || line.includes('18U_GIRLS') || line.includes('18U GIRLS'));
            return matches14U || matches16U || matches18U;
        });
    }
    
    // Apply gender filters (OR logic for genders)
    const hasGenderFilters = filterBoys || filterGirls;
    if (hasGenderFilters) {
        filteredLines = filteredLines.filter(line => {
            const matchesBoys = filterBoys && (line.includes('_BOYS') || line.includes(' BOYS'));
            const matchesGirls = filterGirls && (line.includes('_GIRLS') || line.includes(' GIRLS'));
            return matchesBoys || matchesGirls;
        });
    }
    
    // Apply Shores filter
    if (filterShores) {
        filteredLines = filteredLines.filter(line => 
            detectShoresTeam(line)
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
    // Parse team names from the line
    const matchData = parseMatchLine(line);
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
    console.log('🔄 Loading live tournament results...');
    updateStatus('loading', 'Fetching latest results...');

    try {
        const data = await fetchViaProxy();
        if (data) {
            displayMatchResults(data);
            updateStatus('success', 'Results loaded successfully');
            updateLastRefreshTime();
        } else {
            throw new Error('No data received from tournament feed');
        }
    } catch (error) {
        console.error('❌ Failed to load results:', error);
        updateStatus('error', 'Failed to load results');
        showError(error.message);
    }
}

async function fetchViaProxy() {
    for (const proxy of PROXIES) {
        try {
            console.log(`🔄 Trying ${proxy.name} for tournament data...`);
            updateStatus('loading', `Connecting via ${proxy.name}...`);

            const proxyUrl = proxy.name === 'ThingProxy' 
                ? proxy.url + KAHUNA_URL
                : proxy.url + encodeURIComponent(KAHUNA_URL);

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
            console.log(`✅ ${proxy.name} successful, data length: ${text.length}`);
            return text;

        } catch (error) {
            console.warn(`❌ ${proxy.name} failed:`, error.message);
            continue;
        }
    }
    return null;
}

function displayMatchResults(data) {
    const lines = data.split('\n').filter(line => line.trim());
    
    // Remove duplicate entries from source data
    const uniqueLines = deduplicateMatches(lines);
    
    // Process ALL lines first (don't limit to 50 yet)
    // Filter for Super Finals dates (June 27-29, 2025)
    const superFinalsResults = filterSuperFinalsMatches(uniqueLines);
    
    // Apply additional filters based on checkboxes
    const allFilteredResults = applyActiveFilters(superFinalsResults);
    
    // FINALLY limit to 50 matches for display (after all filtering)
    const filteredResults = allFilteredResults.slice(0, 50);
    
    matchCount = filteredResults.length;
    shoresCount = 0;
    
    const matchGrid = document.getElementById('matchGrid');
    matchGrid.innerHTML = '';

    if (filteredResults.length === 0) {
        matchGrid.innerHTML = '<div class="empty-state">📭 No tournament results match the current filters</div>';
        return;
    }

    filteredResults.forEach((line, index) => {
        const isShoresMatch = detectShoresTeam(line);
        if (isShoresMatch) shoresCount++;
        
        const matchCard = createMatchCard(line, index + 1, isShoresMatch);
        matchGrid.appendChild(matchCard);
    });

    // Update stats
    document.getElementById('matchCount').textContent = matchCount;
    document.getElementById('shoresCount').textContent = shoresCount;
}

function detectShoresTeam(line) {
    return SHORES_PATTERNS.some(pattern => pattern.test(line));
}

function createMatchCard(line, cardNumber, isShoresMatch) {
    const matchDiv = document.createElement('div');
    matchDiv.className = `match-card ${isShoresMatch ? 'shores-highlight' : ''}`;
    matchDiv.style.animationDelay = `${cardNumber * 0.1}s`;
    
    // Parse match data (basic parsing for display)
    const matchData = parseMatchLine(line);
    const matchStatus = detectMatchStatus(line);
    
    // Determine winner
    let team1Winner = false;
    let team2Winner = false;
    
    if (matchData.team1.score !== null && matchData.team2.score !== null) {
        const score1 = parseFloat(matchData.team1.score);
        const score2 = parseFloat(matchData.team2.score);
        if (score1 > score2) team1Winner = true;
        else if (score2 > score1) team2Winner = true;
        // Tie: no winner
    }
    
    // Get current search term for highlighting
    const searchTerm = document.getElementById('customTeamSearch')?.value?.trim() || '';
    
    // Generate team names with highlighting
    const team1Html = highlightSearchText(matchData.team1.name, searchTerm);
    const team2Html = highlightSearchText(matchData.team2.name, searchTerm);
    
    matchDiv.innerHTML = `
        <div class="match-header">
            <div class="match-info-left">
                <div class="tournament-bracket-row">
                    <span class="match-number">${isShoresMatch ? '🌊 ' : ''}${matchData.gameId ? matchData.gameId : `#${cardNumber}`}</span>
                    ${matchData.division ? `<span class="tournament-info">🏆 ${matchData.division}</span>` : ''}
                    ${matchData.placement ? `<span class="bracket-info">📊 ${matchData.placement}</span>` : ''}
                </div>
            </div>
            <div class="match-info-right">
                ${(matchData.date || matchData.time) ? `<div class="datetime-combined">📅 ${matchData.date || ''} ${matchData.time ? `⏰ ${matchData.time}` : ''}</div>` : ''}
                ${matchStatus ? `<span class="match-status status-${matchStatus.type}">${matchStatus.label}</span>` : ''}
            </div>
        </div>
        
        <div class="match-teams">
            <div class="teams-row">
                <div class="team-info team-left">
                    <div class="team-name ${matchData.team1.isShores ? 'shores-team' : ''} ${team1Winner ? 'winner' : ''}" onclick="selectTeam('${escapeHtml(matchData.team1.name).replace(/'/g, "\\'")}')">${team1Html}</div>
                </div>
                <div class="team-info team-right">
                    <div class="team-name ${matchData.team2.isShores ? 'shores-team' : ''} ${team2Winner ? 'winner' : ''}" onclick="selectTeam('${escapeHtml(matchData.team2.name).replace(/'/g, "\\'")}')">${team2Html}</div>
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
                ${matchData.venue ? `<span class="meta-item">📍 ${matchData.venue}</span>` : ''}
                ${matchData.date ? `<span class="meta-item">📅 ${matchData.date}</span>` : ''}
                ${matchData.division ? `<span class="meta-item division">🏆 ${matchData.division}</span>` : ''}
                ${matchData.placement ? `<span class="meta-item placement">🎯 ${matchData.placement}</span>` : ''}
                ${matchData.gameId ? `<span class="meta-item game-id">Game: ${matchData.gameId}</span>` : ''}
            </div>
        </div>
        
        <div class="raw-data">${escapeHtml(line)}</div>
    `;
    
    return matchDiv;
}

function parseMatchLine(line) {
    // Parse Kahuna Events format: HOT! RESULT DIVISION  DATE  VENUE  TIME  GAME_ID  TEAM1=SCORE1  TEAM2=SCORE2  PLACEMENT
    const result = {
        team1: { name: 'Team A', score: null, isShores: false },
        team2: { name: 'Team B', score: null, isShores: false },
        time: null,
        venue: null,
        division: null,
        date: null,
        gameId: null,
        placement: null,
        status: 'RESULT'
    };

    // Split by double spaces (field separator in Kahuna format)
    const fields = line.split(/\s{2,}/);
    
    if (fields.length >= 8) {
        // Field structure: [0]HOT! RESULT DIVISION [1]DATE [2]VENUE [3]TIME [4]GAME_ID [5]TEAM1=SCORE [6]TEAM2=SCORE [7]PLACEMENT
        
        // Parse division from first field
        const divisionMatch = fields[0].match(/RESULT\s+(.+)$/);
        if (divisionMatch) {
            result.division = divisionMatch[1];
        }
        
        // Parse date (field 1)
        result.date = fields[1]?.trim();
        
        // Parse venue (field 2)
        result.venue = fields[2]?.trim();
        
        // Parse time (field 3)
        result.time = fields[3]?.trim();
        
        // Parse game ID (field 4)
        result.gameId = fields[4]?.trim();
        
        // Parse team 1 and score (field 5)
        const team1Match = fields[5]?.match(/^(.+?)=(.+)$/);
        if (team1Match) {
            let teamName = team1Match[1];
            // Remove various prefixes: W#38-, E4(3rdB)-, D4(4thB)-, F3(3rdA)-, 2ndA(L#6)-, etc.
            teamName = teamName.replace(/^[A-Za-z0-9]+[\(\)A-Za-z0-9#]*-/, '');
            // Remove tournament level suffixes: au=Gold, ag=Silver, pt=Platinum, sl=Silver, br=Bronze, gd=Gold
            teamName = teamName.replace(/\s+(au|ag|pt|sl|br|gd)$/, '');
            result.team1.name = teamName.trim();
            result.team1.score = team1Match[2];
        }
        
        // Parse team 2 and score (field 6)
        const team2Match = fields[6]?.match(/^(.+?)=(.+)$/);
        if (team2Match) {
            let teamName = team2Match[1];
            // Remove various prefixes: W#40-, E7(4thC)-, 2ndA(L#6)-, etc.
            teamName = teamName.replace(/^[A-Za-z0-9]+[\(\)A-Za-z0-9#]*-/, '');
            // Remove tournament level suffixes: au=Gold, ag=Silver, pt=Platinum, sl=Silver, br=Bronze, gd=Gold
            teamName = teamName.replace(/\s+(au|ag|pt|sl|br|gd)$/, '');
            result.team2.name = teamName.trim();
            result.team2.score = team2Match[2];
        }
        
        // Parse placement (field 7)
        result.placement = fields[7]?.trim();
        
        // Check if teams are Shores
        result.team1.isShores = detectShoresTeam(result.team1.name);
        result.team2.isShores = detectShoresTeam(result.team2.name);
        
        // Determine status from line
        if (line.includes('HOT!')) {
            result.status = 'HOT';
        } else if (line.includes('LIVE')) {
            result.status = 'LIVE';
        } else {
            result.status = 'RESULT';
        }
    }

    return result;
}

function detectMatchStatus(line) {
    const upperLine = line.toUpperCase();
    
    // Check if this is today's match for HOT! label
    const today = new Date();
    const todayString = today.toLocaleDateString('en-US', { 
        day: 'numeric', 
        month: 'short' 
    }).replace(' ', '-'); // Format: "25-Jun"
    
    const isToday = line.includes(todayString);
    
    // Enhanced HOT! detection: Original HOT! OR matches from last 2 hours
    const isRecentMatch = isMatchFromLastHour(line);
    
    if ((upperLine.includes('HOT!') && isToday) || isRecentMatch) {
        return { type: 'live', label: 'HOT! 🔥' };
    }
    if (upperLine.includes('FINAL')) {
        return { type: 'completed', label: 'FINAL' };
    }
    if (upperLine.includes('UPCOMING') || upperLine.includes('SCHEDULED')) {
        return { type: 'upcoming', label: 'UPCOMING' };
    }
    
    // Check for penalty/incident notifications
    if (upperLine.includes('RED CARD') || upperLine.includes('PENALTY') || upperLine.includes('INCIDENT')) {
        return { type: 'live', label: 'INCIDENT ⚠️' };
    }
    
    // Return null for no status badge - removes RESULT tags
    return null;
}

function isMatchFromLastHour(line) {
    try {
        // Parse Kahuna format: HOT! RESULT DIVISION  DATE  VENUE  TIME  ...
        const fields = line.split(/\s{2,}/);
        
        if (fields.length < 4) return false;
        
        const dateStr = fields[1]?.trim(); // "27-Jun"
        const timeStr = fields[3]?.trim(); // "12:00 PM"
        
        if (!dateStr || !timeStr) return false;
        
        // Parse the match date and time
        const currentYear = new Date().getFullYear();
        const matchDateTime = parseKahunaDateTime(dateStr, timeStr, currentYear);
        
        if (!matchDateTime) return false;
        
        // Check if match was within the last 2 hours
        const now = new Date();
        const twoHoursAgo = new Date(now.getTime() - (2 * 60 * 60 * 1000));
        
        return matchDateTime >= twoHoursAgo && matchDateTime <= now;
        
    } catch (error) {
        console.warn('Error parsing match time:', error);
        return false;
    }
}

function parseKahunaDateTime(dateStr, timeStr, year) {
    try {
        // Parse date like "27-Jun"
        const [day, monthName] = dateStr.split('-');
        const monthMap = {
            'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
            'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
        };
        
        const month = monthMap[monthName];
        if (month === undefined) return null;
        
        // Parse time like "12:00 PM"
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
    badge.className = `status-badge status-${type}`;
    badge.innerHTML = type === 'loading' 
        ? `<span class="spinner"></span> ${message}`
        : message;
}

function showError(message) {
    const matchGrid = document.getElementById('matchGrid');
    matchGrid.innerHTML = `
        <div class="empty-state">
            ❌ Error loading tournament results<br>
            <small style="margin-top: 10px; display: block; color: #dc3545;">${escapeHtml(message)}</small>
            <small style="margin-top: 10px; display: block;">Will retry automatically in next refresh cycle...</small>
        </div>
    `;
}

function updateLastRefreshTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    document.getElementById('lastUpdate').textContent = timeString;
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
    
    if (remaining > 0) {
        document.getElementById('countdown').textContent = 
            `${minutes}:${seconds.toString().padStart(2, '0')}`;
    } else {
        document.getElementById('countdown').textContent = 'Refreshing...';
        nextRefreshTime = Date.now() + (3 * 60 * 1000);
    }
}

// Initialize the page
window.addEventListener('load', () => {
    console.log('🚀 Futures Super Finals Live Results page loaded');
    setupCustomSearchListeners();
    loadLiveResults();
    startRefreshCycle();
});

// Handle page visibility changes for better performance
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        // Page became visible, refresh if it's been more than 1 minute
        const timeSinceRefresh = Date.now() - (nextRefreshTime - (3 * 60 * 1000));
        if (timeSinceRefresh > 60000) {
            console.log('🔄 Page visible again, refreshing results...');
            loadLiveResults();
            startRefreshCycle();
        }
    }
});