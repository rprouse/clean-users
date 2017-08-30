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

interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string;
  default_branch: string;
  forks: number;
  stargazers_count: number;
  watchers: number;
}

interface Member {
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
}

interface Week {
  a: number;
  c: number;
  d: number;
  w: number;
}

interface Statistic {
  author: Member;
  total: number;
  weeks: Week[];
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

async function getRepositories(): Promise<Repository[]> {
  let json = await request('https://api.github.com/orgs/nunit/repos?per_page=50', options);
  return JSON.parse(json);
}

async function getMembers(): Promise<User[]> {
  let json = await request('https://api.github.com/orgs/nunit/members?per_page=100', options);
  let members: Member[] = JSON.parse(json);
  return members.map(function(u: Member) { return new User(u.login, 0) });
}

async function getStatistics(repository: Repository): Promise<Statistic[]> {
  let json = await request('https://api.github.com/repos/' + repository.full_name + '/stats/contributors', options);
  return JSON.parse(json);
}

async function GetStatisticsForRepositories(repositories: Repository[], users: User[]) {
  // console.log("USERS");
  // for (let user of users) {
  //   console.log(user);
  // }

  for (let repo of repositories) {
    var stats = await getStatistics(repo);
    console.log(stats);
  }
}

async function main() {
  try {
    let repositories = await getRepositories();
    let users = await getMembers();
    await GetStatisticsForRepositories(repositories, users);
  } catch(err) {
    console.error('Error: ', err.message);
  }
}

main();
