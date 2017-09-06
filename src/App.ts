/// <reference path="GitHub.ts" />

import * as github from './Requests';

function latestCheckin(stat: GitHub.Statistic): number {
  let sorted = stat.weeks.sort((a, b) => b.w - a.w);
  return sorted.length > 0 ? sorted[0].w : 0;
}

async function main() {
  try {
    let repositories = await github.getRepositories();
    if(repositories !== undefined) {
      let users = await github.getMembers();
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

        // The GitHub stats API is expensive and fails, so you need to request,
        // then they will be generated and you will get results on your second
        // request
        if(failed) {
          console.warn("Wait a minute for stats to generate and rerun.")
          process.exit(1);
        }

        for (let key of users.keys()) {
          console.log(key + ': ' + users.get(key));
        }
      } else {
        console.error("Failed to fetch users for the organization.");
        process.exit(-3);
      }
    } else {
      console.error("Failed to fetch repositories for the organization.");
      process.exit(-2);
    }
  } catch(err) {
    console.error('Error: ', err.message);
    process.exit(-10);
  }
}

main();