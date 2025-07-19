// Sample JO tournament data for testing
// Based on actual Junior Olympics 16U Boys Championship format

const SAMPLE_JO_MATCHES = [
    // Standard matches with scores
    "19-Jul  #5 SAN JUAN HILLS HS  7:50 AM  22-LONGHORN=10  27-CT PREMIER=14  16U_BOYS_CHAMPIONSHIP",
    "19-Jul  #8 GOLDEN WEST COLLEGE 1  7:50 AM  15-COMMERCE=13  34-CLOVIS A=5  16U_BOYS_CHAMPIONSHIP",
    "19-Jul  #1 BELLFLOWER AQUATIC CENTER  8:10 AM  1-OC WPC BLUE A=15  48-OAHU WATER POLO=3  16U_BOYS_CHAMPIONSHIP",
    "19-Jul  #2 CERRITOS COLLEGE  8:10 AM  16-SD SHORES BLACK=12  33-PUGET SOUND POLO=8  16U_BOYS_CHAMPIONSHIP",
    "19-Jul  #3 CYPRESS COLLEGE  8:10 AM  17-STANFORD RED A=11  32-PRAETORIAN WP=7  16U_BOYS_CHAMPIONSHIP",
    
    // SD Shores matches (various formats)
    "19-Jul  #4 EL CAMINO COLLEGE  9:30 AM  8-SD SHORES GOLD=18  41-RIVERSIDE POLO=6  16U_BOYS_CHAMPIONSHIP",
    "19-Jul  #6 FULLERTON COLLEGE  10:50 AM  25-SAN DIEGO SHORES=20  24-DEL MAR BLUE=19  16U_BOYS_CHAMPIONSHIP",
    "19-Jul  #7 IRVINE VALLEY COLLEGE  11:10 AM  9-SHORES BLACK=22  40-CHANNEL ISLANDS=12  16U_BOYS_CHAMPIONSHIP",
    
    // Different venues
    "19-Jul  #1 BELLFLOWER AQUATIC CENTER  12:30 PM  5-CC UNITED BLACK A=16  44-STANFORD WHITE=8  16U_BOYS_CHAMPIONSHIP",
    "19-Jul  #2 CERRITOS COLLEGE  12:30 PM  12-NEWPORT HARBOR=14  37-MARIN WATER POLO=11  16U_BOYS_CHAMPIONSHIP",
    "19-Jul  #3 CYPRESS COLLEGE  12:50 PM  13-NOVA AQUATICS=9  36-GOLDEN WEST WP=13  16U_BOYS_CHAMPIONSHIP",
    "19-Jul  #4 EL CAMINO COLLEGE  12:50 PM  20-LOYOLA=15  29-LAGUNA BEACH=10  16U_BOYS_CHAMPIONSHIP",
    
    // Matches with different times
    "19-Jul  #5 SAN JUAN HILLS HS  1:10 PM  21-FOOTHILL=12  28-IRVINE NOVAQUATICS=9  16U_BOYS_CHAMPIONSHIP",
    "19-Jul  #6 FULLERTON COLLEGE  1:10 PM  4-STANFORD RED B=11  45-COMMERCE AQUATICS=8  16U_BOYS_CHAMPIONSHIP",
    "19-Jul  #7 IRVINE VALLEY COLLEGE  1:30 PM  6-CHANNEL ISLANDS GOLD A=17  43-CLOVIS B=7  16U_BOYS_CHAMPIONSHIP",
    "19-Jul  #8 GOLDEN WEST COLLEGE 1  1:30 PM  7-HARVARD WESTLAKE=13  42-RIVERSIDE AQUATICS=10  16U_BOYS_CHAMPIONSHIP",
    
    // More SD Shores variations
    "19-Jul  #1 BELLFLOWER AQUATIC CENTER  2:50 PM  16-SHORES GOLD=21  33-ORANGE COUNTY WPC=15  16U_BOYS_CHAMPIONSHIP",
    "19-Jul  #2 CERRITOS COLLEGE  2:50 PM  10-SANTA BARBARA=14  39-SAN DIEGO SHORES BLACK=18  16U_BOYS_CHAMPIONSHIP",
    
    // High-scoring matches
    "19-Jul  #3 CYPRESS COLLEGE  3:10 PM  14-NEWPORT BEACH=25  35-MARIN POLO=8  16U_BOYS_CHAMPIONSHIP",
    "19-Jul  #4 EL CAMINO COLLEGE  3:10 PM  18-ORANGE COUNTY BLUE=22  31-FREMONT AQUATICS=4  16U_BOYS_CHAMPIONSHIP",
    
    // Close matches
    "19-Jul  #5 SAN JUAN HILLS HS  3:30 PM  19-LOYOLA MARYMOUNT=12  30-GOLDEN WEST AQUATICS=11  16U_BOYS_CHAMPIONSHIP",
    "19-Jul  #6 FULLERTON COLLEGE  3:30 PM  11-NOVA OF VIRGINIA=16  38-CLOVIS AQUATICS=15  16U_BOYS_CHAMPIONSHIP",
    
    // Different date format edge case
    "20-Jul  #7 IRVINE VALLEY COLLEGE  8:00 AM  1-OC WPC BLUE A=20  24-DEL MAR BLUE=12  16U_BOYS_CHAMPIONSHIP",
    "20-Jul  #8 GOLDEN WEST COLLEGE 1  8:00 AM  2-CC UNITED BLACK A=18  23-NEWPORT HARBOR=9  16U_BOYS_CHAMPIONSHIP",
];

