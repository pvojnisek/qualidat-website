// Edge cases and boundary conditions for JO tournament data testing

const EDGE_CASE_MATCHES = [
    // Malformed data - missing fields
    "19-Jul  #5 SAN JUAN HILLS HS",
    "19-Jul  #5 SAN JUAN HILLS HS  7:50 AM",
    "19-Jul  #5 SAN JUAN HILLS HS  7:50 AM  22-LONGHORN=10",
    
    // Empty/whitespace data
    "",
    "   ",
    "\n",
    "    \t    ",
    
    // Invalid date formats
    "32-Jul  #5 SAN JUAN HILLS HS  7:50 AM  22-LONGHORN=10  27-CT PREMIER=14  16U_BOYS_CHAMPIONSHIP",
    "19-ABC  #5 SAN JUAN HILLS HS  7:50 AM  22-LONGHORN=10  27-CT PREMIER=14  16U_BOYS_CHAMPIONSHIP",
    "  #5 SAN JUAN HILLS HS  7:50 AM  22-LONGHORN=10  27-CT PREMIER=14  16U_BOYS_CHAMPIONSHIP",
    
    // Invalid venue formats
    "19-Jul  VENUE NAME  7:50 AM  22-LONGHORN=10  27-CT PREMIER=14  16U_BOYS_CHAMPIONSHIP",
    "19-Jul  #99 VENUE NAME  7:50 AM  22-LONGHORN=10  27-CT PREMIER=14  16U_BOYS_CHAMPIONSHIP",
    "19-Jul    7:50 AM  22-LONGHORN=10  27-CT PREMIER=14  16U_BOYS_CHAMPIONSHIP",
    
    // Invalid time formats
    "19-Jul  #5 SAN JUAN HILLS HS  25:50 AM  22-LONGHORN=10  27-CT PREMIER=14  16U_BOYS_CHAMPIONSHIP",
    "19-Jul  #5 SAN JUAN HILLS HS  7:99 AM  22-LONGHORN=10  27-CT PREMIER=14  16U_BOYS_CHAMPIONSHIP",
    "19-Jul  #5 SAN JUAN HILLS HS  7:50 XM  22-LONGHORN=10  27-CT PREMIER=14  16U_BOYS_CHAMPIONSHIP",
    "19-Jul  #5 SAN JUAN HILLS HS  TIME  22-LONGHORN=10  27-CT PREMIER=14  16U_BOYS_CHAMPIONSHIP",
    
    // Invalid team/score formats
    "19-Jul  #5 SAN JUAN HILLS HS  7:50 AM  LONGHORN=10  27-CT PREMIER=14  16U_BOYS_CHAMPIONSHIP",
    "19-Jul  #5 SAN JUAN HILLS HS  7:50 AM  22-LONGHORN  27-CT PREMIER=14  16U_BOYS_CHAMPIONSHIP",
    "19-Jul  #5 SAN JUAN HILLS HS  7:50 AM  22-LONGHORN=  27-CT PREMIER=14  16U_BOYS_CHAMPIONSHIP",
    "19-Jul  #5 SAN JUAN HILLS HS  7:50 AM  22-LONGHORN=ABC  27-CT PREMIER=14  16U_BOYS_CHAMPIONSHIP",
    "19-Jul  #5 SAN JUAN HILLS HS  7:50 AM  22-=10  27-CT PREMIER=14  16U_BOYS_CHAMPIONSHIP",
    
    // Very long team names
    "19-Jul  #5 SAN JUAN HILLS HS  7:50 AM  22-EXTREMELY LONG TEAM NAME THAT MIGHT CAUSE ISSUES WITH PARSING AND DISPLAY=10  27-ANOTHER VERY LONG TEAM NAME FOR TESTING PURPOSES=14  16U_BOYS_CHAMPIONSHIP",
    
    // Special characters in team names
    "19-Jul  #5 SAN JUAN HILLS HS  7:50 AM  22-TEAM (A)=10  27-TEAM B & C=14  16U_BOYS_CHAMPIONSHIP",
    "19-Jul  #5 SAN JUAN HILLS HS  7:50 AM  22-TEAM-A/B=10  27-CT PREMIER#1=14  16U_BOYS_CHAMPIONSHIP",
    "19-Jul  #5 SAN JUAN HILLS HS  7:50 AM  22-TÉAM ÀCCÉNTS=10  27-TEAM B.C.=14  16U_BOYS_CHAMPIONSHIP",
    
    // Very high scores
    "19-Jul  #5 SAN JUAN HILLS HS  7:50 AM  22-LONGHORN=999  27-CT PREMIER=888  16U_BOYS_CHAMPIONSHIP",
    "19-Jul  #5 SAN JUAN HILLS HS  7:50 AM  22-LONGHORN=0  27-CT PREMIER=0  16U_BOYS_CHAMPIONSHIP",
    
    // Different category formats
    "19-Jul  #5 SAN JUAN HILLS HS  7:50 AM  22-LONGHORN=10  27-CT PREMIER=14  ",
    "19-Jul  #5 SAN JUAN HILLS HS  7:50 AM  22-LONGHORN=10  27-CT PREMIER=14  16U_BOYS",
    "19-Jul  #5 SAN JUAN HILLS HS  7:50 AM  22-LONGHORN=10  27-CT PREMIER=14  CHAMPIONSHIP",
    "19-Jul  #5 SAN JUAN HILLS HS  7:50 AM  22-LONGHORN=10  27-CT PREMIER=14  16U_GIRLS_CHAMPIONSHIP",
    
    // Multiple spaces in different places
    "19-Jul    #5 SAN JUAN HILLS HS    7:50 AM    22-LONGHORN=10    27-CT PREMIER=14    16U_BOYS_CHAMPIONSHIP",
    "19-Jul\t\t#5 SAN JUAN HILLS HS\t\t7:50 AM\t\t22-LONGHORN=10\t\t27-CT PREMIER=14\t\t16U_BOYS_CHAMPIONSHIP",
    
    // Edge case Shores team patterns
    "19-Jul  #5 SAN JUAN HILLS HS  7:50 AM  22-SHORES=10  27-CT PREMIER=14  16U_BOYS_CHAMPIONSHIP",
    "19-Jul  #5 SAN JUAN HILLS HS  7:50 AM  22-shores black=10  27-CT PREMIER=14  16U_BOYS_CHAMPIONSHIP",
    "19-Jul  #5 SAN JUAN HILLS HS  7:50 AM  22-SD_SHORES=10  27-CT PREMIER=14  16U_BOYS_CHAMPIONSHIP",
    "19-Jul  #5 SAN JUAN HILLS HS  7:50 AM  22-SHORE TEAM=10  27-CT PREMIER=14  16U_BOYS_CHAMPIONSHIP", // Should not match
    "19-Jul  #5 SAN JUAN HILLS HS  7:50 AM  22-NEW SHORES=10  27-CT PREMIER=14  16U_BOYS_CHAMPIONSHIP", // Should not match
    
    // Midnight and noon edge cases
    "19-Jul  #5 SAN JUAN HILLS HS  12:00 AM  22-LONGHORN=10  27-CT PREMIER=14  16U_BOYS_CHAMPIONSHIP",
    "19-Jul  #5 SAN JUAN HILLS HS  12:00 PM  22-LONGHORN=10  27-CT PREMIER=14  16U_BOYS_CHAMPIONSHIP",
    "19-Jul  #5 SAN JUAN HILLS HS  12:30 AM  22-LONGHORN=10  27-CT PREMIER=14  16U_BOYS_CHAMPIONSHIP",
    "19-Jul  #5 SAN JUAN HILLS HS  12:30 PM  22-LONGHORN=10  27-CT PREMIER=14  16U_BOYS_CHAMPIONSHIP",
    
    // Single digit prefixes
    "19-Jul  #5 SAN JUAN HILLS HS  7:50 AM  1-LONGHORN=10  2-CT PREMIER=14  16U_BOYS_CHAMPIONSHIP",
    "19-Jul  #5 SAN JUAN HILLS HS  7:50 AM  9-LONGHORN=10  99-CT PREMIER=14  16U_BOYS_CHAMPIONSHIP",
    
    // Triple digit prefixes
    "19-Jul  #5 SAN JUAN HILLS HS  7:50 AM  100-LONGHORN=10  200-CT PREMIER=14  16U_BOYS_CHAMPIONSHIP",
    "19-Jul  #5 SAN JUAN HILLS HS  7:50 AM  999-LONGHORN=10  888-CT PREMIER=14  16U_BOYS_CHAMPIONSHIP",
    
    // No prefixes (should fail parsing)
    "19-Jul  #5 SAN JUAN HILLS HS  7:50 AM  LONGHORN=10  CT PREMIER=14  16U_BOYS_CHAMPIONSHIP",
    
    // Unicode and non-ASCII characters
    "19-Jul  #5 SAN JUAN HILLS HS  7:50 AM  22-ŁONGHORN=10  27-ÇT PRÉMIER=14  16U_BOYS_CHAMPIONSHIP",
    "19-Jul  #5 SAN JUAN HILLS HS  7:50 AM  22-ロングホーン=10  27-CT PREMIER=14  16U_BOYS_CHAMPIONSHIP",
    
    // Very short team names
    "19-Jul  #5 SAN JUAN HILLS HS  7:50 AM  22-A=10  27-B=14  16U_BOYS_CHAMPIONSHIP",
    "19-Jul  #5 SAN JUAN HILLS HS  7:50 AM  22-X=10  27-Y=14  16U_BOYS_CHAMPIONSHIP",
    
    // Duplicate data (for deduplication testing)
    "19-Jul  #5 SAN JUAN HILLS HS  7:50 AM  22-DUPLICATE TEAM=10  27-OTHER TEAM=14  16U_BOYS_CHAMPIONSHIP",
    "19-Jul  #5 SAN JUAN HILLS HS  7:50 AM  22-DUPLICATE TEAM=10  27-OTHER TEAM=14  16U_BOYS_CHAMPIONSHIP",
];

