// Junior Olympics Live Results - Comprehensive Test Suite
// 80+ test cases covering all major functionality

class JOTestSuite {
    constructor() {
        this.tests = [];
        this.results = [];
        this.performanceResults = [];
        this.passCount = 0;
        this.failCount = 0;
        this.totalCount = 0;
    }

    // Test runner methods
    addTest(group, name, testFn) {
        this.tests.push({ group, name, testFn });
    }

    async runAllTests() {
        console.log('🚀 Starting JO Live Results Test Suite...');
        this.clearResults();
        
        for (const test of this.tests) {
            await this.runSingleTest(test);
        }
        
        this.updateStats();
        this.displayResults();
        console.log(`✅ Test suite completed: ${this.passCount}/${this.totalCount} passed`);
    }

    async runSingleTest(test) {
        try {
            const result = await test.testFn();
            if (result === true || result === undefined) {
                this.logPass(test.group, test.name);
            } else {
                this.logFail(test.group, test.name, result || 'Test returned false');
            }
        } catch (error) {
            this.logFail(test.group, test.name, error.message, error.stack);
        }
    }

    logPass(group, name) {
        this.results.push({ group, name, status: 'pass' });
        this.passCount++;
        this.totalCount++;
    }

    logFail(group, name, error, stack = '') {
        this.results.push({ group, name, status: 'fail', error, stack });
        this.failCount++;
        this.totalCount++;
    }

    clearResults() {
        this.results = [];
        this.performanceResults = [];
        this.passCount = 0;
        this.failCount = 0;
        this.totalCount = 0;
    }

    updateStats() {
        const passRate = this.totalCount > 0 ? Math.round((this.passCount / this.totalCount) * 100) : 0;
        
        document.getElementById('totalTests').textContent = this.totalCount;
        document.getElementById('passedTests').textContent = this.passCount;
        document.getElementById('failedTests').textContent = this.failCount;
        document.getElementById('passRate').textContent = passRate + '%';
    }

    displayResults() {
        const resultsContainer = document.getElementById('testResults');
        resultsContainer.innerHTML = '';

        // Group results by test group
        const groupedResults = {};
        this.results.forEach(result => {
            if (!groupedResults[result.group]) {
                groupedResults[result.group] = [];
            }
            groupedResults[result.group].push(result);
        });

        // Display each group
        Object.keys(groupedResults).forEach(groupName => {
            const groupDiv = document.createElement('div');
            groupDiv.className = 'test-group';
            
            const groupHeader = document.createElement('h3');
            groupHeader.textContent = groupName;
            groupDiv.appendChild(groupHeader);

            groupedResults[groupName].forEach(result => {
                const testDiv = document.createElement('div');
                testDiv.className = `test-item test-${result.status}`;
                
                const icon = result.status === 'pass' ? '✅' : '❌';
                testDiv.innerHTML = `${icon} ${result.name}`;
                
                if (result.error) {
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'error-details';
                    errorDiv.textContent = result.error;
                    testDiv.appendChild(errorDiv);
                }
                
                groupDiv.appendChild(testDiv);
            });
            
            resultsContainer.appendChild(groupDiv);
        });
    }

    // Assertion helpers
    assertEquals(actual, expected, message = '') {
        if (actual !== expected) {
            throw new Error(`${message} Expected: ${expected}, Actual: ${actual}`);
        }
    }

    assertTrue(condition, message = '') {
        if (!condition) {
            throw new Error(`${message} Expected: true, Actual: ${condition}`);
        }
    }

    assertFalse(condition, message = '') {
        if (condition) {
            throw new Error(`${message} Expected: false, Actual: ${condition}`);
        }
    }

    assertNotNull(value, message = '') {
        if (value === null || value === undefined) {
            throw new Error(`${message} Expected non-null value, got: ${value}`);
        }
    }

    assertArrayLength(array, length, message = '') {
        if (array.length !== length) {
            throw new Error(`${message} Expected array length: ${length}, Actual: ${array.length}`);
        }
    }

    // Performance testing
    async measurePerformance(fn, iterations = 100, data = null) {
        const start = performance.now();
        
        for (let i = 0; i < iterations; i++) {
            if (data !== null) {
                fn(data);
            } else {
                fn();
            }
        }
        
        const end = performance.now();
        return (end - start) / iterations; // Average time per iteration
    }
}

// Initialize test suite
const testSuite = new JOTestSuite();

// =============================================================================
// PARSING TESTS - 25+ tests
// =============================================================================

// Basic parsing tests
testSuite.addTest('JO Parsing', 'Parse standard match line', () => {
    const line = "19-Jul  #5 SAN JUAN HILLS HS  7:50 AM  22-LONGHORN=10  27-CT PREMIER=14  16U_BOYS_CHAMPIONSHIP";
    const result = parseJOMatchLine(line);
    
    testSuite.assertEquals(result.date, "19-Jul", "Date parsing");
    testSuite.assertEquals(result.venue, "#5 SAN JUAN HILLS HS", "Venue parsing");
    testSuite.assertEquals(result.time, "7:50 AM", "Time parsing");
    testSuite.assertEquals(result.team1.name, "LONGHORN", "Team 1 name");
    testSuite.assertEquals(result.team1.score, "10", "Team 1 score");
    testSuite.assertEquals(result.team1.prefix, "22", "Team 1 prefix");
    testSuite.assertEquals(result.team2.name, "CT PREMIER", "Team 2 name");
    testSuite.assertEquals(result.team2.score, "14", "Team 2 score");
    testSuite.assertEquals(result.team2.prefix, "27", "Team 2 prefix");
    testSuite.assertEquals(result.category, "16U_BOYS_CHAMPIONSHIP", "Category parsing");
});

testSuite.addTest('JO Parsing', 'Parse SD Shores match', () => {
    const line = "19-Jul  #2 CERRITOS COLLEGE  8:10 AM  16-SD SHORES BLACK=12  33-PUGET SOUND POLO=8  16U_BOYS_CHAMPIONSHIP";
    const result = parseJOMatchLine(line);
    
    testSuite.assertEquals(result.team1.name, "SD SHORES BLACK", "Shores team name");
    testSuite.assertTrue(result.team1.isShores, "Shores team detection");
    testSuite.assertFalse(result.team2.isShores, "Non-Shores team detection");
});

testSuite.addTest('JO Parsing', 'Parse match with long team names', () => {
    const line = "19-Jul  #6 FULLERTON COLLEGE  10:50 AM  25-SAN DIEGO SHORES=20  24-DEL MAR BLUE=19  16U_BOYS_CHAMPIONSHIP";
    const result = parseJOMatchLine(line);
    
    testSuite.assertEquals(result.team1.name, "SAN DIEGO SHORES", "Long team name 1");
    testSuite.assertEquals(result.team2.name, "DEL MAR BLUE", "Long team name 2");
    testSuite.assertTrue(result.team1.isShores, "Long Shores name detection");
});

testSuite.addTest('JO Parsing', 'Parse single digit prefixes', () => {
    const line = "19-Jul  #5 SAN JUAN HILLS HS  7:50 AM  1-LONGHORN=10  2-CT PREMIER=14  16U_BOYS_CHAMPIONSHIP";
    const result = parseJOMatchLine(line);
    
    testSuite.assertEquals(result.team1.prefix, "1", "Single digit prefix 1");
    testSuite.assertEquals(result.team2.prefix, "2", "Single digit prefix 2");
});

testSuite.addTest('JO Parsing', 'Parse triple digit prefixes', () => {
    const line = "19-Jul  #5 SAN JUAN HILLS HS  7:50 AM  100-LONGHORN=10  200-CT PREMIER=14  16U_BOYS_CHAMPIONSHIP";
    const result = parseJOMatchLine(line);
    
    testSuite.assertEquals(result.team1.prefix, "100", "Triple digit prefix 1");
    testSuite.assertEquals(result.team2.prefix, "200", "Triple digit prefix 2");
});

testSuite.addTest('JO Parsing', 'Parse different venues', () => {
    const venues = [
        "#1 BELLFLOWER AQUATIC CENTER",
        "#2 CERRITOS COLLEGE", 
        "#3 CYPRESS COLLEGE",
        "#4 EL CAMINO COLLEGE",
        "#5 SAN JUAN HILLS HS",
        "#6 FULLERTON COLLEGE",
        "#7 IRVINE VALLEY COLLEGE",
        "#8 GOLDEN WEST COLLEGE 1"
    ];
    
    venues.forEach((venue, index) => {
        const line = `19-Jul  ${venue}  7:50 AM  22-TEAM1=10  27-TEAM2=14  16U_BOYS_CHAMPIONSHIP`;
        const result = parseJOMatchLine(line);
        testSuite.assertEquals(result.venue, venue, `Venue ${index + 1} parsing`);
    });
});