// Expected parsing results for specific test cases
const EXPECTED_PARSE_RESULTS = {
    "19-Jul  #5 SAN JUAN HILLS HS  7:50 AM  22-LONGHORN=10  27-CT PREMIER=14  16U_BOYS_CHAMPIONSHIP": {
        date: "19-Jul",
        venue: "#5 SAN JUAN HILLS HS",
        time: "7:50 AM",
        team1: { name: "LONGHORN", score: "10", prefix: "22", isShores: false },
        team2: { name: "CT PREMIER", score: "14", prefix: "27", isShores: false },
        category: "16U_BOYS_CHAMPIONSHIP"
    },
    "19-Jul  #2 CERRITOS COLLEGE  8:10 AM  16-SD SHORES BLACK=12  33-PUGET SOUND POLO=8  16U_BOYS_CHAMPIONSHIP": {
        date: "19-Jul",
        venue: "#2 CERRITOS COLLEGE",
        time: "8:10 AM",
        team1: { name: "SD SHORES BLACK", score: "12", prefix: "16", isShores: true },
        team2: { name: "PUGET SOUND POLO", score: "8", prefix: "33", isShores: false },
        category: "16U_BOYS_CHAMPIONSHIP"
    },
    "19-Jul  #6 FULLERTON COLLEGE  10:50 AM  25-SAN DIEGO SHORES=20  24-DEL MAR BLUE=19  16U_BOYS_CHAMPIONSHIP": {
        date: "19-Jul",
        venue: "#6 FULLERTON COLLEGE",
        time: "10:50 AM",
        team1: { name: "SAN DIEGO SHORES", score: "20", prefix: "25", isShores: true },
        team2: { name: "DEL MAR BLUE", score: "19", prefix: "24", isShores: false },
        category: "16U_BOYS_CHAMPIONSHIP"
    }
};

// Shores team test cases
const SHORES_TEST_CASES = [
    { line: "19-Jul  #2 CERRITOS COLLEGE  8:10 AM  16-SD SHORES BLACK=12  33-PUGET SOUND POLO=8  16U_BOYS_CHAMPIONSHIP", expected: true },
    { line: "19-Jul  #6 FULLERTON COLLEGE  10:50 AM  25-SAN DIEGO SHORES=20  24-DEL MAR BLUE=19  16U_BOYS_CHAMPIONSHIP", expected: true },
    { line: "19-Jul  #7 IRVINE VALLEY COLLEGE  11:10 AM  9-SHORES BLACK=22  40-CHANNEL ISLANDS=12  16U_BOYS_CHAMPIONSHIP", expected: true },
    { line: "19-Jul  #4 EL CAMINO COLLEGE  9:30 AM  8-SD SHORES GOLD=18  41-RIVERSIDE POLO=6  16U_BOYS_CHAMPIONSHIP", expected: true },
    { line: "19-Jul  #1 BELLFLOWER AQUATIC CENTER  2:50 PM  16-SHORES GOLD=21  33-ORANGE COUNTY WPC=15  16U_BOYS_CHAMPIONSHIP", expected: true },
    { line: "19-Jul  #2 CERRITOS COLLEGE  2:50 PM  10-SANTA BARBARA=14  39-SAN DIEGO SHORES BLACK=18  16U_BOYS_CHAMPIONSHIP", expected: true },
    { line: "19-Jul  #5 SAN JUAN HILLS HS  7:50 AM  22-LONGHORN=10  27-CT PREMIER=14  16U_BOYS_CHAMPIONSHIP", expected: false },
    { line: "19-Jul  #8 GOLDEN WEST COLLEGE 1  7:50 AM  15-COMMERCE=13  34-CLOVIS A=5  16U_BOYS_CHAMPIONSHIP", expected: false },
    { line: "19-Jul  #1 BELLFLOWER AQUATIC CENTER  8:10 AM  1-OC WPC BLUE A=15  48-OAHU WATER POLO=3  16U_BOYS_CHAMPIONSHIP", expected: false }
];