// Edge case parsing expectations
const EDGE_CASE_EXPECTATIONS = {
    // Empty data should return default structure
    "": {
        team1: { name: 'Team A', score: null, isShores: false, prefix: null },
        team2: { name: 'Team B', score: null, isShores: false, prefix: null },
        time: null,
        venue: null,
        date: null,
        category: null
    },
    
    // Malformed data should handle gracefully
    "19-Jul  #5 SAN JUAN HILLS HS": {
        date: "19-Jul",
        venue: "#5 SAN JUAN HILLS HS",
        time: null,
        team1: { name: 'Team A', score: null, isShores: false, prefix: null },
        team2: { name: 'Team B', score: null, isShores: false, prefix: null },
        category: null
    },
    
    // Valid edge case with single digit prefixes
    "19-Jul  #5 SAN JUAN HILLS HS  7:50 AM  1-LONGHORN=10  2-CT PREMIER=14  16U_BOYS_CHAMPIONSHIP": {
        date: "19-Jul",
        venue: "#5 SAN JUAN HILLS HS",
        time: "7:50 AM",
        team1: { name: "LONGHORN", score: "10", prefix: "1", isShores: false },
        team2: { name: "CT PREMIER", score: "14", prefix: "2", isShores: false },
        category: "16U_BOYS_CHAMPIONSHIP"
    }
};