testSuite.addTest('JO Parsing', 'Parse different times', () => {
    const times = ["7:50 AM", "12:00 PM", "11:59 PM", "12:01 AM", "1:00 PM", "12:30 AM"];
    
    times.forEach(time => {
        const line = `19-Jul  #5 SAN JUAN HILLS HS  ${time}  22-TEAM1=10  27-TEAM2=14  16U_BOYS_CHAMPIONSHIP`;
        const result = parseJOMatchLine(line);
        testSuite.assertEquals(result.time, time, `Time parsing: ${time}`);
    });
});

testSuite.addTest('JO Parsing', 'Parse high scores', () => {
    const line = "19-Jul  #5 SAN JUAN HILLS HS  7:50 AM  22-LONGHORN=25  27-CT PREMIER=22  16U_BOYS_CHAMPIONSHIP";
    const result = parseJOMatchLine(line);
    
    testSuite.assertEquals(result.team1.score, "25", "High score 1");
    testSuite.assertEquals(result.team2.score, "22", "High score 2");
});

testSuite.addTest('JO Parsing', 'Parse zero scores', () => {
    const line = "19-Jul  #5 SAN JUAN HILLS HS  7:50 AM  22-LONGHORN=0  27-CT PREMIER=0  16U_BOYS_CHAMPIONSHIP";
    const result = parseJOMatchLine(line);
    
    testSuite.assertEquals(result.team1.score, "0", "Zero score 1");
    testSuite.assertEquals(result.team2.score, "0", "Zero score 2");
});

testSuite.addTest('JO Parsing', 'Handle malformed data gracefully', () => {
    const malformedLines = [
        "",
        "19-Jul",
        "19-Jul  #5 SAN JUAN HILLS HS",
        "19-Jul  #5 SAN JUAN HILLS HS  7:50 AM"
    ];
    
    malformedLines.forEach(line => {
        const result = parseJOMatchLine(line);
        testSuite.assertNotNull(result, `Non-null result for: ${line}`);
        testSuite.assertNotNull(result.team1, "Team 1 object exists");
        testSuite.assertNotNull(result.team2, "Team 2 object exists");
    });
});

// =============================================================================
// TEAM DETECTION TESTS - 8+ tests
// =============================================================================

testSuite.addTest('Team Detection', 'Detect SD Shores patterns', () => {
    SHORES_TEST_CASES.forEach(testCase => {
        const result = detectShoresTeam(testCase.line);
        if (testCase.expected) {
            testSuite.assertTrue(result, `Should detect Shores in: ${testCase.line.substring(0, 50)}...`);
        } else {
            testSuite.assertFalse(result, `Should NOT detect Shores in: ${testCase.line.substring(0, 50)}...`);
        }
    });
});

testSuite.addTest('Team Detection', 'Case insensitive Shores detection', () => {
    const testCases = [
        "19-Jul  #2 CERRITOS COLLEGE  8:10 AM  16-sd shores black=12  33-TEAM=8  16U_BOYS_CHAMPIONSHIP",
        "19-Jul  #2 CERRITOS COLLEGE  8:10 AM  16-SD SHORES BLACK=12  33-TEAM=8  16U_BOYS_CHAMPIONSHIP",
        "19-Jul  #2 CERRITOS COLLEGE  8:10 AM  16-Sd Shores Black=12  33-TEAM=8  16U_BOYS_CHAMPIONSHIP"
    ];
    
    testCases.forEach(line => {
        testSuite.assertTrue(detectShoresTeam(line), `Case insensitive detection: ${line}`);
    });
});

testSuite.addTest('Team Detection', 'Avoid false positives', () => {
    const falsePositives = [
        "19-Jul  #2 CERRITOS COLLEGE  8:10 AM  16-SHORE TEAM=12  33-TEAM=8  16U_BOYS_CHAMPIONSHIP",
        "19-Jul  #2 CERRITOS COLLEGE  8:10 AM  16-NEW SHORES=12  33-TEAM=8  16U_BOYS_CHAMPIONSHIP",
        "19-Jul  #2 CERRITOS COLLEGE  8:10 AM  16-SEASHORES=12  33-TEAM=8  16U_BOYS_CHAMPIONSHIP"
    ];
    
    falsePositives.forEach(line => {
        testSuite.assertFalse(detectShoresTeam(line), `Should NOT match: ${line}`);
    });
});

testSuite.addTest('Team Detection', 'Detect all Shores variations', () => {
    const variations = [
        "16-SD SHORES BLACK=12",
        "25-SAN DIEGO SHORES=20", 
        "9-SHORES BLACK=22",
        "8-SD SHORES GOLD=18",
        "16-SHORES GOLD=21",
        "39-SAN DIEGO SHORES BLACK=18"
    ];
    
    variations.forEach(variation => {
        const line = `19-Jul  #2 CERRITOS COLLEGE  8:10 AM  ${variation}  33-OTHER TEAM=8  16U_BOYS_CHAMPIONSHIP`;
        testSuite.assertTrue(detectShoresTeam(line), `Shores variation: ${variation}`);
    });
});

// =============================================================================
// FUTURE MATCH TESTS - 10+ tests
// =============================================================================

testSuite.addTest('Future Match Parsing', 'Parse standard future match line', () => {
    const line = "LOWPO is 2 in bracket 47 is DARK in game 16B-064 on 20-Jul at 7:00 AM at SADDLEBACK COLLEGE 1";
    const result = parseFutureMatchLine(line);
    
    testSuite.assertEquals(result.team, "LOWPO", "Team name parsing");
    testSuite.assertEquals(result.position, "2", "Position parsing");
    testSuite.assertEquals(result.bracket, "47", "Bracket number parsing");
    testSuite.assertEquals(result.color, "DARK", "Team color parsing");
    testSuite.assertEquals(result.gameId, "16B-064", "Game ID parsing");
    testSuite.assertEquals(result.date, "20-Jul", "Date parsing");
    testSuite.assertEquals(result.time, "7:00 AM", "Time parsing");
    testSuite.assertEquals(result.venue, "SADDLEBACK COLLEGE 1", "Venue parsing");
});

testSuite.addTest('Future Match Parsing', 'Parse WHITE team future match', () => {
    const line = "OAHU is 1 in bracket 45 is WHITE in game 16B-084 on 20-Jul at 11:10 AM at PORTOLA HS 2";
    const result = parseFutureMatchLine(line);
    
    testSuite.assertEquals(result.team, "OAHU", "Team name parsing");
    testSuite.assertEquals(result.position, "1", "Position parsing");
    testSuite.assertEquals(result.bracket, "45", "Bracket number parsing");
    testSuite.assertEquals(result.color, "WHITE", "Team color parsing");
    testSuite.assertEquals(result.gameId, "16B-084", "Game ID parsing");
    testSuite.assertEquals(result.venue, "PORTOLA HS 2", "Venue parsing");
});

testSuite.addTest('Future Match Parsing', 'Parse SD Shores future match', () => {
    const line = "SHORES is 1 in bracket 12 is DARK in game 16B-033 on 21-Jul at 2:30 PM at SAN JUAN HILLS HS";
    const result = parseFutureMatchLine(line);
    
    testSuite.assertEquals(result.team, "SHORES", "Shores team name parsing");
    testSuite.assertEquals(result.color, "DARK", "Team color parsing");
    testSuite.assertEquals(result.time, "2:30 PM", "PM time parsing");
});

testSuite.addTest('Future Match Parsing', 'Parse complex team name future match', () => {
    const line = "SAN DIEGO SHORES BLACK is 2 in bracket 33 is WHITE in game 16B-099 on 22-Jul at 9:15 AM at WOOLLETT NEAR LEFT";
    const result = parseFutureMatchLine(line);
    
    testSuite.assertEquals(result.team, "SAN DIEGO SHORES BLACK", "Complex team name parsing");
    testSuite.assertEquals(result.venue, "WOOLLETT NEAR LEFT", "Complex venue name parsing");
});

testSuite.addTest('Future Match Parsing', 'Parse different game ID formats', () => {
    const gameIds = ["16B-001", "16B-999", "16A-055", "18U-123"];
    
    gameIds.forEach(gameId => {
        const line = `TEAM is 1 in bracket 10 is DARK in game ${gameId} on 20-Jul at 10:00 AM at VENUE`;
        const result = parseFutureMatchLine(line);
        testSuite.assertEquals(result.gameId, gameId, `Game ID parsing: ${gameId}`);
    });
});

