/// <reference path="GitHub.ts" />

import * as github from './Requests';

function latestCheckin(stat: GitHub.Statistic): number {
  let sorted = stat.weeks.sort((a, b) => b.w - a.w);
  return sorted.length > 0 ? sorted[0].w : 0;
}

async function main() {
  try {
    let repositories = await github.getRepositories();
    let users = await github.getMembers();

    for (let repo of repositories) {
      let stats = await github.getStatistics(repo);
      if(stats === undefined || stats.length == 0)
        continue;

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

    for (let key of users.keys()) {
      console.log(key + ': ' + users.get(key));
    }
  } catch(err) {
    console.error('Error: ', err.message);
  }
}

main();
