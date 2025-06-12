// Add some interactive animations
        document.addEventListener('DOMContentLoaded', function() {
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

            // Team matches data
            const teamMatches = {
                // Group Stage matches
                'Del Mar Blue': [
                    { date: '6/13/2025 - Opt Out', venue: 'No Game', opponent: 'Southern B', score: '5-0', result: 'win', type: 'Opt Out' },
                    { date: '6/13/2025 - 6:00 PM', venue: 'BBMAC #1', opponent: 'Southern', score: 'TBD', result: 'pending', type: 'Group A' },
                    { date: '6/13/2025 - No Contest', venue: 'Same Club', opponent: 'Del Mar White', score: '5-0', result: 'win', type: 'No Contest' }
                ],
                'Del Mar White': [
                    { date: '6/13/2025 - 1:00 PM', venue: 'BBMAC #1', opponent: 'Southern', score: 'TBD', result: 'pending', type: 'Group A' },
                    { date: '6/13/2025 - 5:00 PM', venue: 'BBMAC #1', opponent: 'Southern B', score: 'TBD', result: 'pending', type: 'Group A' },
                    { date: '6/13/2025 - No Contest', venue: 'Same Club', opponent: 'Del Mar Blue', score: '0-5', result: 'loss', type: 'No Contest' }
                ],
                'Southern': [
                    { date: '6/13/2025 - 1:00 PM', venue: 'BBMAC #1', opponent: 'Del Mar White', score: 'TBD', result: 'pending', type: 'Group A' },
                    { date: '6/13/2025 - 6:00 PM', venue: 'BBMAC #1', opponent: 'Del Mar Blue', score: 'TBD', result: 'pending', type: 'Group A' },
                    { date: '6/13/2025 - No Contest', venue: 'Same Club', opponent: 'Southern B', score: '5-0', result: 'win', type: 'No Contest' }
                ],
                'Southern B': [
                    { date: '6/13/2025 - Opt Out', venue: 'No Game', opponent: 'Del Mar Blue', score: '0-5', result: 'loss', type: 'Opt Out' },
                    { date: '6/13/2025 - 5:00 PM', venue: 'BBMAC #1', opponent: 'Del Mar White', score: 'TBD', result: 'pending', type: 'Group A' },
                    { date: '6/13/2025 - No Contest', venue: 'Same Club', opponent: 'Southern', score: '0-5', result: 'loss', type: 'No Contest' }
                ],
                'LJ United A': [
                    { date: '6/13/2025 - Opt Out', venue: 'No Game', opponent: 'NADO', score: '5-0', result: 'win', type: 'Opt Out' },
                    { date: '6/14/2025 - 10:45 AM', venue: 'Granite Hills #1', opponent: 'Poway', score: 'TBD', result: 'pending', type: 'Group B' },
                    { date: '6/13/2025 - No Contest', venue: 'Same Club', opponent: 'LJ United B', score: '5-0', result: 'win', type: 'No Contest' }
                ],
                'LJ United B': [
                    { date: '6/13/2025 - 3:00 PM', venue: 'BBMAC #1', opponent: 'Poway', score: 'TBD', result: 'pending', type: 'Group B' },
                    { date: '6/14/2025 - 11:40 AM', venue: 'Granite Hills #1', opponent: 'NADO', score: 'TBD', result: 'pending', type: 'Group B' },
                    { date: '6/13/2025 - No Contest', venue: 'Same Club', opponent: 'LJ United A', score: '0-5', result: 'loss', type: 'No Contest' }
                ],
                'Poway': [
                    { date: '6/13/2025 - 3:00 PM', venue: 'BBMAC #1', opponent: 'LJ United B', score: 'TBD', result: 'pending', type: 'Group B' },
                    { date: '6/14/2025 - 8:00 AM', venue: 'Granite Hills #1', opponent: 'NADO', score: 'TBD', result: 'pending', type: 'Group B' },
                    { date: '6/14/2025 - 10:45 AM', venue: 'Granite Hills #1', opponent: 'LJ United A', score: 'TBD', result: 'pending', type: 'Group B' }
                ],
                'NADO': [
                    { date: '6/13/2025 - Opt Out', venue: 'No Game', opponent: 'LJ United A', score: '0-5', result: 'loss', type: 'Opt Out' },
                    { date: '6/14/2025 - 8:00 AM', venue: 'Granite Hills #1', opponent: 'Poway', score: 'TBD', result: 'pending', type: 'Group B' },
                    { date: '6/14/2025 - 11:40 AM', venue: 'Granite Hills #1', opponent: 'LJ United B', score: 'TBD', result: 'pending', type: 'Group B' }
                ],
                'Shores Black': [
                    { date: '6/13/2025 - 2:00 PM', venue: 'BBMAC #1', opponent: 'Odin B', score: 'TBD', result: 'pending', type: 'Group C' },
                    { date: '6/13/2025 - 5:00 PM', venue: 'BBMAC #2', opponent: 'NSD Stars', score: 'TBD', result: 'pending', type: 'Group C' },
                    { date: '6/13/2025 - No Contest', venue: 'Same Club', opponent: 'Shores Gold', score: '5-0', result: 'win', type: 'No Contest' }
                ],
                'Shores Gold': [
                    { date: '6/13/2025 - 4:00 PM', venue: 'BBMAC #1', opponent: 'NSD Stars', score: 'TBD', result: 'pending', type: 'Group C' },
                    { date: '6/13/2025 - 6:00 PM', venue: 'BBMAC #2', opponent: 'Odin B', score: 'TBD', result: 'pending', type: 'Group C' },
                    { date: '6/13/2025 - No Contest', venue: 'Same Club', opponent: 'Shores Black', score: '0-5', result: 'loss', type: 'No Contest' }
                ],
                'NSD Stars': [
                    { date: '6/13/2025 - 4:00 PM', venue: 'BBMAC #1', opponent: 'Shores Gold', score: 'TBD', result: 'pending', type: 'Group C' },
                    { date: '6/13/2025 - 5:00 PM', venue: 'BBMAC #2', opponent: 'Shores Black', score: 'TBD', result: 'pending', type: 'Group C' },
                    { date: '6/14/2025 - 12:35 PM', venue: 'Granite Hills #1', opponent: 'Odin B', score: 'TBD', result: 'pending', type: 'Group C' }
                ],
                'Odin B': [
                    { date: '6/13/2025 - 2:00 PM', venue: 'BBMAC #1', opponent: 'Shores Black', score: 'TBD', result: 'pending', type: 'Group C' },
                    { date: '6/13/2025 - 6:00 PM', venue: 'BBMAC #2', opponent: 'Shores Gold', score: 'TBD', result: 'pending', type: 'Group C' },
                    { date: '6/14/2025 - 12:35 PM', venue: 'Granite Hills #1', opponent: 'NSD Stars', score: 'TBD', result: 'pending', type: 'Group C' }
                ],
                'CBAD Black': [
                    { date: '6/14/2025 - 8:55 AM', venue: 'Granite Hills #1', opponent: 'Shores White', score: 'TBD', result: 'pending', type: 'Group D' },
                    { date: '6/14/2025 - 1:30 PM', venue: 'Granite Hills #1', opponent: 'Odin A', score: 'TBD', result: 'pending', type: 'Group D' },
                    { date: '6/14/2025 - No Contest', venue: 'Same Club', opponent: 'CBAD Silver', score: '5-0', result: 'win', type: 'No Contest' }
                ],
                'CBAD Silver': [
                    { date: '6/14/2025 - 9:50 AM', venue: 'Granite Hills #1', opponent: 'Odin A', score: 'TBD', result: 'pending', type: 'Group D' },
                    { date: '6/14/2025 - 2:25 PM', venue: 'Granite Hills #1', opponent: 'Shores White', score: 'TBD', result: 'pending', type: 'Group D' },
                    { date: '6/14/2025 - No Contest', venue: 'Same Club', opponent: 'CBAD Black', score: '0-5', result: 'loss', type: 'No Contest' }
                ],
                'Odin A': [
                    { date: '6/13/2025 - 7:00 PM', venue: 'BBMAC #1', opponent: 'Shores White', score: 'TBD', result: 'pending', type: 'Group D' },
                    { date: '6/14/2025 - 9:50 AM', venue: 'Granite Hills #1', opponent: 'CBAD Silver', score: 'TBD', result: 'pending', type: 'Group D' },
                    { date: '6/14/2025 - 1:30 PM', venue: 'Granite Hills #1', opponent: 'CBAD Black', score: 'TBD', result: 'pending', type: 'Group D' }
                ],
                'Shores White': [
                    { date: '6/13/2025 - 7:00 PM', venue: 'BBMAC #1', opponent: 'Odin A', score: 'TBD', result: 'pending', type: 'Group D' },
                    { date: '6/14/2025 - 8:55 AM', venue: 'Granite Hills #1', opponent: 'CBAD Black', score: 'TBD', result: 'pending', type: 'Group D' },
                    { date: '6/14/2025 - 2:25 PM', venue: 'Granite Hills #1', opponent: 'CBAD Silver', score: 'TBD', result: 'pending', type: 'Group D' }
                ]
            };

            // Modal functionality
            const modal = document.getElementById('teamMatchesModal');
            const modalTeamName = document.getElementById('modalTeamName');
            const teamMatchesList = document.getElementById('teamMatchesList');
            const closeBtn = document.querySelector('.close');

            // Click handlers for bracket teams
            const clickableTeams = document.querySelectorAll('.clickable-team');
            clickableTeams.forEach(team => {
                team.addEventListener('click', function() {
                    const teamName = this.dataset.team;
                    const group = this.dataset.group;
                    showTeamMatches(teamName, `Group ${group} Matches`);
                });
            });

            // Click handlers for re-bracket teams
            const clickableRebracket = document.querySelectorAll('.clickable-rebracket');
            clickableRebracket.forEach(team => {
                team.addEventListener('click', function() {
                    const bracket = this.dataset.bracket;
                    const position = this.dataset.position;
                    showRebracketMatches(bracket, position);
                });
            });

            function showTeamMatches(teamName, phase) {
                modalTeamName.textContent = `${teamName} - ${phase}`;
                const matches = teamMatches[teamName] || [];
                
                if (matches.length === 0) {
                    teamMatchesList.innerHTML = '<p style="text-align: center; color: #666;">No matches found for this team.</p>';
                } else {
                    teamMatchesList.innerHTML = matches.map(match => `
                        <div class="team-match">
                            <div class="match-info">
                                <span class="match-date">${match.date}</span>
                                <span class="match-venue">${match.venue}</span>
                            </div>
                            <div class="match-result">
                                <span class="opponent">vs ${match.opponent}</span>
                                <span class="score ${match.result} ${match.type === 'No Contest' ? 'no-contest' : ''}">${match.score}</span>
                            </div>
                            ${match.type ? `<div style="font-size: 0.8rem; color: #666; margin-top: 5px;">${match.type}</div>` : ''}
                        </div>
                    `).join('');
                }
                modal.style.display = 'block';
            }

            function showRebracketMatches(bracket, position) {
                modalTeamName.textContent = `Bracket ${bracket}${position} - Re-bracket Matches`;
                teamMatchesList.innerHTML = `
                    <div class="team-match">
                        <div class="match-info">
                            <span class="match-date">6/14/2025 - 4:20 PM</span>
                            <span class="match-venue">Granite Hills #1</span>
                        </div>
                        <div class="match-result">
                            <span class="opponent">vs ${bracket}${position === '1' ? '4' : position === '2' ? '3' : position === '3' ? '2' : '1'}</span>
                            <span class="score pending">TBD</span>
                        </div>
                        <div style="font-size: 0.8rem; color: #666; margin-top: 5px;">Re-bracket Semi-final</div>
                    </div>
                    <div class="team-match">
                        <div class="match-info">
                            <span class="match-date">6/15/2025 - 10:00 AM</span>
                            <span class="match-venue">Granite Hills #1</span>
                        </div>
                        <div class="match-result">
                            <span class="opponent">Bracket ${bracket} Final</span>
                            <span class="score pending">TBD</span>
                        </div>
                        <div style="font-size: 0.8rem; color: #666; margin-top: 5px;">Bracket Final</div>
                    </div>
                `;
                modal.style.display = 'block';
            }

            // Close modal functionality
            closeBtn.addEventListener('click', function() {
                modal.style.display = 'none';
            });

            window.addEventListener('click', function(event) {
                if (event.target === modal) {
                    modal.style.display = 'none';
                }
            });
        });
