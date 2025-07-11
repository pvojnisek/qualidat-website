// Interactive JavaScript functionality for tournament pages
// Contains: team click handlers, modals, popups, statistics calculation

// Set up team click handlers for interactive elements
function setupTeamClickHandlers() {
    // Handle group stage team clicks
    const clickableTeams = document.querySelectorAll('.clickable-team');
    clickableTeams.forEach(teamElement => {
        teamElement.addEventListener('click', function() {
            const teamName = this.dataset.team;
            const groupName = this.dataset.group;
            showTeamMatches(teamName, groupName);
        });
    });

    // Handle re-bracket clicks
    const clickableRebrackets = document.querySelectorAll('.clickable-rebracket');
    clickableRebrackets.forEach(rebracketElement => {
        rebracketElement.addEventListener('click', function() {
            const bracket = this.dataset.bracket;
            const position = this.dataset.position;
            showRebracketMatches(bracket, position);
        });
    });

    // Handle final tournament results team clicks
    const clickableFinalTeams = document.querySelectorAll('.clickable-final-team');
    clickableFinalTeams.forEach(teamElement => {
        teamElement.addEventListener('click', function() {
            const teamName = this.dataset.team;
            showAllTeamMatches(teamName);
        });
        
        // Add hover effects for better UX
        teamElement.addEventListener('mouseenter', function() {
            this.style.backgroundColor = 'rgba(0, 119, 190, 0.1)';
            this.style.transform = 'scale(1.02)';
        });
        
        teamElement.addEventListener('mouseleave', function() {
            this.style.backgroundColor = '';
            this.style.transform = 'scale(1)';
        });
    });
}

function showTeamMatches(teamName, groupName) {
    if (!tournamentData || !tournamentData.matches) {
        console.error('Tournament data not available');
        return;
    }

    // Filter matches for this team
    const teamMatches = tournamentData.matches.filter(match => 
        match.team1 === teamName || match.team2 === teamName
    );

    if (teamMatches.length === 0) {
        alert(`No matches found for ${teamName}`);
        return;
    }

    // Create and show popup
    createMatchPopup(teamName, groupName, teamMatches);
}

function showAllTeamMatches(teamName) {
    if (!tournamentData || !tournamentData.matches) {
        console.error('Tournament data not available');
        return;
    }

    // Filter matches for this team throughout the entire tournament
    const teamMatches = tournamentData.matches.filter(match => 
        match.team1 === teamName || match.team2 === teamName
    );

    if (teamMatches.length === 0) {
        alert(`No matches found for ${teamName}`);
        return;
    }

    // Create and show tournament-wide popup
    createAllMatchesPopup(teamName, teamMatches);
}

function showRebracketMatches(bracket, position) {
    if (!tournamentData || !tournamentData.matches || !tournamentData.re_bracket) {
        console.error('Tournament data not available');
        return;
    }

    // Get the actual team name from the re_bracket data
    const bracketIndex = parseInt(position) - 1;
    const actualTeamName = tournamentData.re_bracket[bracket][bracketIndex];
    
    if (!actualTeamName) {
        console.error('Team not found for bracket position');
        return;
    }

    // Create the re-bracket team identifier (e.g., "AA1", "BB2", etc.)
    const bracketTeam = bracket + position;
    
    // Filter matches for this team in all phases
    const teamMatches = tournamentData.matches.filter(match => 
        match.team1 === actualTeamName || match.team2 === actualTeamName
    );

    // Also filter matches that use bracket identifiers (for re-bracket games)
    const bracketMatches = tournamentData.matches.filter(match => 
        match.team1 === bracketTeam || match.team2 === bracketTeam
    );

    // Combine all matches
    const allMatches = [...teamMatches, ...bracketMatches];

    if (allMatches.length === 0) {
        // Show info popup explaining the bracket system
        showBracketInfoPopup(bracket, position);
        return;
    }

    // Create and show popup
    const bracketName = `${bracket}${position} - ${actualTeamName}`;
    createRebracketMatchPopup(actualTeamName, bracketName, allMatches, bracket, position);
}