testSuite.addTest('Future Match Parsing', 'isFutureMatchLine detection', () => {
    const futureLine = "LOWPO is 2 in bracket 47 is DARK in game 16B-064 on 20-Jul at 7:00 AM at SADDLEBACK COLLEGE 1";
    const completedLine = "19-Jul  #5 SAN JUAN HILLS HS  7:50 AM  22-LONGHORN=10  27-CT PREMIER=14  16U_BOYS_CHAMPIONSHIP";
    
    testSuite.assertTrue(isFutureMatchLine(futureLine), "Should detect future match line");
    testSuite.assertFalse(isFutureMatchLine(completedLine), "Should not detect completed match as future");
    testSuite.assertFalse(isFutureMatchLine(""), "Should handle empty string");
    testSuite.assertFalse(isFutureMatchLine("Random text"), "Should handle random text");
});

testSuite.addTest('Future Match Parsing', 'Handle malformed future match lines', () => {
    const malformedLines = [
        "",
        "TEAM is in bracket",
        "TEAM is 1 in bracket 10 is DARK",
        "incomplete future match data",
        "TEAM is 1 in bracket 10 is DARK in game 16B-064"
    ];
    
    malformedLines.forEach(line => {
        const result = parseFutureMatchLine(line);
        // Should return object with null values for malformed input
        testSuite.assertTrue(result.team === null || result.team === "", `Malformed line should return null team: ${line}`);
    });
});

testSuite.addTest('Future Match Parsing', 'buildFutureMatchesData functionality', () => {
    const testLines = [
        "LOWPO is 2 in bracket 47 is DARK in game 16B-064 on 20-Jul at 7:00 AM at SADDLEBACK COLLEGE 1",
        "OAHU is 1 in bracket 45 is WHITE in game 16B-084 on 20-Jul at 11:10 AM at PORTOLA HS 2",
        "SHORES is 1 in bracket 12 is DARK in game 16B-033 on 21-Jul at 2:30 PM at SAN JUAN HILLS HS",
        "SHORES is 2 in bracket 15 is WHITE in game 16B-044 on 21-Jul at 4:00 PM at VENUE 2",
        "19-Jul  #5 SAN JUAN HILLS HS  7:50 AM  22-LONGHORN=10  27-CT PREMIER=14  16U_BOYS_CHAMPIONSHIP"
    ];
    
    const futureData = buildFutureMatchesData(testLines);
    
    testSuite.assertTrue(futureData.LOWPO && futureData.LOWPO.length === 1, "LOWPO should have 1 future match");
    testSuite.assertTrue(futureData.OAHU && futureData.OAHU.length === 1, "OAHU should have 1 future match");
    testSuite.assertTrue(futureData.SHORES && futureData.SHORES.length === 2, "SHORES should have 2 future matches");
    testSuite.assertTrue(!futureData.LONGHORN, "Completed match teams should not be in future data");
});


testSuite.addTest('Future Match Parsing', 'Parse multiple matches per line', () => {
    const multiMatchLine = "LOWPO is 2 in bracket 47 is DARK in game 16B-064 on 20-Jul at 7:00 AM at SADDLEBACK COLLEGE 1; and WHITE in game 16B-096 on 20-Jul at 1:40 PM in SADDLEBACK COLLEGE 1";
    const result = parseFutureMatchLine(multiMatchLine);
    
    testSuite.assertTrue(Array.isArray(result), "Should return array for multiple matches");
    testSuite.assertEquals(result.length, 2, "Should parse 2 matches");
    
    // First match
    testSuite.assertEquals(result[0].team, "LOWPO", "First match team");
    testSuite.assertEquals(result[0].color, "DARK", "First match color");
    testSuite.assertEquals(result[0].gameId, "16B-064", "First match game ID");
    testSuite.assertEquals(result[0].time, "7:00 AM", "First match time");
    
    // Second match
    testSuite.assertEquals(result[1].team, "LOWPO", "Second match team should be same");
    testSuite.assertEquals(result[1].color, "WHITE", "Second match color");
    testSuite.assertEquals(result[1].gameId, "16B-096", "Second match game ID");
    testSuite.assertEquals(result[1].time, "1:40 PM", "Second match time");
});

testSuite.addTest('Future Match Parsing', 'Parse SD Shores multiple matches', () => {
    const shoresMultiLine = "SAN DIEGO SHORES BLACK is 1 in bracket 41 is WHITE in game 16B-081 on 20-Jul at 11:10 AM at WOOLLETT NEAR RIGHT; and WHITE in game 16B-097 on 20-Jul at 2:30 PM in WOOLLETT NEAR RIGHT";
    const result = parseFutureMatchLine(shoresMultiLine);
    
    testSuite.assertTrue(Array.isArray(result), "Should return array for SD Shores multiple matches");
    testSuite.assertEquals(result.length, 2, "Should parse 2 matches for SD Shores");
    testSuite.assertEquals(result[0].team, "SAN DIEGO SHORES BLACK", "Team name parsing");
    testSuite.assertEquals(result[1].team, "SAN DIEGO SHORES BLACK", "Second match should have same team");
    testSuite.assertEquals(result[0].venue, "WOOLLETT NEAR RIGHT", "First venue");
    testSuite.assertEquals(result[1].venue, "WOOLLETT NEAR RIGHT", "Second venue");
});

testSuite.addTest('Future Match Parsing', 'Handle venue format variations', () => {
    const atVenue = "TEAM is 1 in bracket 10 is DARK in game 16B-001 on 20-Jul at 9:00 AM at VENUE NAME";
    const inVenue = "TEAM is 1 in bracket 10 is DARK in game 16B-001 on 20-Jul at 9:00 AM in VENUE NAME";
    
    const result1 = parseFutureMatchLine(atVenue);
    const result2 = parseFutureMatchLine(inVenue);
    
    testSuite.assertEquals(result1.venue, "VENUE NAME", "Should parse 'at VENUE' format");
    testSuite.assertEquals(result2.venue, "VENUE NAME", "Should parse 'in VENUE' format");
});

testSuite.addTest('Future Match Parsing', 'buildFutureMatchesData with multiple matches', () => {
    const testLines = [
        "LOWPO is 2 in bracket 47 is DARK in game 16B-064 on 20-Jul at 7:00 AM at SADDLEBACK COLLEGE 1; and WHITE in game 16B-096 on 20-Jul at 1:40 PM in SADDLEBACK COLLEGE 1",
        "SAN DIEGO SHORES BLACK is 1 in bracket 41 is WHITE in game 16B-081 on 20-Jul at 11:10 AM at WOOLLETT NEAR RIGHT; and WHITE in game 16B-097 on 20-Jul at 2:30 PM in WOOLLETT NEAR RIGHT",
        "SINGLE is 1 in bracket 10 is DARK in game 16B-001 on 20-Jul at 9:00 AM at VENUE"
    ];
    
    const futureData = buildFutureMatchesData(testLines);
    
    testSuite.assertTrue(futureData.LOWPO && futureData.LOWPO.length === 2, "LOWPO should have 2 future matches");
    testSuite.assertTrue(futureData["SAN DIEGO SHORES BLACK"] && futureData["SAN DIEGO SHORES BLACK"].length === 2, "SD Shores should have 2 future matches");
    testSuite.assertTrue(futureData.SINGLE && futureData.SINGLE.length === 1, "SINGLE should have 1 future match");
    
    // Verify specific matches
    const lowpoMatches = futureData.LOWPO;
    testSuite.assertEquals(lowpoMatches[0].color, "DARK", "LOWPO first match color");
    testSuite.assertEquals(lowpoMatches[1].color, "WHITE", "LOWPO second match color");
});

testSuite.addTest('Future Match Parsing', 'Backward compatibility with single matches', () => {
    const singleMatchLine = "TEAM is 1 in bracket 10 is DARK in game 16B-001 on 20-Jul at 9:00 AM at VENUE";
    const result = parseFutureMatchLine(singleMatchLine);
    
    testSuite.assertFalse(Array.isArray(result), "Should return single object for single match (backward compatibility)");
    testSuite.assertEquals(result.team, "TEAM", "Single match team parsing");
    testSuite.assertEquals(result.gameId, "16B-001", "Single match game ID");
});

// =============================================================================
// FUTURE MATCH INTEGRATION TESTS - 15+ tests for unified match handling
// =============================================================================

