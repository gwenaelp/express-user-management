const axios = require('axios');
const chalk = require('chalk');
var express = require('express');

const serverUrl = 'http://localhost:3000';

const argv = require('minimist')(process.argv.slice(2));

const h1 = chalk.bold.blue;
const h2 = chalk.bold.yellow;
const h3 = chalk.bold.green;

function makeid(length) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < length; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

const fakeUsername = () => makeid(8);
const fakeMail = () => makeid(8) + '@' + makeid(8) + '.com';
const fakePassword = () => makeid(8);

const userInfo = {
  username: 'test',//fakeUsername(),
  email: argv.email || fakeMail(),
  password: 'test',//fakePassword(),
};


async function register(userInfo) {
  console.log(h1(':: Trying to register...' + h2(` ${serverUrl}/login`)));
  response = await axios.post(`${serverUrl}/register`, userInfo);
  console.log(response.data);
}

async function login() {
  console.log(h1(':: Trying to log in...' + h2(` ${serverUrl}/login`)));
  console.log({
    username: userInfo.username,
    password: userInfo.password,
  });
  response = await axios.post(`${serverUrl}/login`, {
    username: userInfo.username,
    password: userInfo.password,
  });

  console.log(response.data);
  return response.data.user;
}

async function changePassword() {
  console.log(h1(':: Trying to change password...' + h2(` ${serverUrl}/changePassword`)));
  response = await axios.post(`${serverUrl}/changePassword`, {
    oldPassword: userInfo.password,
    password: userInfo.password,
  }, {
    headers: {
      authorization: 'Token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Imd3ZW5hZWwucGx1Y2hvbkBnbWFpbC5jb20iLCJ1c2VybmFtZSI6InRlc3QiLCJpZCI6IjVjYWY1MjdjZWJjOTY0MjdiNTJiOGE4YSIsImV4cCI6MTU2MDI1Mzc4OCwiaWF0IjoxNTU1MDY5Nzg4fQ.9biaTCZORYE9ZdcEal7PH1bxEl7enXN_-NHHS7ZGun4',
    },
  });

  console.log(response.data);
  return response.data.user;
}

async function forgotPassword() {
  console.log(h1(':: Trying to send reset password mail...' + h2(` ${serverUrl}/forgot`)));
  response = await axios.post(`${serverUrl}/forgot`, {
      email: userInfo.email,
  });

  console.log(response.data);
  return response.data.user;
}

async function deleteAccount(token) {
  console.log(h1(':: Trying to delete account...' + h2(` ${serverUrl}/deleteAccount`)));
  response = await axios.post(`${serverUrl}/deleteAccount`, {
    username: userInfo.username,
  }, {
    headers: {
      Authorization: `Token ${token}`,
    },
  });

  console.log(response.data);
}

async function resetPassword(token) {
  response = await axios.post(`${serverUrl}/resetPassword`, {
    token,
  }, {
    headers: {
      Authorization: `Token ${token}`,
    },
  });
}

async function getProjectByApiKey(apiKey) {
  console.log(h1(':: Trying to get document with api key...' + h2(` ${serverUrl}/apiKey`), h2(`ApiKey ${apiKey}`)));

  response = await axios.get(`${serverUrl}/apiKey`, {
    headers: {
      Authorization: `ApiKey ${apiKey}`,
    },
  });

  console.log(response.data);
}

async function doRequests() {
  let response;
  console.log(h1(':: User info...'));

//  await getProjectByApiKey('6KN15G9-GYYMTBG-M3HKQ3B-GKZGK5Z');
//  await getProjectByApiKey('Invalid API KEY');
//  await register(userInfo);
//  const user = await login();
//  console.log(user);
  changePassword('test', 'test2');
  if(argv.email) {
    await forgotPassword();
  } else {
//    await deleteAccount(user.token);
  }
};

doRequests();

if(argv.email) {
  var app = express();

  const userManagement = require('../../src/index');

  const port = 30000;

  app.get('/resetPassword/:token', async function (req, res) {
    console.log(h1(':: Trying to reset password...' + h2(` ${serverUrl}/resetPassword/${req.params.token}`)));
    response = await axios.post(`${serverUrl}/resetPassword/${req.params.token}`);

    res.send(response.data);
  });

  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}