// Venue test cases
const VENUE_TEST_CASES = [
    { line: "19-Jul  #1 BELLFLOWER AQUATIC CENTER  8:10 AM  1-OC WPC BLUE A=15  48-OAHU WATER POLO=3  16U_BOYS_CHAMPIONSHIP", venue: "#1" },
    { line: "19-Jul  #2 CERRITOS COLLEGE  8:10 AM  16-SD SHORES BLACK=12  33-PUGET SOUND POLO=8  16U_BOYS_CHAMPIONSHIP", venue: "#2" },
    { line: "19-Jul  #3 CYPRESS COLLEGE  8:10 AM  17-STANFORD RED A=11  32-PRAETORIAN WP=7  16U_BOYS_CHAMPIONSHIP", venue: "#3" },
    { line: "19-Jul  #4 EL CAMINO COLLEGE  9:30 AM  8-SD SHORES GOLD=18  41-RIVERSIDE POLO=6  16U_BOYS_CHAMPIONSHIP", venue: "#4" },
    { line: "19-Jul  #5 SAN JUAN HILLS HS  7:50 AM  22-LONGHORN=10  27-CT PREMIER=14  16U_BOYS_CHAMPIONSHIP", venue: "#5" },
    { line: "19-Jul  #6 FULLERTON COLLEGE  10:50 AM  25-SAN DIEGO SHORES=20  24-DEL MAR BLUE=19  16U_BOYS_CHAMPIONSHIP", venue: "#6" },
    { line: "19-Jul  #7 IRVINE VALLEY COLLEGE  11:10 AM  9-SHORES BLACK=22  40-CHANNEL ISLANDS=12  16U_BOYS_CHAMPIONSHIP", venue: "#7" },
    { line: "19-Jul  #8 GOLDEN WEST COLLEGE 1  7:50 AM  15-COMMERCE=13  34-CLOVIS A=5  16U_BOYS_CHAMPIONSHIP", venue: "#8" }
];

// Performance test data - large dataset
const PERFORMANCE_TEST_DATA = Array(1000).fill().map((_, i) => {
    const venues = ['#1', '#2', '#3', '#4', '#5', '#6', '#7', '#8'];
    const teams = ['LONGHORN', 'CT PREMIER', 'OC WPC BLUE A', 'SD SHORES BLACK', 'STANFORD RED A', 'CHANNEL ISLANDS', 'DEL MAR BLUE', 'NEWPORT HARBOR'];
    const venue = venues[i % venues.length];
    const team1 = teams[i % teams.length];
    const team2 = teams[(i + 1) % teams.length];
    const score1 = Math.floor(Math.random() * 25);
    const score2 = Math.floor(Math.random() * 25);
    const hour = Math.floor(Math.random() * 12) + 1;
    const minute = Math.floor(Math.random() * 60);
    const ampm = Math.random() > 0.5 ? 'AM' : 'PM';
    
    return `19-Jul  ${venue} VENUE NAME  ${hour}:${minute.toString().padStart(2, '0')} ${ampm}  ${i + 1}-${team1}=${score1}  ${i + 100}-${team2}=${score2}  16U_BOYS_CHAMPIONSHIP`;
});

// Export for use in tests
if (typeof window !== 'undefined') {
    window.SAMPLE_JO_MATCHES = SAMPLE_JO_MATCHES;
    window.EXPECTED_PARSE_RESULTS = EXPECTED_PARSE_RESULTS;
    window.SHORES_TEST_CASES = SHORES_TEST_CASES;
    window.VENUE_TEST_CASES = VENUE_TEST_CASES;
    window.PERFORMANCE_TEST_DATA = PERFORMANCE_TEST_DATA;
}