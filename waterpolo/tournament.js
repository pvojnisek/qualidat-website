// Tournament-specific JavaScript functionality
// Contains: data loading, table population, standings calculation, video display, champions section

// Tournament data variable
let tournamentData = null;

// Load tournament data from JSON file or embedded data
async function loadTournamentData() {
    // Check if we're on a tournament page (has tournament-specific elements)
    const tournamentElements = [
        'matches-tbody',
        'group-standings-container', 
        'champions-matches-container'
    ];
    
    const hasTournamentElements = tournamentElements.some(id => document.getElementById(id));
    if (!hasTournamentElements) {
        console.log('No tournament elements found, skipping tournament data load');
        return;
    }

    try {
        // Try to load from external JSON first (works when served via HTTP)
        const response = await fetch('jos_quali_matches.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        tournamentData = await response.json();
        console.log('✅ Tournament data loaded from external JSON:', tournamentData);
    } catch (error) {
        console.warn('⚠️ Failed to load external JSON, using embedded data:', error.message);
        
        // Fallback to embedded data (works for file:// protocol)
        if (window.TOURNAMENT_DATA) {
            tournamentData = window.TOURNAMENT_DATA;
            console.log('✅ Tournament data loaded from embedded source:', tournamentData);
        } else {
            console.error('❌ No embedded data available');
            const tbody = document.getElementById('matches-tbody');
            if (tbody) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="9" style="padding: 20px; text-align: center; color: #d32f2f;">
                            ❌ Error: No tournament data available. Please check the console for details.
                        </td>
                    </tr>`;
            }
            
            // Also show error in champions section
            const championsContainer = document.getElementById('champions-matches-container');
            if (championsContainer) {
                championsContainer.innerHTML = '<p style="text-align: center; color: #d32f2f; padding: 20px;">❌ Error: No tournament data available. Please check the console for details.</p>';
            }
            return;
        }
    }
    
    // Proceed with populating the page
    try {
        populateMatchTable();
        populateGroupStandings();
        populateReBrackets();
        populatePlacementMatches();
        displayGroupVideos();
        populateChampionsSection();
        console.log('✅ Page populated successfully');
    } catch (error) {
        console.error('❌ Error populating page:', error);
        
        // Try champions section again in case it failed
        try {
            populateChampionsSection();
        } catch (champError) {
            console.error('❌ Error populating champions section on retry:', champError);
        }
    }
}

function populateMatchTable() {
    const tbody = document.getElementById('matches-tbody');
    if (!tbody || !tournamentData) {
        console.log('Missing tbody element or tournament data, skipping match table');
        return;
    }

    let html = '';
    
    // Group stage matches
    html += `
        <tr style="background: #f8f9fa;">
            <td colspan="10" style="padding: 15px; text-align: center; font-weight: bold; color: #0077be; font-size: 1.1rem; border: 1px solid #ddd;">🏊‍♂️ GROUP STAGE MATCHES</td>
        </tr>`;

    // Group matches by date and venue
    const groupMatches = tournamentData.matches.filter(match => match.phase && match.phase.startsWith('Group'));
    
    let currentDate = '';
    let currentVenue = '';
    
    groupMatches.forEach(match => {
        const matchDate = match.date;
        const matchVenue = match.venue;
        
        if (matchDate !== currentDate || matchVenue !== currentVenue) {
            currentDate = matchDate;
            currentVenue = matchVenue;
            const formattedDate = new Date(currentDate).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
            const venueDisplay = createVenueLink(matchVenue);
            html += `
                <tr style="background: #e3f2fd;">
                    <td colspan="10" style="padding: 10px; text-align: center; font-weight: bold; color: #0077be; border: 1px solid #ddd;">${formattedDate} - ${venueDisplay}</td>
                </tr>`;
        }
        
        const rowStyle = match.status === 'OPT OUT' || match.status === 'NO CONTEST' ? 
            'background: #ffe0e0;' : 'background: #f9f9f9;';
        
        const score = match.score1 !== null && match.score2 !== null ? 
            `${match.score1}-${match.score2}` : '- vs -';
        
        const venueDisplay = createVenueLink(match.venue);
        
        // Video links column
        let videoHTML = '-';
        if (match.videos && match.videos.length > 0) {
            videoHTML = '<div style="display: flex; flex-wrap: wrap; gap: 4px; justify-content: center;">';
            match.videos.forEach(video => {
                videoHTML += `<a href="${video.url}" target="_blank" style="display: inline-block; padding: 2px 6px; background: #dc2626; color: white; text-decoration: none; border-radius: 3px; font-size: 0.7rem; font-weight: bold;">${video.quarter}</a>`;
            });
            videoHTML += '</div>';
        }
        
        html += `
            <tr style="${rowStyle}">
                <td style="padding: 8px; border: 1px solid #ddd; text-align: center; font-weight: bold;">${match.game_number}</td>
                <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${match.date}</td>
                <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${match.time || '-'}</td>
                <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${venueDisplay}</td>
                <td style="padding: 8px; border: 1px solid #ddd; text-align: center; ${match.score1 > match.score2 ? 'font-weight: bold; color: #2e7d32;' : ''}">${match.team1}</td>
                <td style="padding: 8px; border: 1px solid #ddd; text-align: center; font-weight: bold; color: #d32f2f;">${score}</td>
                <td style="padding: 8px; border: 1px solid #ddd; text-align: center; ${match.score2 > match.score1 ? 'font-weight: bold; color: #2e7d32;' : ''}">${match.team2}</td>
                <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${match.phase}</td>
                <td style="padding: 8px; border: 1px solid #ddd; text-align: center; font-weight: bold;" class="status-${match.status.toLowerCase().replace(/\s+/g, '-')}">${match.status}</td>
                <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${videoHTML}</td>
            </tr>`;
    });

    // Re-bracket matches
    html += `
        <tr style="background: #f8f9fa;">
            <td colspan="10" style="padding: 15px; text-align: center; font-weight: bold; color: #0077be; font-size: 1.1rem; border: 1px solid #ddd;">🏆 RE-BRACKET MATCHES</td>
        </tr>`;

    const rebracketMatches = tournamentData.matches.filter(match => match.phase && match.phase.startsWith('Re-bracket'));
    
    currentDate = '';
    currentVenue = '';
    
    rebracketMatches.forEach(match => {
        const matchDate = match.date;
        const matchVenue = match.venue;
        
        if (matchDate !== currentDate || matchVenue !== currentVenue) {
            currentDate = matchDate;
            currentVenue = matchVenue;
            const formattedDate = new Date(currentDate).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
            const venueDisplay = createVenueLink(matchVenue);
            html += `
                <tr style="background: #e3f2fd;">
                    <td colspan="10" style="padding: 10px; text-align: center; font-weight: bold; color: #0077be; border: 1px solid #ddd;">${formattedDate} - ${venueDisplay}</td>
                </tr>`;
        }
        
        const score = match.score1 !== null && match.score2 !== null ? 
            `${match.score1}-${match.score2}` : '- vs -';
        
        const venueDisplay = createVenueLink(match.venue);
        
        // Video links column
        let videoHTML = '-';
        if (match.videos && match.videos.length > 0) {
            videoHTML = '<div style="display: flex; flex-wrap: wrap; gap: 4px; justify-content: center;">';
            match.videos.forEach(video => {
                videoHTML += `<a href="${video.url}" target="_blank" style="display: inline-block; padding: 2px 6px; background: #dc2626; color: white; text-decoration: none; border-radius: 3px; font-size: 0.7rem; font-weight: bold;">${video.quarter}</a>`;
            });
            videoHTML += '</div>';
        }
        
        // Determine winner styling for completed matches
        let team1Style = "padding: 8px; border: 1px solid #ddd; text-align: center;";
        let team2Style = "padding: 8px; border: 1px solid #ddd; text-align: center;";
        
        if (match.status === 'COMPLETED' && match.score1 !== null && match.score2 !== null) {
            if (match.score1 > match.score2) {
                team1Style = "padding: 8px; border: 1px solid #ddd; text-align: center; font-weight: bold; color: #059669;";
            } else if (match.score2 > match.score1) {
                team2Style = "padding: 8px; border: 1px solid #ddd; text-align: center; font-weight: bold; color: #059669;";
            }
        }

        html += `
            <tr style="background: #f9f9f9;">
                <td style="padding: 8px; border: 1px solid #ddd; text-align: center; font-weight: bold;">${match.game_number}</td>
                <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${match.date}</td>
                <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${match.time || '-'}</td>
                <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${venueDisplay}</td>
                <td style="${team1Style}">${match.team1}</td>
                <td style="padding: 8px; border: 1px solid #ddd; text-align: center; font-weight: bold; color: #d32f2f;">${score}</td>
                <td style="${team2Style}">${match.team2}</td>
                <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${match.phase}</td>
                <td style="padding: 8px; border: 1px solid #ddd; text-align: center; font-weight: bold;" class="status-${match.status.toLowerCase().replace(/\s+/g, '-')}">${match.status}</td>
                <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${videoHTML}</td>
            </tr>`;
    });

    // Championship matches
    html += `
        <tr style="background: #f8f9fa;">
            <td colspan="10" style="padding: 15px; text-align: center; font-weight: bold; color: #0077be; font-size: 1.1rem; border: 1px solid #ddd;">🏆 CHAMPIONSHIP & PLACEMENT MATCHES</td>
        </tr>`;

    const championshipMatches = tournamentData.matches.filter(match => match.phase === 'Championship');
    
    championshipMatches.forEach(match => {
        const score = match.score1 !== null && match.score2 !== null ? 
            `${match.score1}-${match.score2}` : '- vs -';
        
        const venueDisplay = createVenueLink(match.venue);
        
        // Video links column
        let videoHTML = '-';
        if (match.videos && match.videos.length > 0) {
            videoHTML = '<div style="display: flex; flex-wrap: wrap; gap: 4px; justify-content: center;">';
            match.videos.forEach(video => {
                videoHTML += `<a href="${video.url}" target="_blank" style="display: inline-block; padding: 2px 6px; background: #dc2626; color: white; text-decoration: none; border-radius: 3px; font-size: 0.7rem; font-weight: bold;">${video.quarter}</a>`;
            });
            videoHTML += '</div>';
        }
        
        // Determine winner styling for completed championship matches
        let champTeam1Style = "padding: 8px; border: 1px solid #ddd; text-align: center;";
        let champTeam2Style = "padding: 8px; border: 1px solid #ddd; text-align: center;";
        
        if (match.status === 'COMPLETED' && match.score1 !== null && match.score2 !== null) {
            if (match.score1 > match.score2) {
                champTeam1Style = "padding: 8px; border: 1px solid #ddd; text-align: center; font-weight: bold; color: #059669;";
            } else if (match.score2 > match.score1) {
                champTeam2Style = "padding: 8px; border: 1px solid #ddd; text-align: center; font-weight: bold; color: #059669;";
            }
        }

        html += `
            <tr style="background: #fff3e0;">
                <td style="padding: 8px; border: 1px solid #ddd; text-align: center; font-weight: bold;">${match.game_number}</td>
                <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${match.date}</td>
                <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${match.time || '-'}</td>
                <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${venueDisplay}</td>
                <td style="${champTeam1Style}">${match.team1}</td>
                <td style="padding: 8px; border: 1px solid #ddd; text-align: center; font-weight: bold; color: #d32f2f;">${score}</td>
                <td style="${champTeam2Style}">${match.team2}</td>
                <td style="padding: 8px; border: 1px solid #ddd; text-align: center; font-weight: bold; color: #ff9800;">${match.phase}${match.notes ? ' - ' + match.notes : ''}</td>
                <td style="padding: 8px; border: 1px solid #ddd; text-align: center; font-weight: bold;" class="status-${match.status.toLowerCase().replace(/\s+/g, '-')}">${match.status}</td>
                <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${videoHTML}</td>
            </tr>`;
    });

    tbody.innerHTML = html;
    console.log('✅ Match table populated successfully');
}

function populateGroupStandings() {
    const container = document.getElementById('group-standings-container');
    if (!container || !tournamentData) {
        console.log('Missing standings container or tournament data, skipping group standings');
        return;
    }

    try {
        // Calculate standings using the embedded functions from the HTML
        const standings = calculateGroupStandings(tournamentData.matches, tournamentData.groups);
        
        // Generate HTML for each group
        let html = '';
        const groups = ['A', 'B', 'C', 'D'];
        
        groups.forEach(groupLetter => {
            html += generateStandingsHTML(standings, groupLetter, groupLetter);
        });
        
        container.innerHTML = html;
        
        console.log('✅ Group standings populated successfully');
    } catch (error) {
        console.error('❌ Error populating group standings:', error);
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #d32f2f;">
                <h3>⚠️ Error Loading Standings</h3>
                <p>Unable to calculate current standings. Please refresh the page.</p>
            </div>
        `;
    }
}

// Calculate standings for each group based on match results
function calculateGroupStandings(matches, groups) {
    const standings = {};
    
    // Initialize standings for each group
    Object.keys(groups).forEach(groupName => {
        standings[groupName] = {};
        groups[groupName].forEach(team => {
            standings[groupName][team] = {
                team: team,
                played: 0,
                wins: 0,
                losses: 0,
                ties: 0,
                points: 0,
                goalsFor: 0,
                goalsAgainst: 0,
                goalDifferential: 0,
                position: 0
            };
        });
    });

    // Process all matches with scores (COMPLETED, OPT OUT, NO CONTEST)
    matches.forEach(match => {
        if (match.status === 'COMPLETED' || match.status === 'OPT OUT' || match.status === 'NO CONTEST') {
            const phase = match.phase;
            const groupName = phase.replace('Group ', '');
            
            if (standings[groupName] && match.score1 !== null && match.score2 !== null) {
                const team1 = match.team1;
                const team2 = match.team2;
                const score1 = match.score1;
                const score2 = match.score2;

                // Only process if both teams are in the group
                if (standings[groupName][team1] && standings[groupName][team2]) {
                    // Update match statistics
                    standings[groupName][team1].played++;
                    standings[groupName][team2].played++;
                    standings[groupName][team1].goalsFor += score1;
                    standings[groupName][team1].goalsAgainst += score2;
                    standings[groupName][team2].goalsFor += score2;
                    standings[groupName][team2].goalsAgainst += score1;

                    // Determine winner and update records
                    if (score1 > score2) {
                        standings[groupName][team1].wins++;
                        standings[groupName][team1].points += 3;
                        standings[groupName][team2].losses++;
                    } else if (score2 > score1) {
                        standings[groupName][team2].wins++;
                        standings[groupName][team2].points += 3;
                        standings[groupName][team1].losses++;
                    } else {
                        standings[groupName][team1].ties++;
                        standings[groupName][team2].ties++;
                        standings[groupName][team1].points += 1;
                        standings[groupName][team2].points += 1;
                    }
                }
            }
        }
    });

    // Calculate goal differential and sort teams
    Object.keys(standings).forEach(groupName => {
        Object.keys(standings[groupName]).forEach(team => {
            standings[groupName][team].goalDifferential = 
                standings[groupName][team].goalsFor - standings[groupName][team].goalsAgainst;
        });

        // Convert to array and sort
        const teamsArray = Object.values(standings[groupName]);
        teamsArray.sort((a, b) => {
            // Sort by points first
            if (b.points !== a.points) return b.points - a.points;
            // Then by goal differential
            if (b.goalDifferential !== a.goalDifferential) return b.goalDifferential - a.goalDifferential;
            // Then by goals for
            if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
            // Finally by team name
            return a.team.localeCompare(b.team);
        });

        // Update positions
        teamsArray.forEach((team, index) => {
            team.position = index + 1;
            standings[groupName][team.team] = team;
        });
    });

    return standings;
}

// Generate HTML for standings display
function generateStandingsHTML(standings, groupName, groupLetter) {
    const teams = Object.values(standings[groupName]).sort((a, b) => a.position - b.position);
    
    return `
        <div class="standings-table">
            <h3>Group ${groupLetter}</h3>
            <div class="standings-list">
                ${teams.map((team, index) => `
                    <div class="standing-item clickable-team" data-team="${team.team}" data-group="${groupLetter}" style="cursor: pointer;">
                        <span class="position">${getPositionIcon(index + 1)}</span>
                        <span class="team-name">${team.team}</span>
                        <span class="team-record">${team.wins}-${team.losses}${team.ties > 0 ? '-' + team.ties : ''}</span>
                        <span class="team-stats">GD: ${team.goalDifferential > 0 ? '+' : ''}${team.goalDifferential}</span>
                    </div>
                `).join('')}
            </div>
            <div class="group-summary">
                <small>W-L Record | GD: Goal Differential</small>
            </div>
            ${groupLetter === 'C' ? '<div id="group-c-videos" class="group-videos"></div>' : ''}
        </div>
    `;
}

// Get position icon based on rank
function getPositionIcon(position) {
    switch(position) {
        case 1: return '🥇';
        case 2: return '🥈';
        case 3: return '🥉';
        default: return '•';
    }
}

function populateReBrackets() {
    // This function would update re-bracket standings based on group results
    // For now, keeping the existing static structure
    console.log('Re-brackets function called');
}

function populatePlacementMatches() {
    // This function would update placement match cards
    // For now, keeping the existing static structure
    console.log('Placement matches function called');
}

function displayGroupVideos() {
    if (!tournamentData || !tournamentData.matches) {
        console.log('Tournament data not available for video display, skipping');
        return;
    }
    
    const groupCVideos = document.getElementById('group-c-videos');
    if (!groupCVideos) {
        console.log('Group C videos container not found, skipping video display');
        return;
    }
    
    // Find matches with videos for Group C teams
    const groupCMatches = tournamentData.matches.filter(match => 
        (match.phase === 'Group C' || 
         ['Shores Black', 'Shores Gold', 'NSD Stars', 'Odin B'].includes(match.team1) ||
         ['Shores Black', 'Shores Gold', 'NSD Stars', 'Odin B'].includes(match.team2)) &&
        match.videos && match.videos.length > 0
    );
    
    if (groupCMatches.length > 0) {
        let videoHTML = '<div style="margin-top: 15px; padding: 15px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #0077be;"><h4 style="margin: 0 0 10px 0; color: #0077be; font-size: 0.9rem;">🎥 Match Videos</h4>';
        
        groupCMatches.forEach(match => {
            videoHTML += `<div style="margin-bottom: 10px;">`;
            videoHTML += `<div style="font-weight: bold; margin-bottom: 5px; font-size: 0.85rem;">${match.team1} vs ${match.team2} (Game ${match.game_number})</div>`;
            videoHTML += `<div style="display: flex; flex-wrap: wrap; gap: 8px;">`;
            
            match.videos.forEach(video => {
                videoHTML += `<a href="${video.url}" target="_blank" style="display: inline-block; padding: 4px 8px; background: #dc2626; color: white; text-decoration: none; border-radius: 4px; font-size: 0.75rem; font-weight: bold;">${video.quarter}</a>`;
            });
            
            videoHTML += `</div></div>`;
        });
        
        videoHTML += '</div>';
        groupCVideos.innerHTML = videoHTML;
        console.log('✅ Group videos displayed successfully');
    } else {
        groupCVideos.innerHTML = '';
        console.log('No videos found for Group C teams');
    }
}

function populateChampionsSection() {
    const container = document.getElementById('champions-matches-container');
    if (!container) {
        console.log('Champions container not found, skipping champions section');
        return;
    }
    
    if (!tournamentData) {
        console.log('Tournament data not available for champions section');
        container.innerHTML = '<p style="text-align: center; color: #d32f2f; padding: 20px;">⚠️ Tournament data not loaded. Please refresh the page.</p>';
        return;
    }
    
    console.log('✅ Loading champions section with data:', tournamentData);

    const championTeam = 'Shores Black';
    
    // Filter matches for Shores Black
    const teamMatches = tournamentData.matches.filter(match => 
        match.team1 === championTeam || match.team2 === championTeam
    );

    if (teamMatches.length === 0) {
        container.innerHTML = '<p>No matches found for the champion team.</p>';
        return;
    }

    // Group matches by phase
    const groupedMatches = {};
    teamMatches.forEach(match => {
        const phase = match.phase;
        if (!groupedMatches[phase]) {
            groupedMatches[phase] = [];
        }
        groupedMatches[phase].push(match);
    });

    // Generate matches HTML
    let matchesHTML = '';
    
    // Sort phases to show group stage first, then re-bracket
    const phaseOrder = ['Group C', 'Re-bracket AA', 'Championship'];
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
            <div style="margin-bottom: 25px;">
                <h3 style="color: #ff9800; margin: 0 0 15px 0; padding: 10px 15px; background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%); border-radius: 8px; border-left: 4px solid #ff9800;">${phase}</h3>
                <div style="display: grid; gap: 15px;">
        `;
        
        groupedMatches[phase].forEach(match => {
            const isTeam1 = match.team1 === championTeam;
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
            } else if (match.status === 'SCHEDULED') {
                resultIcon = '📅';
            }

            const statusColor = match.status === 'SCHEDULED' ? '#1976d2' : 
                               match.status === 'OPT OUT' ? '#d32f2f' : 
                               match.status === 'NO CONTEST' ? '#ff9800' : '#2e7d32';

            matchesHTML += `
                <div style="
                    background: ${resultClass === 'win' ? 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)' : 
                                resultClass === 'loss' ? 'linear-gradient(135deg, #ffeaea 0%, #ffcdd2 100%)' : 
                                'linear-gradient(135deg, #f9f9f9 0%, #e0e0e0 100%)'};
                    border: 2px solid ${resultClass === 'win' ? '#4caf50' : resultClass === 'loss' ? '#f44336' : '#bdbdbd'};
                    border-radius: 8px;
                    padding: 12px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    transition: transform 0.2s, box-shadow 0.2s;
                    max-width: 100%;
                " onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 8px rgba(0,0,0,0.15)'" 
                   onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 4px rgba(0,0,0,0.1)'">
                    
                    <!-- Compact Layout -->
                    <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
                        <!-- Game Info -->
                        <div style="flex: 0 0 auto;">
                            <div style="font-size: 1rem; font-weight: bold; color: #ff9800;">
                                ${resultIcon} Game ${match.game_number}
                            </div>
                            <div style="font-size: 0.8rem; color: #666;">
                                📅 ${match.date} ${match.time ? '• ' + match.time : ''} 📍 ${match.venue ? match.venue.replace(/_/g, ' ') : 'TBD'}
                            </div>
                        </div>
                        
                        <!-- Teams & Score -->
                        <div style="flex: 1 1 auto; text-align: center; min-width: 200px;">
                            <div style="font-weight: bold; font-size: 1rem; margin-bottom: 4px;">
                                ${championTeam} <span style="color: #666;">vs</span> ${opponent}
                            </div>
                            <div style="display: inline-flex; align-items: center; gap: 8px;">
                                <div style="font-weight: bold; color: ${statusColor}; font-size: 1.1rem; background: white; padding: 4px 8px; border-radius: 6px; border: 2px solid ${statusColor};">
                                    ${scoreDisplay}
                                </div>
                                <div style="
                                    background: ${statusColor};
                                    color: white;
                                    padding: 4px 8px;
                                    border-radius: 12px;
                                    font-size: 0.7rem;
                                    font-weight: bold;
                                    text-transform: uppercase;
                                ">${match.status}</div>
                            </div>
                        </div>
                        
                        <!-- Videos on same row if available -->
                        ${match.videos && match.videos.length > 0 ? `
                            <div style="flex: 0 0 auto;">
                                <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                                    ${match.videos.map(video => 
                                        `<a href="${video.url}" target="_blank" style="
                                            display: inline-block; 
                                            padding: 4px 8px; 
                                            background: #dc2626; 
                                            color: white; 
                                            text-decoration: none; 
                                            border-radius: 4px; 
                                            font-size: 0.7rem; 
                                            font-weight: bold;
                                            transition: background 0.2s;
                                        " onmouseover="this.style.background='#b91c1c'" onmouseout="this.style.background='#dc2626'">${video.quarter}</a>`
                                    ).join('')}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                    
                    ${match.notes ? `<div style="margin-top: 8px; padding: 8px; background: rgba(255,193,7,0.1); border-radius: 4px; font-size: 0.8rem; color: #666; font-style: italic; border-left: 3px solid #ffc107;">📝 ${match.notes}</div>` : ''}
                </div>
            `;
        });
        
        matchesHTML += `</div></div>`;
    });

    container.innerHTML = matchesHTML;
    console.log('✅ Champions section populated successfully');
}

// Initialize tournament functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Tournament JavaScript loaded');
    
    // Load tournament data
    loadTournamentData();
    
    // Backup mechanism - try to populate champions section after a delay
    setTimeout(function() {
        const container = document.getElementById('champions-matches-container');
        if (container && (!container.innerHTML || container.innerHTML.trim() === '')) {
            console.log('🔄 Retrying champions section after delay...');
            if (window.TOURNAMENT_DATA && !tournamentData) {
                tournamentData = window.TOURNAMENT_DATA;
                console.log('✅ Using embedded data for delayed retry');
            }
            populateChampionsSection();
        }
    }, 2000); // Retry after 2 seconds
});