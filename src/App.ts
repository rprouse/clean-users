/// <reference path="GitHub.ts" />

import * as github from './Requests';

/**
 * Returns the latest checkin for the given set of {stat}s
 *
 * @param stat The GitHub statistics for one user
 */
function latestCheckin(stat: GitHub.Statistic): number {
  let sorted = stat.weeks.sort((a, b) => b.w - a.w);
  return sorted.length > 0 ? sorted[0].w : 0;
}

/**
 * Goes through the {stats} for a repository and updates users with newer checkin
 * times if they have commited to this repository more recently.
 *
 * @param stats The GitHub statistics for a repository
 * @param users The list of users with their most recent checkins
 */
function updateStats(stats: GitHub.Statistic[], users: Map<string, number>): void {
  for(let stat of stats) {
    let last = users.get(stat.author.login);
    if(last !== undefined) {
      let statLast = latestCheckin(stat);
      if(statLast > last) {
        users.set(stat.author.login, statLast);
      }
    }
  }
}

/**
 * Outputs the latest checkin time for users
 *
 * @param users The organization users and their latest checkin
 */
function outputUsers(users: Map<string, number>): void {

  var sorted = [...users].map(e =>{ return {login: e[0], lastCommit: e[1]};}).slice().sort(function(a, b) {
    return a.lastCommit - b.lastCommit;
  });

  var lastYear = new Date();
  lastYear.setFullYear(lastYear.getFullYear() - 1);

  for (let user of sorted) {
    if(user.lastCommit === 0) {
      console.log(user.login + ": NEVER");
    } else if (user.lastCommit < lastYear.getTime()/1000){
      var lastCommit = new Date(user.lastCommit*1000);
      console.log(user.login + ': ' + lastCommit.toDateString());
    }
  }
}

/**
 * Prints an error {msg} to the console and exits the process with {returnCode}
 *
 * @param msg The error message
 * @param returnCode The value to return when the process exits
 */
function exitWithError(msg: string, returnCode: number): void {
  console.error(msg)
  process.exit(returnCode);
}

/**
 * The main entry point for the program
 */
(async function (): Promise<void> {
  try {
    let repos = await github.getRepositories();
    let users = await github.getUsers();
    let failed = false;
    for (let repo of repos) {
      let stats = await github.getStatistics(repo);
      if(stats === undefined) {
        console.warn("Failed to fetch stats for " + repo.name);
        failed = true;
        continue;
      }
      console.info("Fetched stats for " + repo.name);
      updateStats(stats, users);
    }

    // The GitHub stats API is expensive and fails, so you need to request,
    // then they will be generated and you will get results on your second
    // request
    if(!failed) {
      outputUsers(users);
    } else {
      exitWithError("Wait a minute for stats to generate and rerun.", 1);
    }
  } catch(err) {
    exitWithError('Error: ' + err.message, -1);
  }
})();