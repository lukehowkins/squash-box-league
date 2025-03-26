import LEAGUE_INFO from './db/league.js';
import { loadSite, getCompetitors, getPlayerResults } from './scrape.js';

const CURRENT_LEAGUE = 0;

const {
  url: currentLeagueUrl,
  myBox: myCurrentBox,
  lowestBox,
  name,
  ends,
} = LEAGUE_INFO[CURRENT_LEAGUE];

const getResults = (competitors, league, leagueSite) => {
  return competitors.map((competitor) => {
    const results = getPlayerResults(leagueSite, competitor.name);
    if (results && typeof results !== 'string') results.lowestBoxInThisLeague = league.lowestBox;
    return {
      ...competitor,
      previousResults: [...competitor.previousResults, results],
    };
  });
};

const updateCompetitorResults = (competitors, league) => {
  return loadSite(league.url).then((leagueSite) => getResults(competitors, league, leagueSite));
};

loadSite(currentLeagueUrl)
  .then((currentLeagueSite) => {
    let competitors = getCompetitors(currentLeagueSite, myCurrentBox);
    return competitors.map((competitor) => ({ ...competitor, previousResults: [] }));
  })
  .then((competitors) => {
    return updateCompetitorResults(competitors, LEAGUE_INFO[CURRENT_LEAGUE - 1]);
  })
  .then((competitors) => {
    return updateCompetitorResults(competitors, LEAGUE_INFO[CURRENT_LEAGUE - 2]);
  })
  .then((competitors) => {
    console.log(`Competitors in ${name} Box ${myCurrentBox}:`);
    competitors.forEach((competitor) => {
      console.log(`${competitor.name} - ${competitor.email}`, competitor.previousResults);
    });

    console.log(`Current Lowest Box ${lowestBox}, my box ${myCurrentBox} ends ${ends}`);
  });
