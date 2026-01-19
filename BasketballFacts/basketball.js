let API_KEY = null;

async function loadApiKey() {
  if (API_KEY !== null) return API_KEY;
  try {
    const res = await fetch('./basketball.env');
    if (!res.ok) throw new Error('env not found');
    const text = await res.text();
    const match = text.match(/API_KEY\s*=\s*(.+)/);
    if (match) {
      API_KEY = match[1].trim();
    } else {
      API_KEY = '';
    }
  } catch (e) {
    API_KEY = '';
  }
  return API_KEY;
}

const JSON_FOLDER = "nba teams"; 


const teamFileMap = {
  "celtics": "Celtics.json", "boston": "Celtics.json", "boston celtics": "Celtics.json",
  "nets": "Nets.json", "brooklyn": "Nets.json", "brooklyn nets": "Nets.json",
  "knicks": "Knicks.json", "new york": "Knicks.json", "new york knicks": "Knicks.json",
  "76ers": "76ers.json", "sixers": "76ers.json", "philadelphia": "76ers.json", "philadelphia 76ers": "76ers.json",
  "raptors": "Raptors.json", "toronto": "Raptors.json", "toronto raptors": "Raptors.json",
  "bulls": "Bulls.json", "chicago": "Bulls.json", "chicago bulls": "Bulls.json",
  "cavaliers": "Cavaliers.json", "cleveland": "Cavaliers.json", "clevelands cavaliers": "Cavaliers.json", "cavs": "Cavaliers.json",
  "pistons": "Pistons.json", "detroit": "Pistons.json", "detroit pistons": "Pistons.json",
  "pacers": "Pacers.json", "indiana": "Pacers.json", "indiana pacers": "Pacers.json",
  "bucks": "Bucks.json", "milwaukee": "Bucks.json", "milwaukee bucks": "Bucks.json",
  "hawks": "Hawks.json", "atlanta": "Hawks.json", "atlanta hawks": "Hawks.json",
  "hornets": "Hornets.json", "charlotte": "Hornets.json", "charlotte hornets": "Hornets.json",
  "heat": "Heat.json", "miami": "Heat.json", "miami heat": "Heat.json",
  "magic": "Magic.json", "orlando": "Magic.json", "orlando magic": "Magic.json",
  "wizards": "Wizards.json", "washington": "Wizards.json", "washington wizards": "Wizards.json",
  "nuggets": "Nuggets.json", "denver": "Nuggets.json", "denver nuggets": "Nuggets.json",
  "timberwolves": "Timberwolves.json", "minnesota": "Timberwolves.json", "minnesota timberwolves": "Timberwolves.json", "wolves": "Timberwolves.json",
  "thunder": "Thunder.json", "okc": "Thunder.json", "oklahoma city": "Thunder.json", "oklahoma city thunder": "Thunder.json",
  "blazers": "TrailBlazers.json", "portland": "TrailBlazers.json", "portland trail blazers": "TrailBlazers.json", "trail blazers": "TrailBlazers.json",
  "jazz": "Jazz.json", "utah": "Jazz.json", "utah jazz": "Jazz.json",
  "warriors": "Warriors.json", "golden state": "Warriors.json", "golden state warriors": "Warriors.json",
  "clippers": "Clippers.json", "la clippers": "Clippers.json", "los angeles clippers": "Clippers.json",
  "lakers": "Lakers.json", "la lakers": "Lakers.json", "los angeles lakers": "Lakers.json",
  "suns": "Suns.json", "phoenix": "Suns.json", "phoenix suns": "Suns.json",
  "kings": "Kings.json", "sacramento": "Kings.json", "sacramento kings": "Kings.json",
  "mavericks": "Mavericks.json", "dallas": "Mavericks.json", "dallas mavericks": "Mavericks.json", "mavs": "Mavericks.json",
  "rockets": "Rockets.json", "houston": "Rockets.json", "houston rockets": "Rockets.json",
  "grizzlies": "Grizzlies.json", "memphis": "Grizzlies.json", "memphis grizzlies": "Grizzlies.json",
  "pelicans": "Pelicans.json", "new orleans": "Pelicans.json", "new orleans pelicans": "Pelicans.json",
  "spurs": "Spurs.json", "san antonio": "Spurs.json", "san antonio spurs": "Spurs.json"
};


