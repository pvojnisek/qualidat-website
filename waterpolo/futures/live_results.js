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
    
    // Get the latest 15 lines for testing purposes
    const latestResults = lines.slice(-15).reverse(); // Most recent first
    
    matchCount = latestResults.length;
    shoresCount = 0;
    
    const matchGrid = document.getElementById('matchGrid');
    matchGrid.innerHTML = '';

    if (latestResults.length === 0) {
        matchGrid.innerHTML = '<div class="empty-state">📭 No tournament results available at this time</div>';
        return;
    }

    latestResults.forEach((line, index) => {
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
                ${matchStatus ? `<span class="match-status status-${matchStatus.type}">${matchStatus.label}</span>` : ''}
            </div>
        </div>
        
        <div class="match-teams">
            <div class="team-info team-left">
                <div class="team-name ${matchData.team1.isShores ? 'shores-team' : ''}">${matchData.team1.name}</div>
            </div>
            <div class="score-center">
                ${matchData.team1.score !== null && matchData.team2.score !== null ?
                    `<span class="center-score-display">${matchData.team1.score} - ${matchData.team2.score}</span>` :
                    (matchData.team1.score !== null || matchData.team2.score !== null ?
                        `<span class="center-score-display">${matchData.team1.score !== null ? matchData.team1.score : '-'} - ${matchData.team2.score !== null ? matchData.team2.score : '-'}</span>` :
                        `<span class="vs-text-center">VS</span>`)
                }
            </div>
            <div class="team-info team-right">
                <div class="team-name ${matchData.team2.isShores ? 'shores-team' : ''}">${matchData.team2.name}</div>
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
            // Remove various prefixes: W#38-, E4(3rdB)-, D4(4thB)-, F3(3rdA)-, etc.
            teamName = teamName.replace(/^[A-Z]+#?\d*[\(\)A-Za-z0-9]*-/, '');
            // Remove tournament level suffixes: au=Gold, ag=Silver, pt=Platinum, sl=Silver, br=Bronze, gd=Gold
            teamName = teamName.replace(/\s+(au|ag|pt|sl|br|gd)$/, '');
            result.team1.name = teamName.trim();
            result.team1.score = team1Match[2];
        }
        
        // Parse team 2 and score (field 6)
        const team2Match = fields[6]?.match(/^(.+?)=(.+)$/);
        if (team2Match) {
            let teamName = team2Match[1];
            // Remove various prefixes: W#40-, E7(4thC)-, etc.
            teamName = teamName.replace(/^[A-Z]+#?\d*[\(\)A-Za-z0-9]*-/, '');
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
    
    if (upperLine.includes('HOT!') && isToday) {
        return { type: 'live', label: 'HOT! 🔥' };
    }
    if (upperLine.includes('LIVE') || upperLine.includes('PLAYING')) {
        return { type: 'live', label: 'LIVE' };
    }
    if (upperLine.includes('FINAL')) {
        return { type: 'completed', label: 'FINAL' };
    }
    if (upperLine.includes('UPCOMING') || upperLine.includes('SCHEDULED')) {
        return { type: 'upcoming', label: 'UPCOMING' };
    }
    // Return null for no status badge - removes RESULT tags
    return null;
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