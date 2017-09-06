/// <reference path="GitHub.ts" />

import * as github from './Requests';

/**
 * Returns the latest checkin for the given set of statistics
 *
 * @param stat The GitHub statistics for one user
 */
function latestCheckin(stat: GitHub.Statistic): number {
  let sorted = stat.weeks.sort((a, b) => b.w - a.w);
  return sorted.length > 0 ? sorted[0].w : 0;
}

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

function outputUsers(users: Map<string, number>): void {
  for (let key of users.keys()) {
    console.log(key + ': ' + users.get(key));
  }
}

function exitWithError(msg: string, returnCode: number): void {
  console.error(msg)
  process.exit(returnCode);
}

async function main() {
  try {
    let repositories = await github.getRepositories();
    if(repositories !== undefined) {
      let users = await github.getUsers();
      if(users !== undefined) {
        let failed = false;
        for (let repo of repositories) {
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
      } else {
        exitWithError("Failed to fetch users for the organization.", -3);
      }
    } else {
      exitWithError("Failed to fetch repositories for the organization.", -2);
    }
  } catch(err) {
    exitWithError('Error: ' + err.message, -10);
  }
}

main();