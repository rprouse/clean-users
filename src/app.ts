/// <reference path="GitHub.ts" />

import * as request from 'request-promise';
import * as dotenv from 'dotenv';
dotenv.config();

const token = process.env.GITHUB_TOKEN;
if(!token) {
  console.error("You must set the environment variable GITHUB_TOKEN. See the README.");
  process.exit(-1);
}

class User {
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

async function getRepositories(): Promise<GitHub.Repository[]> {
  let json = await request('https://api.github.com/orgs/nunit/repos?per_page=50', options);
  return JSON.parse(json);
}

async function getMembers(): Promise<User[]> {
  let json = await request('https://api.github.com/orgs/nunit/members?per_page=100', options);
  let members: GitHub.Member[] = JSON.parse(json);
  return members.map(function(u: GitHub.Member) { return new User(u.login, 0) });
}

async function getStatistics(repository: GitHub.Repository): Promise<GitHub.Statistic[]> {
  let json = await request('https://api.github.com/repos/' + repository.full_name + '/stats/contributors', options);
  return JSON.parse(json);
}

async function main() {
  try {
    let repositories = await getRepositories();
    let users = await getMembers();

    for (let repo of repositories) {
      var stats = await getStatistics(repo);
      console.log(stats);
    }
  } catch(err) {
    console.error('Error: ', err.message);
  }
}

main();
