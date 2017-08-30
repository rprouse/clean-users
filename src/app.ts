import * as request from 'request';
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

// Get all the repos
request('https://api.github.com/orgs/nunit/repos?per_page=50', options, function (error, response, body) {
  if (error) throw new Error(error);

  var repositories = JSON.parse(body);

  // Get all the users in the organization
  request('https://api.github.com/orgs/nunit/members?per_page=100', options, function (error, response, body) {
    if (error) throw new Error(error);

    let users: User[] = JSON.parse(body).map(function(u: any) { return new User(u.login, 0) });

     GetStatisticsForRepositories(repositories, users);
  });
});

function GetStatisticsForRepositories(repositories: any, users: User[]) {
  console.log("USERS");
  for (let user of users) {
    console.log(user.login);
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