// Performance stress test data - very large dataset
const STRESS_TEST_DATA = Array(5000).fill().map((_, i) => {
    const venues = ['#1', '#2', '#3', '#4', '#5', '#6', '#7', '#8'];
    const teams = ['TEAM', 'SQUAD', 'CLUB', 'POLO', 'AQUATIC', 'WATER', 'SWIM', 'SPORT'];
    const venue = venues[i % venues.length];
    const team1 = teams[i % teams.length] + ' ' + (i % 100);
    const team2 = teams[(i + 1) % teams.length] + ' ' + ((i + 1) % 100);
    
    return `19-Jul  ${venue} VENUE ${i}  ${(i % 12) + 1}:${(i % 60).toString().padStart(2, '0')} ${i % 2 ? 'AM' : 'PM'}  ${i + 1}-${team1}=${i % 25}  ${i + 1000}-${team2}=${(i + 1) % 25}  16U_BOYS_CHAMPIONSHIP`;
});

// Memory and performance benchmarks
const BENCHMARK_TESTS = [
    {
        name: 'parseJOMatchLine',
        targetTime: 1, // ms
        iterations: 1000,
        testFunction: 'parseJOMatchLine',
        testData: "19-Jul  #5 SAN JUAN HILLS HS  7:50 AM  22-LONGHORN=10  27-CT PREMIER=14  16U_BOYS_CHAMPIONSHIP"
    },
    {
        name: 'deduplicateMatches',
        targetTime: 10, // ms
        iterations: 10,
        testFunction: 'deduplicateMatches',
        testData: STRESS_TEST_DATA.slice(0, 500)
    },
    {
        name: 'detectShoresTeam',
        targetTime: 0.1, // ms
        iterations: 10000,
        testFunction: 'detectShoresTeam',
        testData: "19-Jul  #5 SAN JUAN HILLS HS  7:50 AM  22-SD SHORES BLACK=10  27-CT PREMIER=14  16U_BOYS_CHAMPIONSHIP"
    },
    {
        name: 'createJOMatchSignature',
        targetTime: 1, // ms
        iterations: 1000,
        testFunction: 'createJOMatchSignature',
        testData: "19-Jul  #5 SAN JUAN HILLS HS  7:50 AM  22-LONGHORN=10  27-CT PREMIER=14  16U_BOYS_CHAMPIONSHIP"
    }
];

// Export for use in tests
if (typeof window !== 'undefined') {
    window.EDGE_CASE_MATCHES = EDGE_CASE_MATCHES;
    window.EDGE_CASE_EXPECTATIONS = EDGE_CASE_EXPECTATIONS;
    window.STRESS_TEST_DATA = STRESS_TEST_DATA;
    window.BENCHMARK_TESTS = BENCHMARK_TESTS;
}