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
  },
  json: true
};

/**
 * Gets a list of repositories for the NUnit organization
 */
export async function getRepositories(): Promise<GitHub.Repository[]> {
  let repos: GitHub.Repository[] = await request('https://api.github.com/orgs/nunit/repos?per_page=50', options);
  if(repos === undefined || !(repos instanceof Array) || repos.length === 0)
    throw new Error("Failed to fetch repositories for the organization.");
  return repos;
}

/**
 * Gets a list of users for the NUnit organization
 *
 * The map key is the user login, number is the last commit as a unix timestamp
 */
export async function getUsers(): Promise<Map<string, number>> {
  let members: GitHub.Member[] = await request('https://api.github.com/orgs/nunit/members?per_page=100', options);
  let users: Map<string, number> = new Map<string, number>();
  if(members === undefined || !(members instanceof Array) || members.length === 0)
    throw new Error("Failed to fetch users for the organization.");
  for(let member of members) {
    users.set(member.login, 0);
  }
  return users;
}

/**
 * Gets checkin stats for a given {repository}
 *
 * @param repository The repository to fetch stats for
 */
export async function getStatistics(repository: GitHub.Repository): Promise<GitHub.Statistic[] | undefined> {
  let stats: GitHub.Statistic[] = await request('https://api.github.com/repos/' + repository.full_name + '/stats/contributors', options);
  if(stats === undefined || !(stats instanceof Array) || stats.length === 0)
    return undefined;

  for(let stat of stats) {
    stat.weeks = stat.weeks.filter((w: GitHub.Week) => w.a !== 0 && w.c !== 0 && w.d !== 0);
  }
  return stats;
}