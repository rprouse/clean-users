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
  name: string;
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
  return JSON.parse(json).map(function(u: any) { return new User(u.login, 0) });
}

function GetStatisticsForRepositories(repositories: Repository[], users: User[]) {
  console.log("USERS");
  for (let user of users) {
    console.log(user);
  }

  console.log();
  console.log("REPOSITORIES");
  for (let repo of repositories) {
    console.log(repo.name);
  }
}

// request('https://api.github.com/repos/nunit/nunit/stats/contributors', options, function (error, response, body) {
//   if (error) throw new Error(error);

//   var json = JSON.stringify(JSON.parse(body), null, 2);
//   console.log(json);
// });
async function main() {
  try {
    let repositories = await getRepositories();
    let users = await getMembers();
    GetStatisticsForRepositories(repositories, users);
  } catch(err) {
    console.error('Error: ', err.message);
  }
}

main();
