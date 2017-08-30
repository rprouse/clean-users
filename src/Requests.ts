/// <reference path="GitHub.ts" />

import * as request from 'request-promise';
import * as dotenv from 'dotenv';
dotenv.config();

const token = process.env.GITHUB_TOKEN;
if(!token) {
  console.error("You must set the environment variable GITHUB_TOKEN. See the README.");
  process.exit(-1);
}

export class User {
  constructor(public login: string, public last_commit: number) {}
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

export async function getRepositories(): Promise<GitHub.Repository[]> {
  let json = await request('https://api.github.com/orgs/nunit/repos?per_page=50', options);
  return JSON.parse(json);
}

export async function getMembers(): Promise<User[]> {
  let json = await request('https://api.github.com/orgs/nunit/members?per_page=100', options);
  let members: GitHub.Member[] = JSON.parse(json);
  return members.map((u: GitHub.Member) => new User(u.login, 0));
}

export async function getStatistics(repository: GitHub.Repository): Promise<GitHub.Statistic[]> {
  let json = await request('https://api.github.com/repos/' + repository.full_name + '/stats/contributors', options);
  let stats: GitHub.Statistic[] = JSON.parse(json);
  for(let stat of stats) {
    stat.weeks = stat.weeks.filter((w: GitHub.Week) => w.a != 0 && w.c != 0 && w.d != 0);
  }
  return stats;
}