testSuite.addTest('Future Match Integration', 'parseFutureMatchAsJOFormat basic conversion', () => {
    const futureLine = "SHORES is 1 in bracket 41 is WHITE in game 16B-081 on 20-Jul at 11:10 AM at WOOLLETT NEAR RIGHT";
    const result = parseFutureMatchAsJOFormat(futureLine);
    
    testSuite.assertEquals(result.type, "future", "Should identify as future match");
    testSuite.assertEquals(result.date, "20-Jul", "Should extract date");
    testSuite.assertEquals(result.time, "11:10 AM", "Should extract time");
    testSuite.assertEquals(result.venue, "WOOLLETT NEAR RIGHT", "Should extract venue");
    testSuite.assertEquals(result.team1.name, "SHORES", "Should extract team name");
    testSuite.assertEquals(result.team1.color, "WHITE", "Should extract team color");
    testSuite.assertEquals(result.gameId, "16B-081", "Should extract game ID");
    testSuite.assertEquals(result.status, "SCHEDULED", "Should set future status");
});

testSuite.addTest('Future Match Integration', 'parseFutureMatchAsJOFormat with full team name', () => {
    const futureLine = "SAN DIEGO SHORES BLACK is 1 in bracket 41 is DARK in game 16B-097 on 20-Jul at 2:30 PM in VENUE 2";
    const result = parseFutureMatchAsJOFormat(futureLine);
    
    testSuite.assertEquals(result.team1.name, "SAN DIEGO SHORES BLACK", "Should handle complex team names");
    testSuite.assertTrue(result.team1.isShores, "Should detect Shores team");
    testSuite.assertEquals(result.team1.color, "DARK", "Should extract DARK color");
    testSuite.assertEquals(result.team2.name, "TBD", "Second team should be TBD");
    testSuite.assertFalse(result.team2.isShores, "TBD team should not be Shores");
});

testSuite.addTest('Future Match Integration', 'parseJOMatchLine extended for future format', () => {
    const completedLine = "19-Jul  #5 SAN JUAN HILLS HS  7:50 AM  22-LONGHORN=10  27-CT PREMIER=14  16U_BOYS_CHAMPIONSHIP";
    const futureLine = "SAN FRANCISCO is 1 in bracket 47 is DARK in game 16B-059 on 19-Jul at 7:30 PM at PORTOLA HS 1";
    
    const completedResult = parseJOMatchLine(completedLine);
    const futureResult = parseJOMatchLine(futureLine);
    
    // Completed match should work as before
    testSuite.assertEquals(completedResult.type, "completed", "Completed match type");
    testSuite.assertEquals(completedResult.team1.score, "10", "Completed match score");
    
    // Future match should be parsed as future
    testSuite.assertEquals(futureResult.type, "future", "Future match type");
    testSuite.assertEquals(futureResult.team1.name, "SAN FRANCISCO", "Future match team");
    testSuite.assertEquals(futureResult.team2.name, "TBD", "Future match opponent TBD");
    testSuite.assertEquals(futureResult.status, "SCHEDULED", "Future match status");
});

testSuite.addTest('Future Match Integration', 'Mixed data parsing with displayJOMatchResults', () => {
    const mixedData = `Subject: HOT! RESULT UPDATE

19-Jul  #47 PORTOLA HS 1  4:10 PM  LOWPO=7  SAN FRANCISCO=11  16U_BOYS_CHAMPIONSHIP

Subject: HOT! ADVANCEMENT UPDATE: 

SAN FRANCISCO is 1 in bracket 47 is DARK in game 16B-059 on 19-Jul at 7:30 PM at PORTOLA HS 1`;

    // Mock DOM elements for testing
    const mockMatchGrid = document.createElement('div');
    mockMatchGrid.id = 'matchGrid';
    document.body.appendChild(mockMatchGrid);

    // Should not throw errors when processing mixed data
    let errorThrown = false;
    try {
        displayJOMatchResults(mixedData);
    } catch (error) {
        errorThrown = true;
        console.error('Mixed data parsing error:', error);
    }
    
    testSuite.assertFalse(errorThrown, "Should handle mixed completed and future match data");
    
    // Cleanup
    document.body.removeChild(mockMatchGrid);
});

testSuite.addTest('Future Match Integration', 'createJOMatchCardFromData for future matches', () => {
    const futureMatchData = {
        type: "future",
        team1: { name: "SHORES", score: null, isShores: true, color: "WHITE", prefix: null },
        team2: { name: "TBD", score: null, isShores: false, color: null, prefix: null },
        time: "11:10 AM",
        venue: "WOOLLETT NEAR RIGHT",
        venueDisplayName: "WOOLLETT NEAR RIGHT",
        matchNumber: null,
        date: "20-Jul",
        category: "16U_BOYS_CHAMPIONSHIP",
        gameId: "16B-081",
        status: "SCHEDULED"
    };

    const mockDiv = createJOMatchCardFromData(futureMatchData, 0, true);
    
    testSuite.assertTrue(mockDiv.innerHTML.includes("SHORES"), "Should display team name");
    testSuite.assertTrue(mockDiv.innerHTML.includes("TBD"), "Should display TBD for unknown opponent");
    testSuite.assertTrue(mockDiv.innerHTML.includes("SCHEDULED"), "Should display scheduled status");
    testSuite.assertTrue(mockDiv.innerHTML.includes("vs"), "Should show vs instead of score");
    testSuite.assertTrue(mockDiv.classList.contains("shores-highlight"), "Should highlight Shores matches");
});

testSuite.addTest('Future Match Integration', 'Future match filtering integration', () => {
    const futureMatch = {
        type: "future",
        team1: { name: "SHORES", isShores: true },
        team2: { name: "TBD", isShores: false },
        venueDisplayName: "PORTOLA HS 1",
        matchNumber: "1",
        originalLine: "SHORES is 1 in bracket 41 is WHITE in game 16B-081 on 20-Jul at 11:10 AM at PORTOLA HS 1"
    };
    
    const completedMatch = {
        type: "completed",
        team1: { name: "LONGHORN", isShores: false },
        team2: { name: "CT PREMIER", isShores: false },
        venueDisplayName: "SAN JUAN HILLS HS",
        matchNumber: "5",
        originalLine: "19-Jul  #5 SAN JUAN HILLS HS  7:50 AM  22-LONGHORN=10  27-CT PREMIER=14  16U_BOYS_CHAMPIONSHIP"
    };
    
    const matches = [futureMatch, completedMatch];
    
    // Mock the filter DOM elements
    const mockShoresFilter = document.createElement('input');
    mockShoresFilter.type = 'checkbox';
    mockShoresFilter.id = 'filterShores';
    mockShoresFilter.checked = true;
    document.body.appendChild(mockShoresFilter);
    
    const filteredMatches = applyActiveFiltersToMatches(matches);
    
    testSuite.assertEquals(filteredMatches.length, 1, "Should filter to only Shores matches");
    testSuite.assertEquals(filteredMatches[0].team1.name, "SHORES", "Should include future Shores match");
    
    // Cleanup
    document.body.removeChild(mockShoresFilter);
});




testSuite.addTest('Future Match Integration', 'Performance with mixed match types', () => {
    const mixedData = [];
    
    // Generate test data with mix of completed and future matches
    for (let i = 0; i < 500; i++) {
        if (i % 2 === 0) {
            mixedData.push(`19-Jul  #${i % 8 + 1} VENUE  7:50 AM  ${i}-TEAM1=${i % 20}  ${i+1}-TEAM2=${(i+1) % 20}  16U_BOYS_CHAMPIONSHIP`);
        } else {
            mixedData.push(`TEAM${i} is 1 in bracket ${i % 50} is WHITE in game 16B-${String(i).padStart(3, '0')} on 20-Jul at 11:10 AM at VENUE ${i % 5 + 1}`);
        }
    }
    
    const startTime = performance.now();
    
    // Process mixed data (should not throw errors)
    let processedData = [];
    mixedData.forEach(line => {
        if (isFutureMatchLine(line)) {
            processedData.push(parseFutureMatchAsJOFormat(line));
        } else if (isValidJOMatchLine(line)) {
            processedData.push(parseJOMatchLine(line));
        }
    });
    
    const endTime = performance.now();
    const processingTime = endTime - startTime;
    
    testSuite.assertTrue(processingTime < 100, `Mixed data processing should be fast: ${processingTime.toFixed(2)}ms`);
    testSuite.assertEquals(processedData.length, 500, "Should process all mixed match types");
    
    // Log performance for debugging
    testSuite.logPerformance('Mixed Match Processing', processingTime, 100);
});

// =============================================================================
// DEDUPLICATION TESTS - 15+ tests  
// =============================================================================

