/// <reference path="GitHub.ts" />

import * as request from 'request-promise';
import * as dotenv from 'dotenv';
dotenv.config();

const token = process.env.GITHUB_TOKEN;
if(!token) {
  console.error("You must set the environment variable GITHUB_TOKEN. See the README.");
  process.exit(-1);
}

const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    authorization: 'token ' + token,
    'cache-control': 'no-cache',
    'User-Agent': 'NodeJS'
  }
};

export async function getRepositories(): Promise<GitHub.Repository[] | undefined> {
  let json = await request('https://api.github.com/orgs/nunit/repos?per_page=50', options);
  let repos = JSON.parse(json);
  if(repos === undefined || !(repos instanceof Array) || repos.length === 0)
    return undefined;
  return repos;
}

// The map key is the user login, number is the last commit as a unix timestamp
export async function getUsers(): Promise<Map<string, number> | undefined> {
  let json = await request('https://api.github.com/orgs/nunit/members?per_page=100', options);
  let members: GitHub.Member[] = JSON.parse(json);
  let users: Map<string, number> = new Map<string, number>();
  if(members === undefined || !(members instanceof Array) || members.length === 0)
    return undefined;
  for(let member of members) {
    users.set(member.login, 0);
  }
  return users;
}

export async function getStatistics(repository: GitHub.Repository): Promise<GitHub.Statistic[] | undefined> {
  let json = await request('https://api.github.com/repos/' + repository.full_name + '/stats/contributors', options);
  let stats: GitHub.Statistic[] = JSON.parse(json);
  if(stats === undefined || !(stats instanceof Array) || stats.length === 0)
    return undefined;

  for(let stat of stats) {
    stat.weeks = stat.weeks.filter((w: GitHub.Week) => w.a !== 0 && w.c !== 0 && w.d !== 0);
  }
  return stats;
}