// BALLDONTLIE team IDs (numeric) – add this map
const teamBDLIdMap = {
  "ATL": 1, "BOS": 2, "BKN": 3,"CHA": 4,   
  "CHI": 5,"CLE": 6, "DAL": 7,"DEN": 8,"DET": 9,"GSW": 10,"HOU": 11,  
  "IND": 12,"LAC"  : 13,"LAL": 14,"MEM": 15,"MIA": 16,"MIL": 17,  
  "MIN": 18,"NOP": 19,"NYK": 20,"OKC": 21,"ORL": 22,"PHI": 23,"PHX": 24,  
  "POR": 25,"SAC": 26,"SAS": 27,"TOR": 28,"UTA": 29,"WAS": 30   
};

async function fetchMostRecentGame(teamId, abbreviation, displayName) {
  const bdlTeamId = teamBDLIdMap[abbreviation];
  if (!bdlTeamId) {
    return 'Team not supported.';
  }

  // Ensure API key is loaded (from basketball.env if present)
  const key = await loadApiKey();
  if (!key) {
    return 'API key not set. Create basketball.env with API_KEY=your_key to enable recent game results.';
  }
  const headers = { 'Authorization': key };

  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);
  const startDate = thirtyDaysAgo.toISOString().split('T')[0];
  const endDate = today.toISOString().split('T')[0];

  const url = `https://api.balldontlie.io/v1/games?team_ids[]=${bdlTeamId}&start_date=${startDate}&end_date=${endDate}&per_page=50`;

  try {
    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} - Check API key or rate limits`);
    }
    const data = await response.json();
    const games = data.data || [];

    // Filter Final games with positive scores
    const completedGames = games.filter(game => 
      game.status === 'Final' &&
      game.home_team_score > 0 && game.visitor_team_score > 0
    );

    if (completedGames.length === 0) {
      return 'No recent completed games found (API may be delayed – check back later or refresh).';
    }

    completedGames.sort((a, b) => new Date(b.date) - new Date(a.date));

    const recent = completedGames[0];

    const isHome = recent.home_team.abbreviation === abbreviation;
    const teamScore = isHome ? recent.home_team_score : recent.visitor_team_score;
    const oppScore = isHome ? recent.visitor_team_score : recent.home_team_score;
    const oppAbbr = isHome ? recent.visitor_team.abbreviation : recent.home_team.abbreviation;

    let result = 'Tie';
    if (teamScore > oppScore) result = 'Win';
    else if (teamScore < oppScore) result = 'Loss';

    const gameDate = new Date(recent.date);
    gameDate.setDate(gameDate.getDate() + 1);
    const formattedDate = gameDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const matchup = `${abbreviation} ${teamScore} - ${oppAbbr} ${oppScore}`;

    return `${formattedDate}: ${matchup} (${result})`;
  } catch (error) {
    console.error(`Error for ${displayName}:`, error);
    return 'Error loading data: ' + error.message;
  }
}

async function getStartingFive(teamAbbr) {
  try {
    const res = await fetch("./backend/Starting5.json");
    const data = await res.json();
    const key = teamAbbr.toLowerCase();
    return data[key] || ["PG: TBD","SG: TBD","SF: TBD","PF: TBD","C: TBD"];
  } catch (err) {
    console.error("getStartingFive load error:", err);
    return ["PG: TBD","SG: TBD","SF: TBD","PF: TBD","C: TBD"];
  }
}

// --- SEARCH HANDLER ---
document.getElementById('search').addEventListener('click', async () => {
  const query = document.getElementById('searchInput').value.toLowerCase().trim();
  let foundKey = null;
  for (let key in teamFileMap) {
    if (query === key || query.includes(key)) {
      foundKey = key;
      break;
    }
  }

  if (!foundKey) {
    showErrorState();
    return;
  }

  const fileName = teamFileMap[foundKey];
  try {
    const localResponse = await fetch(`./${encodeURIComponent(JSON_FOLDER)}/${fileName}`);
    const localData = await localResponse.json();
    await displayTeamData(localData); // wait for starting 5
  } catch (err) {
    console.error("Error fetching local JSON:", err);
    showErrorState();
  }
});

// --- DISPLAY ENGINE ---
async function displayTeamData(local) {
  document.getElementById('team').textContent = local.name;
  document.body.style.backgroundImage = `url(${local.logo})`;
  document.body.style.backgroundSize = "cover";
  document.body.style.backgroundAttachment = "fixed";
  document.body.style.backgroundBlendMode = "multiply";
  document.body.style.backgroundColor = "rgba(0,0,0,0.7)";

  document.getElementById('area').textContent = `Location: ${local.location}`;
  document.getElementById('conf').textContent = `Conference: ${local.conference}`;
  document.getElementById('divi').textContent = `Division: ${local.division}`;
  document.getElementById('champs').textContent = `Championships: ${local.championships}`;
  document.getElementById('alltimerec').textContent = `All-Time Record: ${local.all_time_record}(as of end of 2024-2025 season)`;
  document.getElementById('hcoach').textContent = `Head Coach: ${local.head_coach}`;
  document.getElementById('brecord').textContent = `Best Season: ${local.best_record}`;
  document.getElementById('arena').textContent = `Arena: ${local.arena}`;
  document.getElementById('own').textContent = `Owner: ${local.Owner}`;
  document.getElementById('gm').textContent = `General Manager: ${local.general_manager}`;
  document.getElementById('league').textContent = `G-League Affiliate: ${local.g_league_affiliate}`;
  document.getElementById('worth').textContent = `Valuation: ${local.valuation}`;
  document.getElementById('founded').textContent = `History: ${local.history}`;

  document.getElementById('rnumbers').innerHTML = `<strong>Retired Numbers:</strong> ${local.retired_numbers.join(", ")}`;
  document.getElementById('hofdraftees').innerHTML = `<strong>HOF Draftees:</strong> ${local.hof_draftees.join(", ")}`;

  const rosterPara = document.getElementById("roster");
  if (rosterPara) {
    rosterPara.innerHTML = "<strong>Starting 5:</strong> 🏀 Loading...";
    const lineup = await getStartingFive(local.abbreviation); // fetch from JSON
    rosterPara.innerHTML = `<strong>Starting 5:</strong> ${lineup.join(" • ")}`;
  }

const recentGamePara = document.getElementById('recentgame');
if (recentGamePara) {
  recentGamePara.textContent = 'Loading recent game...';
  const recentGameInfo = await fetchMostRecentGame(null, local.abbreviation, local.name);
  recentGamePara.innerHTML = `<strong>Most Recent Game:</strong> ${recentGameInfo}`;
}
  const leadersObj = local.franchise_leaders;
  let leadersHTML = "<strong>Franchise Leaders:</strong><br>";
  for (let stat in leadersObj) {
    leadersHTML += `${stat.charAt(0).toUpperCase() + stat.slice(1)}: ${leadersObj[stat]} | `;
  }
  document.getElementById('fleaders').innerHTML = leadersHTML.slice(0, -3);

  const factList = local.fun_facts.map(fact => `<li>${fact}</li>`).join("");
  document.getElementById('funfacts').innerHTML = `<strong>Fun Facts:</strong><ul>${factList}</ul>`;

  // --- Mascot ---
  const mascotLabel = document.getElementById('mascotLabel'); 
  const mascotImg = document.getElementById('teammas');      
  if (local.mascot && local.mascot !== "none") {
    mascotLabel.style.visibility = "visible";
    mascotLabel.textContent = "Mascot:"; 
    mascotImg.src = local.mascot;
    mascotImg.style.display = "block";  
  } else {
    mascotLabel.style.visibility = "visible";
    mascotLabel.textContent = "Mascot: none"; 
    mascotImg.style.display = "none";         
  }
}

// --- ERROR STATE ---
function showErrorState() {
  document.body.style.backgroundImage = "none";
  document.body.style.backgroundColor = "#341b35";
  document.getElementById('team').textContent = "Error: team not found";
  document.querySelectorAll('#results p').forEach(p => p.textContent = "");
  document.getElementById('teammas').style.display = "none";
  document.getElementById('mascotLabel').style.visibility = "hidden";
}

// --- HOME BUTTON ---
document.querySelector('.fa-house').addEventListener('click', () => {
  document.getElementById('searchInput').value = "";
  document.getElementById('team').textContent = "";
  document.querySelectorAll('#results p').forEach(p => p.textContent = "");
  document.getElementById('teammas').style.display = "none";
  document.body.removeAttribute('style');
  document.getElementById('mascotLabel').style.visibility = "hidden";
});