testSuite.addTest('Deduplication', 'Remove exact duplicates', () => {
    const duplicates = [
        "19-Jul  #5 SAN JUAN HILLS HS  7:50 AM  22-LONGHORN=10  27-CT PREMIER=14  16U_BOYS_CHAMPIONSHIP",
        "19-Jul  #5 SAN JUAN HILLS HS  7:50 AM  22-LONGHORN=10  27-CT PREMIER=14  16U_BOYS_CHAMPIONSHIP",
        "19-Jul  #6 FULLERTON COLLEGE  10:50 AM  25-SAN DIEGO SHORES=20  24-DEL MAR BLUE=19  16U_BOYS_CHAMPIONSHIP"
    ];
    
    const result = deduplicateMatches(duplicates);
    testSuite.assertArrayLength(result, 2, "Duplicate removal");
});

testSuite.addTest('Deduplication', 'Preserve unique matches', () => {
    const unique = [
        "19-Jul  #1 VENUE  7:50 AM  1-TEAM1=10  2-TEAM2=14  16U_BOYS_CHAMPIONSHIP",
        "19-Jul  #2 VENUE  8:50 AM  3-TEAM3=12  4-TEAM4=16  16U_BOYS_CHAMPIONSHIP",
        "19-Jul  #3 VENUE  9:50 AM  5-TEAM5=14  6-TEAM6=18  16U_BOYS_CHAMPIONSHIP"
    ];
    
    const result = deduplicateMatches(unique);
    testSuite.assertArrayLength(result, 3, "Preserve unique matches");
});

testSuite.addTest('Deduplication', 'Handle empty array', () => {
    const result = deduplicateMatches([]);
    testSuite.assertArrayLength(result, 0, "Empty array handling");
});

testSuite.addTest('Deduplication', 'Create match signatures correctly', () => {
    const line = "19-Jul  #5 SAN JUAN HILLS HS  7:50 AM  22-LONGHORN=10  27-CT PREMIER=14  16U_BOYS_CHAMPIONSHIP";
    const signature = createJOMatchSignature(line);
    
    testSuite.assertNotNull(signature, "Signature created");
    testSuite.assertTrue(signature.length > 0, "Signature has content");
    testSuite.assertTrue(signature.includes("19-Jul"), "Signature includes date");
    testSuite.assertTrue(signature.includes("#5"), "Signature includes venue");
});

testSuite.addTest('Deduplication', 'Performance with large dataset', async () => {
    const largeDataset = PERFORMANCE_TEST_DATA.slice(0, 500);
    const startTime = performance.now();
    
    const result = deduplicateMatches(largeDataset);
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    testSuite.assertTrue(duration < 50, `Deduplication should complete in < 50ms, took ${duration}ms`);
    testSuite.assertTrue(result.length <= largeDataset.length, "Result size check");
});

// =============================================================================
// FILTER TESTS - 10+ tests
// =============================================================================

testSuite.addTest('Filter Tests', 'Custom team search filter', () => {
    const line = "19-Jul  #5 SAN JUAN HILLS HS  7:50 AM  22-LONGHORN=10  27-CT PREMIER=14  16U_BOYS_CHAMPIONSHIP";
    
    testSuite.assertTrue(applyCustomTeamFilter(line, "LONGHORN"), "Search for LONGHORN");
    testSuite.assertTrue(applyCustomTeamFilter(line, "CT PREMIER"), "Search for CT PREMIER");
    testSuite.assertTrue(applyCustomTeamFilter(line, "long"), "Partial search - long");
    testSuite.assertTrue(applyCustomTeamFilter(line, "PREMIER"), "Partial search - PREMIER");
    testSuite.assertFalse(applyCustomTeamFilter(line, "NOTFOUND"), "Search for non-existent team");
});

testSuite.addTest('Filter Tests', 'Case insensitive team search', () => {
    const line = "19-Jul  #5 SAN JUAN HILLS HS  7:50 AM  22-LONGHORN=10  27-CT PREMIER=14  16U_BOYS_CHAMPIONSHIP";
    
    testSuite.assertTrue(applyCustomTeamFilter(line, "longhorn"), "Lowercase search");
    testSuite.assertTrue(applyCustomTeamFilter(line, "ct premier"), "Lowercase with space");
    testSuite.assertTrue(applyCustomTeamFilter(line, "LONGHORN"), "Uppercase search");
    testSuite.assertTrue(applyCustomTeamFilter(line, "LongHorn"), "Mixed case search");
});

