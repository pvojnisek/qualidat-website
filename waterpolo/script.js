// Tournament data loading and processing
let tournamentData = null;

async function loadTournamentData() {
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
        console.error('Missing tbody element or tournament data');
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
            const venueDisplay = matchVenue ? matchVenue.replace(/_/g, ' ') : 'TBD';
            html += `
                <tr style="background: #e3f2fd;">
                    <td colspan="10" style="padding: 10px; text-align: center; font-weight: bold; color: #0077be; border: 1px solid #ddd;">${formattedDate} - ${venueDisplay}</td>
                </tr>`;
        }
        
        const rowStyle = match.status === 'OPT OUT' || match.status === 'NO CONTEST' ? 
            'background: #ffe0e0;' : 'background: #f9f9f9;';
        
        const score = match.score1 !== null && match.score2 !== null ? 
            `${match.score1}-${match.score2}` : '- vs -';
        
        const venueDisplay = match.venue ? match.venue.replace(/_/g, ' ') : 'TBD';
        
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
            const venueDisplay = matchVenue ? matchVenue.replace(/_/g, ' ') : 'TBD';
            html += `
                <tr style="background: #e3f2fd;">
                    <td colspan="10" style="padding: 10px; text-align: center; font-weight: bold; color: #0077be; border: 1px solid #ddd;">${formattedDate} - ${venueDisplay}</td>
                </tr>`;
        }
        
        const score = match.score1 !== null && match.score2 !== null ? 
            `${match.score1}-${match.score2}` : '- vs -';
        
        const venueDisplay = match.venue ? match.venue.replace(/_/g, ' ') : 'TBD';
        
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
            <tr style="background: #f9f9f9;">
                <td style="padding: 8px; border: 1px solid #ddd; text-align: center; font-weight: bold;">${match.game_number}</td>
                <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${match.date}</td>
                <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${match.time || '-'}</td>
                <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${venueDisplay}</td>
                <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${match.team1}</td>
                <td style="padding: 8px; border: 1px solid #ddd; text-align: center; font-weight: bold; color: #d32f2f;">${score}</td>
                <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${match.team2}</td>
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
        
        const venueDisplay = match.venue ? match.venue.replace(/_/g, ' ') : 'TBD';
        
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
            <tr style="background: #fff3e0;">
                <td style="padding: 8px; border: 1px solid #ddd; text-align: center; font-weight: bold;">${match.game_number}</td>
                <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${match.date}</td>
                <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${match.time || '-'}</td>
                <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${venueDisplay}</td>
                <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${match.team1}</td>
                <td style="padding: 8px; border: 1px solid #ddd; text-align: center; font-weight: bold; color: #d32f2f;">${score}</td>
                <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${match.team2}</td>
                <td style="padding: 8px; border: 1px solid #ddd; text-align: center; font-weight: bold; color: #ff9800;">${match.phase}${match.notes ? ' - ' + match.notes : ''}</td>
                <td style="padding: 8px; border: 1px solid #ddd; text-align: center; font-weight: bold;" class="status-${match.status.toLowerCase().replace(/\s+/g, '-')}">${match.status}</td>
                <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${videoHTML}</td>
            </tr>`;
    });

    tbody.innerHTML = html;
    console.log('Match table populated successfully');
}

function populateGroupStandings() {
    const container = document.getElementById('group-standings-container');
    if (!container || !tournamentData) {
        console.error('Missing standings container or tournament data');
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
        
        // Re-attach event listeners for team clicks
        setupTeamClickHandlers();
        
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
        console.error('Tournament data not available for video display');
        return;
    }
    
    const groupCVideos = document.getElementById('group-c-videos');
    if (!groupCVideos) {
        console.warn('Group C videos container not found');
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
        console.error('❌ Champions container not found');
        return;
    }
    
    if (!tournamentData) {
        console.error('❌ Tournament data not available for champions section');
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

            // Add video links if available
            let videoHTML = '';
            if (match.videos && match.videos.length > 0) {
                videoHTML = `
                    <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #eee;">
                        <div style="font-weight: bold; margin-bottom: 8px; color: #dc2626; font-size: 0.9rem;">🎥 Match Videos:</div>
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
                                    transition: background 0.2s;
                                " onmouseover="this.style.background='#b91c1c'" onmouseout="this.style.background='#dc2626'">${video.quarter}</a>`
                            ).join('')}
                        </div>
                    </div>
                `;
            }

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

// Add some interactive animations
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, starting tournament data load...');
    
    // Load tournament data first
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
    
    // Animate stats on scroll
    const statNumbers = document.querySelectorAll('.stat-number');

    const animateStats = () => {
        statNumbers.forEach(stat => {
            const rect = stat.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                if (!stat.classList.contains('animated')) {
                    stat.classList.add('animated');
                    const finalValue = parseFloat(stat.textContent);
                    let currentValue = 0;
                    const increment = finalValue / 50;

                    const timer = setInterval(() => {
                        currentValue += increment;
                        if (currentValue >= finalValue) {
                            currentValue = finalValue;
                            clearInterval(timer);
                        }
                        stat.textContent = Math.floor(currentValue * 10) / 10;
                    }, 20);
                }
            }
        });
    };

    window.addEventListener('scroll', animateStats);
    animateStats(); // Run once on load

    // Add hover effects to cards
    const cards = document.querySelectorAll('.match-card, .fact-card, .stat-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Collapsible functionality
    const collapsibles = document.querySelectorAll('.collapsible');
    collapsibles.forEach(collapsible => {
        collapsible.addEventListener('click', function() {
            this.classList.toggle('active');
            const content = this.nextElementSibling;
            content.classList.toggle('active');
        });
    });

    // Team card click functionality
    setupTeamClickHandlers();
});

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
            const isTeam1 = match.team1 === teamName || match.team1 === bracketTeam;
            const isTeam2 = match.team2 === teamName || match.team2 === bracketTeam;
            
            let opponent, teamScore, opponentScore;
            
            if (isTeam1) {
                opponent = match.team2;
                teamScore = match.score1;
                opponentScore = match.score2;
            } else if (isTeam2) {
                opponent = match.team1;
                teamScore = match.score2;
                opponentScore = match.score1;
            } else {
                // Handle bracket identifier matches
                if (match.team1 === bracketTeam) {
                    opponent = match.team2;
                    teamScore = match.score1;
                    opponentScore = match.score2;
                } else {
                    opponent = match.team1;
                    teamScore = match.score2;
                    opponentScore = match.score1;
                }
            }
            
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

            // Add video links if available
            let videoHTML = '';
            if (match.videos && match.videos.length > 0) {
                videoHTML = `
                    <div style="margin-top: 8px; display: flex; flex-wrap: wrap; gap: 4px;">
                        ${match.videos.map(video => 
                            `<a href="${video.url}" target="_blank" style="
                                display: inline-block; 
                                padding: 2px 6px; 
                                background: #dc2626; 
                                color: white; 
                                text-decoration: none; 
                                border-radius: 3px; 
                                font-size: 0.7rem; 
                                font-weight: bold;
                            ">${video.quarter}</a>`
                        ).join('')}
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
                    ${match.notes ? `<div style="font-size: 0.8rem; color: #666; font-style: italic;">Note: ${match.notes}</div>` : ''}
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

    // Add styles for animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes slideIn {
            from { transform: scale(0.8) translateY(-20px); opacity: 0; }
            to { transform: scale(1) translateY(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);

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

// Add fadeOut animation
const fadeOutStyle = document.createElement('style');
fadeOutStyle.textContent = `
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
`;
document.head.appendChild(fadeOutStyle);

// Team photo zoom functionality
function zoomImage(img) {
    // Create overlay if it doesn't exist
    let overlay = document.querySelector('.photo-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'photo-overlay';
        
        // Create close button
        const closeBtn = document.createElement('div');
        closeBtn.className = 'close-btn';
        closeBtn.innerHTML = '×';
        closeBtn.onclick = closeZoom;
        
        // Create zoomed image
        const zoomedImg = document.createElement('img');
        zoomedImg.src = img.src;
        zoomedImg.alt = img.alt;
        
        overlay.appendChild(closeBtn);
        overlay.appendChild(zoomedImg);
        document.body.appendChild(overlay);
        
        // Close on click outside image
        overlay.onclick = function(e) {
            if (e.target === overlay) {
                closeZoom();
            }
        };
        
        // Close on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && overlay.classList.contains('show')) {
                closeZoom();
            }
        });
    } else {
        // Update existing overlay with new image
        const zoomedImg = overlay.querySelector('img');
        zoomedImg.src = img.src;
        zoomedImg.alt = img.alt;
    }
    
    // Show overlay with animation
    setTimeout(() => {
        overlay.classList.add('show');
    }, 10);
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
}

function closeZoom() {
    const overlay = document.querySelector('.photo-overlay');
    if (overlay) {
        overlay.classList.remove('show');
        // Don't set display: none since CSS handles it
    }
    
    // Restore body scroll
    document.body.style.overflow = '';
}