function showBracketInfoPopup(bracket, position) {
    // Remove existing popup if any
    const existingPopup = document.getElementById('team-match-popup');
    if (existingPopup) {
        existingPopup.remove();
    }

    const bracketDescriptions = {
        'AA': 'Championship Bracket (Places 1-4)',
        'BB': 'Classic Bracket (Places 5-8)', 
        'CC': 'Invitational Bracket (Places 9-12)',
        'DD': 'Participation Bracket (Places 13-16)'
    };

    const positionDescriptions = {
        '1': 'Group A Winner',
        '2': 'Group B Winner', 
        '3': 'Group C Winner',
        '4': 'Group D Winner'
    };

    if (bracket === 'BB') {
        positionDescriptions['1'] = 'Group A Runner-up';
        positionDescriptions['2'] = 'Group B Runner-up';
        positionDescriptions['3'] = 'Group C Runner-up';
        positionDescriptions['4'] = 'Group D Runner-up';
    } else if (bracket === 'CC') {
        positionDescriptions['1'] = 'Group A 3rd Place';
        positionDescriptions['2'] = 'Group B 3rd Place';
        positionDescriptions['3'] = 'Group C 3rd Place';
        positionDescriptions['4'] = 'Group D 3rd Place';
    } else if (bracket === 'DD') {
        positionDescriptions['1'] = 'Group A 4th Place';
        positionDescriptions['2'] = 'Group B 4th Place';
        positionDescriptions['3'] = 'Group C 4th Place';
        positionDescriptions['4'] = 'Group D 4th Place';
    }

    // Create popup overlay
    const popupOverlay = document.createElement('div');
    popupOverlay.id = 'team-match-popup';
    popupOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        animation: fadeIn 0.3s ease-in-out;
    `;

    // Create popup content
    const popupContent = document.createElement('div');
    popupContent.style.cssText = `
        background: white;
        border-radius: 12px;
        max-width: 500px;
        padding: 0;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        position: relative;
        animation: slideIn 0.3s ease-in-out;
    `;

    popupContent.innerHTML = `
        <div style="
            background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
            color: white;
            padding: 20px;
            border-radius: 12px 12px 0 0;
            position: relative;
        ">
            <h2 style="margin: 0; font-size: 1.5rem;">🏆 ${bracketDescriptions[bracket]}</h2>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">Position ${bracket}${position} • ${positionDescriptions[position]}</p>
            <button id="close-popup" style="
                position: absolute;
                top: 15px;
                right: 15px;
                background: rgba(255,255,255,0.2);
                border: none;
                color: white;
                width: 30px;
                height: 30px;
                border-radius: 50%;
                cursor: pointer;
                font-size: 18px;
                display: flex;
                align-items: center;
                justify-content: center;
            ">×</button>
        </div>
        <div style="padding: 20px;">
            <h3 style="color: #ff9800; margin: 0 0 15px 0;">Re-bracket System</h3>
            <p style="margin: 0 0 15px 0; color: #666; line-height: 1.6;">
                After group stage completion, teams are re-seeded based on their group placement into four competitive brackets:
            </p>
            <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 10px; font-size: 0.9rem;">
                    <div style="font-weight: bold; color: #ff9800;">AA Bracket:</div>
                    <div>1st place teams (Championship)</div>
                    <div style="font-weight: bold; color: #2196f3;">BB Bracket:</div>
                    <div>2nd place teams (Classic)</div>
                    <div style="font-weight: bold; color: #4caf50;">CC Bracket:</div>
                    <div>3rd place teams (Invitational)</div>
                    <div style="font-weight: bold; color: #9c27b0;">DD Bracket:</div>
                    <div>4th place teams (Participation)</div>
                </div>
            </div>
            <p style="margin: 0; color: #666; font-size: 0.9rem; font-style: italic;">
                This position will be filled by the ${positionDescriptions[position].toLowerCase()} once group stage is completed.
            </p>
        </div>
    `;

    popupOverlay.appendChild(popupContent);
    document.body.appendChild(popupOverlay);

    // Add event listeners
    document.getElementById('close-popup').addEventListener('click', closeMatchPopup);
    popupOverlay.addEventListener('click', function(e) {
        if (e.target === popupOverlay) {
            closeMatchPopup();
        }
    });

    // Add escape key listener
    const escapeHandler = function(e) {
        if (e.key === 'Escape') {
            closeMatchPopup();
            document.removeEventListener('keydown', escapeHandler);
        }
    };
    document.addEventListener('keydown', escapeHandler);
}

function createRebracketMatchPopup(teamName, bracketName, matches, bracket, position) {
    // Remove existing popup if any
    const existingPopup = document.getElementById('team-match-popup');
    if (existingPopup) {
        existingPopup.remove();
    }

    // Create popup overlay
    const popupOverlay = document.createElement('div');
    popupOverlay.id = 'team-match-popup';
    popupOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        animation: fadeIn 0.3s ease-in-out;
    `;

    // Create popup content
    const popupContent = document.createElement('div');
    popupContent.style.cssText = `
        background: white;
        border-radius: 12px;
        max-width: 90%;
        max-height: 90%;
        overflow-y: auto;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        position: relative;
        animation: slideIn 0.3s ease-in-out;
    `;

    // Determine bracket color
    const bracketColors = {
        'AA': '#ff9800', // Orange for championship
        'BB': '#2196f3', // Blue for classic
        'CC': '#4caf50', // Green for invitational
        'DD': '#9c27b0'  // Purple for participation
    };
    const bracketColor = bracketColors[bracket] || '#0077be';

    // Create header
    const header = document.createElement('div');
    header.style.cssText = `
        background: linear-gradient(135deg, ${bracketColor} 0%, ${bracketColor}cc 100%);
        color: white;
        padding: 20px;
        border-radius: 12px 12px 0 0;
        position: relative;
    `;

    // Calculate upcoming matches
    const bracketTeam = bracket + position;
    const upcomingBracketMatches = tournamentData.matches.filter(match => 
        (match.team1 === bracketTeam || match.team2 === bracketTeam) && 
        match.status === 'SCHEDULED'
    );

    header.innerHTML = `
        <h2 style="margin: 0; font-size: 1.5rem;">🏆 ${teamName}</h2>
        <p style="margin: 5px 0 0 0; opacity: 0.9;">${bracketName} • ${matches.length} total matches</p>
        ${upcomingBracketMatches.length > 0 ? 
            `<p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 0.9rem;">⏰ ${upcomingBracketMatches.length} upcoming re-bracket matches</p>` : 
            ''}
        <button id="close-popup" style="
            position: absolute;
            top: 15px;
            right: 15px;
            background: rgba(255,255,255,0.2);
            border: none;
            color: white;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
        ">×</button>
    `;

    // Create matches content
    const matchesContent = document.createElement('div');
    matchesContent.style.cssText = `
        padding: 20px;
        max-height: 400px;
        overflow-y: auto;
    `;

    // Group matches by phase
    const groupedMatches = {};
    matches.forEach(match => {
        const phase = match.phase;
        if (!groupedMatches[phase]) {
            groupedMatches[phase] = [];
        }
        groupedMatches[phase].push(match);
    });

    // Add upcoming re-bracket matches info
    if (upcomingBracketMatches.length > 0) {
        if (!groupedMatches['Re-bracket']) {
            groupedMatches['Re-bracket'] = [];
        }
        upcomingBracketMatches.forEach(match => {
            // Don't duplicate if already in the list
            if (!groupedMatches['Re-bracket'].find(m => m.game_number === match.game_number)) {
                groupedMatches['Re-bracket'].push(match);
            }
        });
    }

    // Generate matches HTML
    let matchesHTML = '';
    
    // Sort phases to show group stage first, then re-bracket
    const phaseOrder = ['Group A', 'Group B', 'Group C', 'Group D', 'Re-bracket AA', 'Re-bracket BB', 'Re-bracket CC', 'Re-bracket DD', 'Re-bracket', 'Championship'];
    const sortedPhases = Object.keys(groupedMatches).sort((a, b) => {
        const aIndex = phaseOrder.indexOf(a);
        const bIndex = phaseOrder.indexOf(b);
        if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
    });

    sortedPhases.forEach(phase => {
        matchesHTML += `
            <div style="margin-bottom: 20px;">
                <h3 style="color: ${bracketColor}; margin: 0 0 10px 0; padding-bottom: 5px; border-bottom: 2px solid #e3f2fd;">${phase}</h3>
        `;
        
        groupedMatches[phase].forEach(match => {
            const isTeam1 = match.team1 === teamName;
            const opponent = isTeam1 ? match.team2 : match.team1;
            const teamScore = isTeam1 ? match.score1 : match.score2;
            const opponentScore = isTeam1 ? match.score2 : match.score1;
            
            let scoreDisplay = '- vs -';
            let resultClass = '';
            let resultIcon = '';
            
            if (teamScore !== null && opponentScore !== null) {
                scoreDisplay = `${teamScore}-${opponentScore}`;
                if (teamScore > opponentScore) {
                    resultClass = 'win';
                    resultIcon = '🏆';
                } else if (teamScore < opponentScore) {
                    resultClass = 'loss';
                    resultIcon = '❌';
                } else {
                    resultClass = 'tie';
                    resultIcon = '🤝';
                }
            }

            const statusColor = match.status === 'SCHEDULED' ? '#1976d2' : 
                               match.status === 'OPT OUT' ? '#d32f2f' : 
                               match.status === 'NO CONTEST' ? '#ff9800' : '#2e7d32';

            // Add video links if available
            let videoHTML = '';
            if (match.videos && match.videos.length > 0) {
                videoHTML = `
                    <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #eee;">
                        <div style="font-weight: bold; margin-bottom: 8px; color: #dc2626; font-size: 0.9rem;">🎥 Videos:</div>
                        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                            ${match.videos.map(video => 
                                `<a href="${video.url}" target="_blank" style="
                                    display: inline-block; 
                                    padding: 6px 12px; 
                                    background: #dc2626; 
                                    color: white; 
                                    text-decoration: none; 
                                    border-radius: 6px; 
                                    font-size: 0.8rem; 
                                    font-weight: bold;
                                " onmouseover="this.style.background='#b91c1c'" onmouseout="this.style.background='#dc2626'">${video.quarter}</a>`
                            ).join('')}
                        </div>
                    </div>
                `;
            }

            matchesHTML += `
                <div style="
                    background: ${resultClass === 'win' ? '#e8f5e8' : resultClass === 'loss' ? '#ffeaea' : '#f9f9f9'};
                    border: 1px solid ${resultClass === 'win' ? '#4caf50' : resultClass === 'loss' ? '#f44336' : '#ddd'};
                    border-radius: 8px;
                    padding: 12px;
                    margin-bottom: 8px;
                ">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                        <div style="flex: 1;">
                            <div style="font-weight: bold; color: ${bracketColor}; margin-bottom: 4px;">
                                ${resultIcon} Game ${match.game_number}
                            </div>
                            <div style="font-size: 0.9rem; color: #666;">
                                ${match.date} ${match.time ? '• ' + match.time : ''} 
                                ${match.venue ? '• ' + match.venue.replace(/_/g, ' ') : ''}
                            </div>
                        </div>
                        <div style="text-align: center; margin: 0 15px;">
                            <div style="font-weight: bold; font-size: 1.1rem;">vs ${opponent}</div>
                            <div style="font-weight: bold; color: ${statusColor}; font-size: 1.2rem;">
                                ${scoreDisplay}
                            </div>
                        </div>
                        <div style="text-align: right; min-width: 80px;">
                            <div style="
                                background: ${statusColor};
                                color: white;
                                padding: 4px 8px;
                                border-radius: 12px;
                                font-size: 0.8rem;
                                font-weight: bold;
                            ">${match.status}</div>
                        </div>
                    </div>
                    ${videoHTML}
                </div>
            `;
        });
        
        matchesHTML += `</div>`;
    });

    matchesContent.innerHTML = matchesHTML;

    // Assemble popup
    popupContent.appendChild(header);
    popupContent.appendChild(matchesContent);
    popupOverlay.appendChild(popupContent);

    // Add to document
    document.body.appendChild(popupOverlay);

    // Add event listeners
    document.getElementById('close-popup').addEventListener('click', closeMatchPopup);
    popupOverlay.addEventListener('click', function(e) {
        if (e.target === popupOverlay) {
            closeMatchPopup();
        }
    });

    // Add escape key listener
    const escapeHandler = function(e) {
        if (e.key === 'Escape') {
            closeMatchPopup();
            document.removeEventListener('keydown', escapeHandler);
        }
    };
    document.addEventListener('keydown', escapeHandler);
}

function createMatchPopup(teamName, groupName, matches) {
    // Remove existing popup if any
    const existingPopup = document.getElementById('team-match-popup');
    if (existingPopup) {
        existingPopup.remove();
    }

    // Create popup overlay
    const popupOverlay = document.createElement('div');
    popupOverlay.id = 'team-match-popup';
    popupOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        animation: fadeIn 0.3s ease-in-out;
    `;

    // Create popup content
    const popupContent = document.createElement('div');
    popupContent.style.cssText = `
        background: white;
        border-radius: 12px;
        max-width: 90%;
        max-height: 90%;
        overflow-y: auto;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        position: relative;
        animation: slideIn 0.3s ease-in-out;
    `;

    // Create header
    const header = document.createElement('div');
    header.style.cssText = `
        background: linear-gradient(135deg, #0077be 0%, #00a8cc 100%);
        color: white;
        padding: 20px;
        border-radius: 12px 12px 0 0;
        position: relative;
    `;

    header.innerHTML = `
        <h2 style="margin: 0; font-size: 1.5rem;">🏊‍♂️ ${teamName}</h2>
        <p style="margin: 5px 0 0 0; opacity: 0.9;">Group ${groupName} • ${matches.length} matches</p>
        <button id="close-popup" style="
            position: absolute;
            top: 15px;
            right: 15px;
            background: rgba(255,255,255,0.2);
            border: none;
            color: white;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
        ">×</button>
    `;

    // Create matches content
    const matchesContent = document.createElement('div');
    matchesContent.style.cssText = `
        padding: 20px;
        max-height: 400px;
        overflow-y: auto;
    `;

    // Group matches by phase
    const groupedMatches = {};
    matches.forEach(match => {
        const phase = match.phase;
        if (!groupedMatches[phase]) {
            groupedMatches[phase] = [];
        }
        groupedMatches[phase].push(match);
    });

    // Generate matches HTML
    let matchesHTML = '';
    Object.keys(groupedMatches).forEach(phase => {
        matchesHTML += `
            <div style="margin-bottom: 20px;">
                <h3 style="color: #0077be; margin: 0 0 10px 0; padding-bottom: 5px; border-bottom: 2px solid #e3f2fd;">${phase}</h3>
        `;
        
        groupedMatches[phase].forEach(match => {
            const isTeam1 = match.team1 === teamName;
            const opponent = isTeam1 ? match.team2 : match.team1;
            const teamScore = isTeam1 ? match.score1 : match.score2;
            const opponentScore = isTeam1 ? match.score2 : match.score1;
            
            let scoreDisplay = '- vs -';
            let resultClass = '';
            let resultIcon = '';
            
            if (teamScore !== null && opponentScore !== null) {
                scoreDisplay = `${teamScore}-${opponentScore}`;
                if (teamScore > opponentScore) {
                    resultClass = 'win';
                    resultIcon = '🏆';
                } else if (teamScore < opponentScore) {
                    resultClass = 'loss';
                    resultIcon = '❌';
                } else {
                    resultClass = 'tie';
                    resultIcon = '🤝';
                }
            }

            const statusColor = match.status === 'SCHEDULED' ? '#1976d2' : 
                               match.status === 'OPT OUT' ? '#d32f2f' : 
                               match.status === 'NO CONTEST' ? '#ff9800' : '#2e7d32';

            // Add video links if available
            let videoHTML = '';
            if (match.videos && match.videos.length > 0) {
                videoHTML = `
                    <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #eee;">
                        <div style="font-weight: bold; margin-bottom: 8px; color: #dc2626; font-size: 0.9rem;">🎥 Videos:</div>
                        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                            ${match.videos.map(video => 
                                `<a href="${video.url}" target="_blank" style="
                                    display: inline-block; 
                                    padding: 6px 12px; 
                                    background: #dc2626; 
                                    color: white; 
                                    text-decoration: none; 
                                    border-radius: 6px; 
                                    font-size: 0.8rem; 
                                    font-weight: bold;
                                " onmouseover="this.style.background='#b91c1c'" onmouseout="this.style.background='#dc2626'">${video.quarter}</a>`
                            ).join('')}
                        </div>
                    </div>
                `;
            }

            matchesHTML += `
                <div style="
                    background: ${resultClass === 'win' ? '#e8f5e8' : resultClass === 'loss' ? '#ffeaea' : '#f9f9f9'};
                    border: 1px solid ${resultClass === 'win' ? '#4caf50' : resultClass === 'loss' ? '#f44336' : '#ddd'};
                    border-radius: 8px;
                    padding: 12px;
                    margin-bottom: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                ">
                    <div style="flex: 1;">
                        <div style="font-weight: bold; color: #0077be; margin-bottom: 4px;">
                            ${resultIcon} Game ${match.game_number}
                        </div>
                        <div style="font-size: 0.9rem; color: #666;">
                            ${match.date} ${match.time ? '• ' + match.time : ''} 
                            ${match.venue ? '• ' + match.venue.replace(/_/g, ' ') : ''}
                        </div>
                    </div>
                    <div style="text-align: center; margin: 0 15px;">
                        <div style="font-weight: bold; font-size: 1.1rem;">vs ${opponent}</div>
                        <div style="font-weight: bold; color: ${statusColor}; font-size: 1.2rem;">
                            ${scoreDisplay}
                        </div>
                    </div>
                    <div style="text-align: right; min-width: 80px;">
                        <div style="
                            background: ${statusColor};
                            color: white;
                            padding: 4px 8px;
                            border-radius: 12px;
                            font-size: 0.8rem;
                            font-weight: bold;
                        ">${match.status}</div>
                    </div>
                    ${videoHTML}
                </div>
            `;
        });
        
        matchesHTML += `</div>`;
    });

    matchesContent.innerHTML = matchesHTML;

    // Assemble popup
    popupContent.appendChild(header);
    popupContent.appendChild(matchesContent);
    popupOverlay.appendChild(popupContent);

    // Add to document
    document.body.appendChild(popupOverlay);

    // Add event listeners
    document.getElementById('close-popup').addEventListener('click', closeMatchPopup);
    popupOverlay.addEventListener('click', function(e) {
        if (e.target === popupOverlay) {
            closeMatchPopup();
        }
    });

    // Add escape key listener
    const escapeHandler = function(e) {
        if (e.key === 'Escape') {
            closeMatchPopup();
            document.removeEventListener('keydown', escapeHandler);
        }
    };
    document.addEventListener('keydown', escapeHandler);
}

function createAllMatchesPopup(teamName, matches) {
    // Remove existing popup if any
    const existingPopup = document.getElementById('team-match-popup');
    if (existingPopup) {
        existingPopup.remove();
    }

    // Calculate tournament stats
    const stats = calculateTeamTournamentStats(teamName);

    // Create popup overlay
    const popupOverlay = document.createElement('div');
    popupOverlay.id = 'team-match-popup';
    popupOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        animation: fadeIn 0.3s ease-in-out;
    `;

    // Create popup content
    const popupContent = document.createElement('div');
    popupContent.style.cssText = `
        background: white;
        border-radius: 12px;
        max-width: 90%;
        max-height: 90%;
        overflow-y: auto;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        position: relative;
        animation: slideIn 0.3s ease-in-out;
    `;

    // Create header
    const header = document.createElement('div');
    header.style.cssText = `
        background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
        color: white;
        padding: 20px;
        border-radius: 12px 12px 0 0;
        position: relative;
    `;

    header.innerHTML = `
        <h2 style="margin: 0; font-size: 1.5rem;">🏆 ${teamName}</h2>
        <p style="margin: 5px 0 0 0; opacity: 0.9;">Tournament Summary • ${matches.length} total matches</p>
        <div style="margin-top: 10px; display: flex; gap: 15px; font-size: 0.9rem; opacity: 0.9;">
            <span>W: ${stats.wins}</span>
            <span>L: ${stats.losses}</span>
            <span>GD: ${stats.goalDifferential > 0 ? '+' : ''}${stats.goalDifferential}</span>
        </div>
        <button id="close-popup" style="
            position: absolute;
            top: 15px;
            right: 15px;
            background: rgba(255,255,255,0.2);
            border: none;
            color: white;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
        ">×</button>
    `;

    // Create matches content
    const matchesContent = document.createElement('div');
    matchesContent.style.cssText = `
        padding: 20px;
        max-height: 400px;
        overflow-y: auto;
    `;

    // Group matches by phase
    const groupedMatches = {};
    matches.forEach(match => {
        const phase = match.phase;
        if (!groupedMatches[phase]) {
            groupedMatches[phase] = [];
        }
        groupedMatches[phase].push(match);
    });

    // Generate matches HTML (similar to createMatchPopup but with tournament-wide styling)
    let matchesHTML = '';
    Object.keys(groupedMatches).forEach(phase => {
        matchesHTML += `
            <div style="margin-bottom: 20px;">
                <h3 style="color: #ff9800; margin: 0 0 10px 0; padding-bottom: 5px; border-bottom: 2px solid #fff3e0;">${phase}</h3>
        `;
        
        groupedMatches[phase].forEach(match => {
            const isTeam1 = match.team1 === teamName;
            const opponent = isTeam1 ? match.team2 : match.team1;
            const teamScore = isTeam1 ? match.score1 : match.score2;
            const opponentScore = isTeam1 ? match.score2 : match.score1;
            
            let scoreDisplay = '- vs -';
            let resultClass = '';
            let resultIcon = '';
            
            if (teamScore !== null && opponentScore !== null) {
                scoreDisplay = `${teamScore}-${opponentScore}`;
                if (teamScore > opponentScore) {
                    resultClass = 'win';
                    resultIcon = '🏆';
                } else if (teamScore < opponentScore) {
                    resultClass = 'loss';
                    resultIcon = '❌';
                } else {
                    resultClass = 'tie';
                    resultIcon = '🤝';
                }
            }

            const statusColor = match.status === 'SCHEDULED' ? '#1976d2' : 
                               match.status === 'OPT OUT' ? '#d32f2f' : 
                               match.status === 'NO CONTEST' ? '#ff9800' : '#2e7d32';

            matchesHTML += `
                <div style="
                    background: ${resultClass === 'win' ? '#e8f5e8' : resultClass === 'loss' ? '#ffeaea' : '#f9f9f9'};
                    border: 1px solid ${resultClass === 'win' ? '#4caf50' : resultClass === 'loss' ? '#f44336' : '#ddd'};
                    border-radius: 8px;
                    padding: 12px;
                    margin-bottom: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                ">
                    <div style="flex: 1;">
                        <div style="font-weight: bold; color: #ff9800; margin-bottom: 4px;">
                            ${resultIcon} Game ${match.game_number}
                        </div>
                        <div style="font-size: 0.9rem; color: #666;">
                            ${match.date} ${match.time ? '• ' + match.time : ''} 
                            ${match.venue ? '• ' + match.venue.replace(/_/g, ' ') : ''}
                        </div>
                    </div>
                    <div style="text-align: center; margin: 0 15px;">
                        <div style="font-weight: bold; font-size: 1.1rem;">vs ${opponent}</div>
                        <div style="font-weight: bold; color: ${statusColor}; font-size: 1.2rem;">
                            ${scoreDisplay}
                        </div>
                    </div>
                    <div style="text-align: right; min-width: 80px;">
                        <div style="
                            background: ${statusColor};
                            color: white;
                            padding: 4px 8px;
                            border-radius: 12px;
                            font-size: 0.8rem;
                            font-weight: bold;
                        ">${match.status}</div>
                    </div>
                </div>
            `;
        });
        
        matchesHTML += `</div>`;
    });

    matchesContent.innerHTML = matchesHTML;

    // Assemble popup
    popupContent.appendChild(header);
    popupContent.appendChild(matchesContent);
    popupOverlay.appendChild(popupContent);

    // Add to document
    document.body.appendChild(popupOverlay);

    // Add event listeners
    document.getElementById('close-popup').addEventListener('click', closeMatchPopup);
    popupOverlay.addEventListener('click', function(e) {
        if (e.target === popupOverlay) {
            closeMatchPopup();
        }
    });

    // Add escape key listener
    const escapeHandler = function(e) {
        if (e.key === 'Escape') {
            closeMatchPopup();
            document.removeEventListener('keydown', escapeHandler);
        }
    };
    document.addEventListener('keydown', escapeHandler);
}

function closeMatchPopup() {
    const popup = document.getElementById('team-match-popup');
    if (popup) {
        popup.style.animation = 'fadeOut 0.2s ease-in-out';
        setTimeout(() => {
            popup.remove();
        }, 200);
    }
}

// Calculate tournament statistics for a team
function calculateTeamTournamentStats(teamName) {
    if (!tournamentData || !tournamentData.matches) {
        return { gamesPlayed: 0, wins: 0, losses: 0, ties: 0, goalsFor: 0, goalsAgainst: 0, goalDifferential: 0 };
    }

    // Filter matches for this team
    const teamMatches = tournamentData.matches.filter(match => 
        (match.team1 === teamName || match.team2 === teamName) && 
        match.status === 'COMPLETED' && 
        match.score1 !== null && 
        match.score2 !== null
    );

    let stats = {
        gamesPlayed: 0,
        wins: 0,
        losses: 0,
        ties: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifferential: 0
    };

    teamMatches.forEach(match => {
        const isTeam1 = match.team1 === teamName;
        const teamScore = isTeam1 ? match.score1 : match.score2;
        const opponentScore = isTeam1 ? match.score2 : match.score1;

        stats.gamesPlayed++;
        stats.goalsFor += teamScore;
        stats.goalsAgainst += opponentScore;

        if (teamScore > opponentScore) {
            stats.wins++;
        } else if (teamScore < opponentScore) {
            stats.losses++;
        } else {
            stats.ties++;
        }
    });

    stats.goalDifferential = stats.goalsFor - stats.goalsAgainst;
    return stats;
}

// Helper functions for tournament placement display
function getOrdinalSuffix(place) {
    const lastDigit = place % 10;
    const lastTwoDigits = place % 100;
    
    if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
        return 'th';
    }
    
    switch (lastDigit) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
    }
}

function getPlacementIcon(place) {
    switch(place) {
        case 1: return '🥇';
        case 2: return '🥈';
        case 3: return '🥉';
        case 4: return '🏆';
        case 5: return '🌟';
        default: return '🏊‍♂️';
    }
}

function getQualificationLevel(place) {
    if (place >= 1 && place <= 4) {
        return 'Championship Qualification';
    } else if (place >= 5 && place <= 8) {
        return 'Classic Qualification';
    } else if (place >= 9 && place <= 11) {
        return 'Invitational Qualification';
    } else {
        return 'Did Not Qualify';
    }
}

// Add CSS animations for popups
const popupStyles = document.createElement('style');
popupStyles.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    @keyframes slideIn {
        from { transform: scale(0.8) translateY(-20px); opacity: 0; }
        to { transform: scale(1) translateY(0); opacity: 1; }
    }
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
`;
document.head.appendChild(popupStyles);

// Initialize interactive functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Interactive JavaScript loaded');
    
    // Set up team click handlers after tournament data is loaded
    setTimeout(() => {
        setupTeamClickHandlers();
    }, 1000);
});