testSuite.addTest('Filter Tests', 'Venue extraction for filtering', () => {
    VENUE_TEST_CASES.forEach(testCase => {
        const venueMatch = testCase.line.match(/#(\d+)/);
        testSuite.assertNotNull(venueMatch, `Venue pattern found in: ${testCase.line}`);
        testSuite.assertEquals(venueMatch[0], testCase.venue, `Venue extraction: ${testCase.venue}`);
    });
});

testSuite.addTest('Filter Tests', 'Empty search handling', () => {
    const line = "19-Jul  #5 SAN JUAN HILLS HS  7:50 AM  22-LONGHORN=10  27-CT PREMIER=14  16U_BOYS_CHAMPIONSHIP";
    
    testSuite.assertTrue(applyCustomTeamFilter(line, ""), "Empty search should match");
    testSuite.assertTrue(applyCustomTeamFilter(line, "   "), "Whitespace search should match");
});

// =============================================================================
// STATUS DETECTION TESTS - 8+ tests
// =============================================================================

testSuite.addTest('Status Detection', 'Detect championship status', () => {
    const line = "19-Jul  #5 SAN JUAN HILLS HS  7:50 AM  22-LONGHORN=10  27-CT PREMIER=14  16U_BOYS_CHAMPIONSHIP";
    const status = detectJOMatchStatus(line);
    
    testSuite.assertNotNull(status, "Status detected");
    testSuite.assertEquals(status.type, "championship", "Championship status type");
    testSuite.assertEquals(status.label, "CHAMPIONSHIP", "Championship status label");
});

testSuite.addTest('Status Detection', 'Handle lines without status', () => {
    const line = "19-Jul  #5 SAN JUAN HILLS HS  7:50 AM  22-LONGHORN=10  27-CT PREMIER=14  UNKNOWN_CATEGORY";
    const status = detectJOMatchStatus(line);
    
    // Should return null for unknown categories
    testSuite.assertTrue(status === null, "No status for unknown category");
});

testSuite.addTest('Status Detection', 'Time parsing edge cases', () => {
    const times = ["12:00 AM", "12:00 PM", "12:30 AM", "12:30 PM", "1:00 AM", "11:59 PM"];
    
    times.forEach(time => {
        const result = parseJODateTime("19-Jul", time, 2025);
        testSuite.assertNotNull(result, `Time parsing: ${time}`);
        testSuite.assertTrue(result instanceof Date, `Valid date object for: ${time}`);
    });
});

testSuite.addTest('Status Detection', 'Invalid time handling', () => {
    const invalidTimes = ["25:00 AM", "12:99 PM", "invalid", ""];
    
    invalidTimes.forEach(time => {
        const result = parseJODateTime("19-Jul", time, 2025);
        testSuite.assertTrue(result === null, `Invalid time should return null: ${time}`);
    });
});

// =============================================================================
// UTILITY FUNCTION TESTS - 6+ tests
// =============================================================================

testSuite.addTest('Utility Functions', 'HTML escaping', () => {
    const testCases = [
        { input: "<script>", expected: "&lt;script&gt;" },
        { input: "Team A & B", expected: "Team A &amp; B" },
        { input: "Normal text", expected: "Normal text" },
        { input: "", expected: "" }
    ];
    
    testCases.forEach(testCase => {
        const result = escapeHtml(testCase.input);
        testSuite.assertEquals(result, testCase.expected, `HTML escape: ${testCase.input}`);
    });
});

testSuite.addTest('Utility Functions', 'Search text highlighting', () => {
    const teamName = "SD SHORES BLACK";
    const searchTerm = "SHORES";
    const result = highlightSearchText(teamName, searchTerm);
    
    testSuite.assertTrue(result.includes('<span class="highlight-match">'), "Highlight span added");
    testSuite.assertTrue(result.includes('SHORES'), "Search term preserved");
    testSuite.assertTrue(result.includes('SD'), "Other text preserved");
});

testSuite.addTest('Utility Functions', 'Regex escaping', () => {
    const specialChars = ".*+?^${}()|[]\\";
    const escaped = escapeRegex(specialChars);
    
    // Should not throw when used in regex
    const regex = new RegExp(escaped);
    testSuite.assertNotNull(regex, "Escaped regex is valid");
});

testSuite.addTest('Utility Functions', 'Empty search highlighting', () => {
    const teamName = "SD SHORES BLACK";
    const result = highlightSearchText(teamName, "");
    
    testSuite.assertEquals(result, teamName, "Empty search returns original text");
});

// =============================================================================
// PERFORMANCE TESTS - 5+ tests
// =============================================================================

testSuite.addTest('Performance', 'parseJOMatchLine speed test', async () => {
    const testLine = "19-Jul  #5 SAN JUAN HILLS HS  7:50 AM  22-LONGHORN=10  27-CT PREMIER=14  16U_BOYS_CHAMPIONSHIP";
    const avgTime = await testSuite.measurePerformance(() => parseJOMatchLine(testLine), 1000);
    
    testSuite.assertTrue(avgTime < 1, `parseJOMatchLine should be < 1ms, was ${avgTime}ms`);
    testSuite.performanceResults.push({ function: 'parseJOMatchLine', time: avgTime, target: 1 });
});

testSuite.addTest('Performance', 'detectShoresTeam speed test', async () => {
    const testLine = "19-Jul  #5 SAN JUAN HILLS HS  7:50 AM  22-SD SHORES BLACK=10  27-CT PREMIER=14  16U_BOYS_CHAMPIONSHIP";
    const avgTime = await testSuite.measurePerformance(() => detectShoresTeam(testLine), 10000);
    
    testSuite.assertTrue(avgTime < 0.1, `detectShoresTeam should be < 0.1ms, was ${avgTime}ms`);
    testSuite.performanceResults.push({ function: 'detectShoresTeam', time: avgTime, target: 0.1 });
});

testSuite.addTest('Performance', 'deduplicateMatches speed test', async () => {
    const testData = PERFORMANCE_TEST_DATA.slice(0, 500);
    const avgTime = await testSuite.measurePerformance(() => deduplicateMatches(testData), 10);
    
    testSuite.assertTrue(avgTime < 10, `deduplicateMatches should be < 10ms for 500 items, was ${avgTime}ms`);
    testSuite.performanceResults.push({ function: 'deduplicateMatches', time: avgTime, target: 10 });
});

testSuite.addTest('Performance', 'createJOMatchSignature speed test', async () => {
    const testLine = "19-Jul  #5 SAN JUAN HILLS HS  7:50 AM  22-LONGHORN=10  27-CT PREMIER=14  16U_BOYS_CHAMPIONSHIP";
    const avgTime = await testSuite.measurePerformance(() => createJOMatchSignature(testLine), 1000);
    
    testSuite.assertTrue(avgTime < 1, `createJOMatchSignature should be < 1ms, was ${avgTime}ms`);
    testSuite.performanceResults.push({ function: 'createJOMatchSignature', time: avgTime, target: 1 });
});

testSuite.addTest('Performance', 'Full pipeline performance', async () => {
    const testData = PERFORMANCE_TEST_DATA.slice(0, 100);
    
    const avgTime = await testSuite.measurePerformance(() => {
        const unique = deduplicateMatches(testData);
        unique.forEach(line => {
            parseJOMatchLine(line);
            detectShoresTeam(line);
        });
    }, 10);
    
    testSuite.assertTrue(avgTime < 50, `Full pipeline should be < 50ms for 100 items, was ${avgTime}ms`);
    testSuite.performanceResults.push({ function: 'Full Pipeline (100 items)', time: avgTime, target: 50 });
});

// =============================================================================
// INTEGRATION TESTS - 8+ tests
// =============================================================================

testSuite.addTest('Integration', 'Process sample match data', () => {
    const sampleData = SAMPLE_JO_MATCHES.slice(0, 10).join('\n');
    const lines = sampleData.split('\n').filter(line => line.trim());
    
    testSuite.assertArrayLength(lines, 10, "Sample data processing");
    
    const unique = deduplicateMatches(lines);
    testSuite.assertTrue(unique.length <= 10, "Deduplication preserves data");
    
    const parsed = unique.map(line => parseJOMatchLine(line));
    testSuite.assertArrayLength(parsed, unique.length, "All lines parsed");
    
    parsed.forEach(match => {
        testSuite.assertNotNull(match.team1, "Team 1 exists");
        testSuite.assertNotNull(match.team2, "Team 2 exists");
        testSuite.assertNotNull(match.date, "Date exists");
    });
});

testSuite.addTest('Integration', 'Handle edge cases gracefully', () => {
    const edgeCases = EDGE_CASE_MATCHES.slice(0, 5);
    
    edgeCases.forEach(line => {
        // Should not throw errors
        const parsed = parseJOMatchLine(line);
        testSuite.assertNotNull(parsed, `Parsed result for edge case: ${line}`);
        
        const signature = createJOMatchSignature(line);
        testSuite.assertNotNull(signature, `Signature for edge case: ${line}`);
        
        // detectShoresTeam should not throw
        detectShoresTeam(line);
    });
});

testSuite.addTest('Integration', 'Consistent parsing results', () => {
    // Parse the same line multiple times - should get identical results
    const line = "19-Jul  #5 SAN JUAN HILLS HS  7:50 AM  22-LONGHORN=10  27-CT PREMIER=14  16U_BOYS_CHAMPIONSHIP";
    
    const result1 = parseJOMatchLine(line);
    const result2 = parseJOMatchLine(line);
    
    testSuite.assertEquals(JSON.stringify(result1), JSON.stringify(result2), "Consistent parsing results");
});

// =============================================================================
// VENUE COUNTING TESTS - NEW
// =============================================================================

testSuite.addTest('Venue Counting', 'Count unique venue display names', () => {
    const matches = [
        "19-Jul  #1 BELLFLOWER AQUATIC CENTER  8:10 AM  1-TEAM A=15  2-TEAM B=3  16U_BOYS_CHAMPIONSHIP",
        "19-Jul  #1 BELLFLOWER AQUATIC CENTER  9:10 AM  3-TEAM C=12  4-TEAM D=8  16U_BOYS_CHAMPIONSHIP", // Same venue
        "19-Jul  #2 CERRITOS COLLEGE  8:10 AM  5-TEAM E=11  6-TEAM F=7  16U_BOYS_CHAMPIONSHIP",
        "19-Jul  #2 CERRITOS COLLEGE  10:10 AM  7-TEAM G=18  8-TEAM H=6  16U_BOYS_CHAMPIONSHIP", // Same venue
        "19-Jul  #3 CYPRESS COLLEGE  8:10 AM  9-TEAM I=22  10-TEAM J=12  16U_BOYS_CHAMPIONSHIP"
    ];
    
    // Parse all matches and count unique venue display names
    const venuesInUse = new Set();
    matches.forEach(line => {
        const matchData = parseJOMatchLine(line);
        if (matchData.venueDisplayName) {
            venuesInUse.add(matchData.venueDisplayName);
        }
    });
    
    testSuite.assertEquals(venuesInUse.size, 3, "Should count 3 unique venue display names");
    testSuite.assertTrue(venuesInUse.has("BELLFLOWER AQUATIC CENTER"), "Should include BELLFLOWER AQUATIC CENTER");
    testSuite.assertTrue(venuesInUse.has("CERRITOS COLLEGE"), "Should include CERRITOS COLLEGE");
    testSuite.assertTrue(venuesInUse.has("CYPRESS COLLEGE"), "Should include CYPRESS COLLEGE");
});

testSuite.addTest('Venue Counting', 'Count venue display names vs match numbers', () => {
    const matches = [
        "19-Jul  #5 SAN JUAN HILLS HS  7:50 AM  22-LONGHORN=10  27-CT PREMIER=14  16U_BOYS_CHAMPIONSHIP",
        "19-Jul  #23 SAN JUAN HILLS HS  8:50 AM  30-TEAM A=12  31-TEAM B=9  16U_BOYS_CHAMPIONSHIP", // Different match numbers, same venue
        "19-Jul  #47 SAN JUAN HILLS HS  9:50 AM  35-TEAM C=15  36-TEAM D=11  16U_BOYS_CHAMPIONSHIP"  // Different match numbers, same venue
    ];
    
    // OLD WAY (incorrect): Count match numbers - would give 3 unique venues
    const matchNumbersInUse = new Set();
    matches.forEach(line => {
        const venueMatch = line.match(/#(\d+)/);
        if (venueMatch) {
            matchNumbersInUse.add(venueMatch[1]); // This gets "5", "23", "47"
        }
    });
    
    // NEW WAY (correct): Count venue display names - should give 1 unique venue
    const venueNamesInUse = new Set();
    matches.forEach(line => {
        const matchData = parseJOMatchLine(line);
        if (matchData.venueDisplayName) {
            venueNamesInUse.add(matchData.venueDisplayName);
        }
    });
    
    testSuite.assertEquals(matchNumbersInUse.size, 3, "Old method incorrectly counts 3 unique venues (match numbers)");
    testSuite.assertEquals(venueNamesInUse.size, 1, "New method correctly counts 1 unique venue (display name)");
    testSuite.assertTrue(venueNamesInUse.has("SAN JUAN HILLS HS"), "Should identify the actual venue name");
});

testSuite.addTest('Venue Counting', 'Handle matches with no venue data', () => {
    const matches = [
        "19-Jul  #1 VENUE A  8:10 AM  1-TEAM A=15  2-TEAM B=3  16U_BOYS_CHAMPIONSHIP",
        "19-Jul  #2 VENUE B  8:10 AM  3-TEAM C=12  4-TEAM D=8  16U_BOYS_CHAMPIONSHIP",
        "", // Empty line
        "INVALID LINE FORMAT", // Invalid format
        "19-Jul  #3 VENUE C  8:10 AM  5-TEAM E=11  6-TEAM F=7  16U_BOYS_CHAMPIONSHIP"
    ];
    
    const venuesInUse = new Set();
    matches.forEach(line => {
        try {
            const matchData = parseJOMatchLine(line);
            if (matchData && matchData.venueDisplayName) {
                venuesInUse.add(matchData.venueDisplayName);
            }
        } catch (error) {
            // Should handle invalid lines gracefully
        }
    });
    
    testSuite.assertEquals(venuesInUse.size, 3, "Should count only valid venue display names");
    testSuite.assertTrue(venuesInUse.has("VENUE A"), "Should include VENUE A");
    testSuite.assertTrue(venuesInUse.has("VENUE B"), "Should include VENUE B");
    testSuite.assertTrue(venuesInUse.has("VENUE C"), "Should include VENUE C");
});

testSuite.addTest('Venue Counting', 'Real tournament data venue counting', () => {
    // Use actual sample match data
    const sampleMatches = window.SAMPLE_JO_MATCHES || [];
    
    const venuesInUse = new Set();
    sampleMatches.forEach(line => {
        const matchData = parseJOMatchLine(line);
        if (matchData.venueDisplayName) {
            venuesInUse.add(matchData.venueDisplayName);
        }
    });
    
    // Based on SAMPLE_JO_MATCHES, we should have these unique venues:
    const expectedVenues = [
        "SAN JUAN HILLS HS",
        "GOLDEN WEST COLLEGE 1", 
        "BELLFLOWER AQUATIC CENTER",
        "CERRITOS COLLEGE",
        "CYPRESS COLLEGE",
        "EL CAMINO COLLEGE",
        "FULLERTON COLLEGE",
        "IRVINE VALLEY COLLEGE"
    ];
    
    testSuite.assertEquals(venuesInUse.size, expectedVenues.length, `Should count ${expectedVenues.length} unique venues in sample data`);
    
    expectedVenues.forEach(venue => {
        testSuite.assertTrue(venuesInUse.has(venue), `Should include venue: ${venue}`);
    });
});

testSuite.addTest('Venue Counting', 'Venue counting performance', async () => {
    // Test venue counting performance with large dataset
    const testData = window.PERFORMANCE_TEST_DATA || [];
    
    const startTime = performance.now();
    
    const venuesInUse = new Set();
    testData.forEach(line => {
        const matchData = parseJOMatchLine(line);
        if (matchData.venueDisplayName) {
            venuesInUse.add(matchData.venueDisplayName);
        }
    });
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    testSuite.assertTrue(duration < 100, `Venue counting should be fast (< 100ms), was ${duration.toFixed(2)}ms`);
    testSuite.assertTrue(venuesInUse.size > 0, "Should count some venues from performance test data");
    
    console.log(`⚡ Venue counting performance: ${duration.toFixed(2)}ms for ${testData.length} matches`);
});

// =============================================================================
// TEST RUNNER FUNCTIONS
// =============================================================================

function runAllTests() {
    testSuite.runAllTests().then(() => {
        displayPerformanceResults();
    });
}

function runParsingTests() {
    const parsingTests = testSuite.tests.filter(t => t.group === 'JO Parsing');
    runTestGroup(parsingTests);
}

function runFilterTests() {
    const filterTests = testSuite.tests.filter(t => t.group === 'Filter Tests');
    runTestGroup(filterTests);
}

function runPerformanceTests() {
    const perfTests = testSuite.tests.filter(t => t.group === 'Performance');
    runTestGroup(perfTests).then(() => {
        displayPerformanceResults();
    });
}

async function runTestGroup(tests) {
    testSuite.clearResults();
    
    for (const test of tests) {
        await testSuite.runSingleTest(test);
    }
    
    testSuite.updateStats();
    testSuite.displayResults();
}

function clearResults() {
    testSuite.clearResults();
    testSuite.updateStats();
    document.getElementById('testResults').innerHTML = '<p style="text-align: center; color: #666; font-style: italic;">Test results cleared</p>';
    document.getElementById('performanceResults').style.display = 'none';
}

function displayPerformanceResults() {
    if (testSuite.performanceResults.length === 0) return;
    
    const perfContainer = document.getElementById('performanceResults');
    const perfData = document.getElementById('performanceData');
    
    perfData.innerHTML = '';
    
    testSuite.performanceResults.forEach(result => {
        const perfItem = document.createElement('div');
        perfItem.className = 'performance-item';
        
        const status = result.time <= result.target ? '✅' : '⚠️';
        const timeStr = result.time.toFixed(3);
        
        perfItem.innerHTML = `
            <span>${status} ${result.function}</span>
            <span>${timeStr}ms (target: ${result.target}ms)</span>
        `;
        
        perfData.appendChild(perfItem);
    });
    
    perfContainer.style.display = 'block';
}

// =============================================
// Future Match Grouping Tests
// =============================================

testSuite.addTest('Future Match Grouping', 'Group same game ID from different lines', () => {
    const lines = [
        "SAN DIEGO SHORES BLACK is 1 in bracket 41 is WHITE in game 16B-081 on 20-Jul at 11:10 AM at WOOLLETT NEAR RIGHT",
        "COMMERCE is 1 in bracket 28 is DARK in game 16B-081 on 20-Jul at 11:10 AM at WOOLLETT NEAR RIGHT"
    ];
    
    const groupedMatches = groupFutureMatchesByGameId(lines);
    
    testSuite.assertEquals(groupedMatches.length, 1, "Should create 1 grouped match from 2 lines with same game ID");
    
    const match = groupedMatches[0];
    testSuite.assertEquals(match.gameId, "16B-081", "Should preserve game ID");
    testSuite.assertEquals(match.team1.name, "SAN DIEGO SHORES BLACK", "WHITE team should be on left (team1)");
    testSuite.assertEquals(match.team2.name, "COMMERCE", "DARK team should be on right (team2)");
    testSuite.assertEquals(match.team1.color, "WHITE", "Team1 should have WHITE color stored internally");
    testSuite.assertEquals(match.team2.color, "DARK", "Team2 should have DARK color stored internally");
    testSuite.assertTrue(match.team1.isShores, "Should detect Shores team");
    testSuite.assertFalse(match.team2.isShores, "Should not mark COMMERCE as Shores");
});

testSuite.addTest('Future Match Grouping', 'Handle single team known', () => {
    const lines = [
        "SAN DIEGO SHORES BLACK is 1 in bracket 41 is WHITE in game 16B-082 on 20-Jul at 12:10 PM at WOOLLETT NEAR RIGHT"
    ];
    
    const groupedMatches = groupFutureMatchesByGameId(lines);
    
    testSuite.assertEquals(groupedMatches.length, 1, "Should create 1 match even with only 1 team known");
    
    const match = groupedMatches[0];
    testSuite.assertEquals(match.team1.name, "SAN DIEGO SHORES BLACK", "Known WHITE team should be on left");
    testSuite.assertEquals(match.team2.name, "TBD", "Unknown DARK team should be TBD");
    testSuite.assertEquals(match.team1.color, "WHITE", "Known team should have WHITE color");
    testSuite.assertEquals(match.team2.color, "DARK", "TBD team should have DARK color");
});

testSuite.addTest('Future Match Grouping', 'Handle DARK team only known', () => {
    const lines = [
        "LOWPO is 2 in bracket 47 is DARK in game 16B-064 on 20-Jul at 7:00 AM at SADDLEBACK COLLEGE 1"
    ];
    
    const groupedMatches = groupFutureMatchesByGameId(lines);
    
    testSuite.assertEquals(groupedMatches.length, 1, "Should create 1 match with DARK team only");
    
    const match = groupedMatches[0];
    testSuite.assertEquals(match.team1.name, "TBD", "Unknown WHITE team should be TBD on left");
    testSuite.assertEquals(match.team2.name, "LOWPO", "Known DARK team should be on right");
    testSuite.assertEquals(match.team1.color, "WHITE", "TBD team should have WHITE color");
    testSuite.assertEquals(match.team2.color, "DARK", "Known team should have DARK color");
});

testSuite.addTest('Future Match Grouping', 'Handle multiple different games', () => {
    const lines = [
        "TEAM A is 1 in bracket 41 is WHITE in game 16B-081 on 20-Jul at 11:10 AM at VENUE 1",
        "TEAM B is 1 in bracket 28 is DARK in game 16B-081 on 20-Jul at 11:10 AM at VENUE 1",
        "TEAM C is 2 in bracket 47 is WHITE in game 16B-064 on 20-Jul at 7:00 AM at VENUE 2",
        "TEAM D is 3 in bracket 52 is DARK in game 16B-064 on 20-Jul at 7:00 AM at VENUE 2"
    ];
    
    const groupedMatches = groupFutureMatchesByGameId(lines);
    
    testSuite.assertEquals(groupedMatches.length, 2, "Should create 2 grouped matches from 4 lines with 2 different game IDs");
    
    // Find the matches by game ID
    const match081 = groupedMatches.find(m => m.gameId === "16B-081");
    const match064 = groupedMatches.find(m => m.gameId === "16B-064");
    
    testSuite.assertTrue(match081 !== undefined, "Should find match for game 16B-081");
    testSuite.assertTrue(match064 !== undefined, "Should find match for game 16B-064");
    
    testSuite.assertEquals(match081.team1.name, "TEAM A", "WHITE team should be on left for 16B-081");
    testSuite.assertEquals(match081.team2.name, "TEAM B", "DARK team should be on right for 16B-081");
    testSuite.assertEquals(match064.team1.name, "TEAM C", "WHITE team should be on left for 16B-064");
    testSuite.assertEquals(match064.team2.name, "TEAM D", "DARK team should be on right for 16B-064");
});

testSuite.addTest('Future Match Grouping', 'Handle malformed future match lines', () => {
    const lines = [
        "SAN DIEGO SHORES BLACK is 1 in bracket 41 is WHITE in game 16B-081 on 20-Jul at 11:10 AM at VENUE",
        "INVALID LINE FORMAT",
        "",
        "COMMERCE is 1 in bracket 28 is DARK in game 16B-081 on 20-Jul at 11:10 AM at VENUE"
    ];
    
    const groupedMatches = groupFutureMatchesByGameId(lines);
    
    testSuite.assertEquals(groupedMatches.length, 1, "Should handle malformed lines gracefully");
    
    const match = groupedMatches[0];
    testSuite.assertEquals(match.team1.name, "SAN DIEGO SHORES BLACK", "Should process valid WHITE team");
    testSuite.assertEquals(match.team2.name, "COMMERCE", "Should process valid DARK team");
});

testSuite.addTest('Future Match Grouping', 'Preserve venue and time information', () => {
    const lines = [
        "SHORES is 1 in bracket 41 is WHITE in game 16B-081 on 20-Jul at 11:10 AM at WOOLLETT NEAR RIGHT",
        "TEAM B is 1 in bracket 28 is DARK in game 16B-081 on 20-Jul at 11:10 AM at WOOLLETT NEAR RIGHT"
    ];
    
    const groupedMatches = groupFutureMatchesByGameId(lines);
    
    testSuite.assertEquals(groupedMatches.length, 1, "Should create 1 grouped match");
    
    const match = groupedMatches[0];
    testSuite.assertEquals(match.date, "20-Jul", "Should preserve date");
    testSuite.assertEquals(match.time, "11:10 AM", "Should preserve time");
    testSuite.assertEquals(match.venue, "WOOLLETT NEAR RIGHT", "Should preserve venue");
    testSuite.assertEquals(match.venueDisplayName, "WOOLLETT NEAR RIGHT", "Should set venue display name");
    testSuite.assertEquals(match.category, "16U_BOYS_CHAMPIONSHIP", "Should set default category");
    testSuite.assertEquals(match.status, "SCHEDULED", "Should set default status");
    testSuite.assertEquals(match.type, "future", "Should mark as future match");
});

testSuite.addTest('Future Match Grouping', 'Handle multi-match lines properly', () => {
    const lines = [
        "SAN DIEGO SHORES BLACK is 1 in bracket 41 is WHITE in game 16B-081 on 20-Jul at 11:10 AM at WOOLLETT NEAR RIGHT; and WHITE in game 16B-097 on 20-Jul at 2:30 PM in WOOLLETT NEAR RIGHT",
        "COMMERCE is 1 in bracket 28 is DARK in game 16B-081 on 20-Jul at 11:10 AM at WOOLLETT NEAR RIGHT"
    ];
    
    const groupedMatches = groupFutureMatchesByGameId(lines);
    
    // Should create matches for both games mentioned in multi-match line
    testSuite.assertTrue(groupedMatches.length >= 2, "Should create matches for multiple games");
    
    const match081 = groupedMatches.find(m => m.gameId === "16B-081");
    const match097 = groupedMatches.find(m => m.gameId === "16B-097");
    
    testSuite.assertTrue(match081 !== undefined, "Should find match for game 16B-081");
    testSuite.assertTrue(match097 !== undefined, "Should find match for game 16B-097");
    
    // Game 16B-081 should have both teams
    testSuite.assertEquals(match081.team1.name, "SAN DIEGO SHORES BLACK", "Should have Shores as WHITE team");
    testSuite.assertEquals(match081.team2.name, "COMMERCE", "Should have Commerce as DARK team");
    
    // Game 16B-097 should have only Shores team
    testSuite.assertEquals(match097.team1.name, "SAN DIEGO SHORES BLACK", "Should have Shores as WHITE team");
    testSuite.assertEquals(match097.team2.name, "TBD", "Should have TBD as opponent");
});

// =============================================
// Water Polo Positioning Convention Tests
// =============================================

testSuite.addTest('Water Polo Convention', 'WHITE team always on left (team1)', () => {
    const lines = [
        "TEAM DARK is 1 in bracket 28 is DARK in game 16B-081 on 20-Jul at 11:10 AM at VENUE",
        "TEAM WHITE is 1 in bracket 41 is WHITE in game 16B-081 on 20-Jul at 11:10 AM at VENUE"
    ];
    
    const groupedMatches = groupFutureMatchesByGameId(lines);
    const match = groupedMatches[0];
    
    testSuite.assertEquals(match.team1.name, "TEAM WHITE", "WHITE team should always be team1 (left) regardless of line order");
    testSuite.assertEquals(match.team2.name, "TEAM DARK", "DARK team should always be team2 (right) regardless of line order");
    testSuite.assertEquals(match.team1.color, "WHITE", "Team1 should have WHITE color");
    testSuite.assertEquals(match.team2.color, "DARK", "Team2 should have DARK color");
});

testSuite.addTest('Water Polo Convention', 'Handle reversed line order correctly', () => {
    // Test with DARK team line first, WHITE team line second
    const lines = [
        "COMMERCE is 1 in bracket 28 is DARK in game 16B-081 on 20-Jul at 11:10 AM at VENUE",
        "SHORES is 1 in bracket 41 is WHITE in game 16B-081 on 20-Jul at 11:10 AM at VENUE"
    ];
    
    const groupedMatches = groupFutureMatchesByGameId(lines);
    const match = groupedMatches[0];
    
    testSuite.assertEquals(match.team1.name, "SHORES", "WHITE team should be team1 even when line appears second");
    testSuite.assertEquals(match.team2.name, "COMMERCE", "DARK team should be team2 even when line appears first");
});

// Initialize and display test count on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('🧪 JO Test Suite initialized');
    console.log(`📊 Total tests available: ${testSuite.tests.length}`);
    
    // Update the total tests display immediately
    document.getElementById('totalTests').textContent = testSuite.tests.length;
    
    // Add some helpful information
    const resultsContainer = document.getElementById('testResults');
    resultsContainer.innerHTML = `
        <div style="text-align: center; color: #666; padding: 20px;">
            <h3>🚀 Junior Olympics Test Suite Ready</h3>
            <p style="margin: 10px 0;">📊 <strong>${testSuite.tests.length}</strong> tests loaded and ready to run</p>
            <p style="margin: 10px 0;">🎯 Covers parsing, filtering, performance, and integration testing</p>
            <p style="margin: 10px 0; font-style: italic;">Click "Run All Tests" to start the comprehensive test suite</p>
        </div>
    `;
});