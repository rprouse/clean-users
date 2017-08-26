#!/usr/bin/env node

var request = require("request");
require('dotenv').config();

var token = process.env.GITHUB_TOKEN;
if(!token) {
  console.error("You must set the environment variable GITHUB_TOKEN. See the README.");
  return;
}

var options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    authorization: 'token ' + token,
    'cache-control': 'no-cache',
    'User-Agent': 'NodeJS'
  }
};

request('https://api.github.com/orgs/nunit/repos?per_page=50', options, function (error, response, body) {
  if (error) throw new Error(error);

  var json = JSON.parse(body);
  for (repo of json) {
    console.log(repo.name);
  }
});

// request('https://api.github.com/orgs/nunit/members?per_page=100', options, function (error, response, body) {
//   if (error) throw new Error(error);

//   var users = JSON.parse(body)
//                   .map(function(u) { return u.login });
//   for (user of users) {
//     console.log(user);
//   }
// });

// request('https://api.github.com/repos/nunit/nunit/stats/contributors', options, function (error, response, body) {
//   if (error) throw new Error(error);

//   var json = JSON.stringify(JSON.parse(body), null, 2);
//   console.log(json);
// });
