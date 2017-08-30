/// <reference path="GitHub.ts" />

import * as github from './Requests';

async function main() {
  try {
    let repositories = await github.getRepositories();
    let users = await github.getMembers();

    for (let repo of repositories) {
      let stats = await github.getStatistics(repo);
      for(let stat of stats) {
        console.log(stat.author.login);
      }
    }
  } catch(err) {
    console.error('Error: ', err.message);
  }
}

main();
