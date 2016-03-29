module.exports = SlackUserProvider;
var request = require('request');
var util = require('util');
var cachedJsonSlackUsers;

var token;

function SlackUserProvider(token){
    this.token = token;
    downloadSlackUsers(token, function(jsonUsers){
        console.log('Slack users downloaded on start')
    })
}

SlackUserProvider.prototype.getAllUsers = function getAllUsers(callback){
    if (typeof cachedJsonSlackUsers == 'undefined') {
        downloadSlackUsers(token, function(jsonUsers){
            callback(null,cachedJsonSlackUsers)
        })
    } else{
        callback(null,cachedJsonSlackUsers)
    }
};

SlackUserProvider.prototype.findUser = function findUser(userId, callback) {
    this.getAllUsers(function(error,slackUsersJson){
        var slackUser = searchForUser(slackUsersJson, userId);
        if(typeof slackUser !== 'undefined'){
            callback(null,slackUser);
        } else{
            callback(new Error("Slack user not found"));
        }
    })
};

function searchForUser(body, searchForUser) {
    var searchedUserName;
    var membersCount = body.members.length;
    for (var i = 0; i < membersCount; i++) {
        if (body.members[i].name === searchForUser) {
            searchedUserName = body.members[i].profile.real_name;
            break;
        }
    }
    return searchedUserName;
}

function downloadSlackUsers(botToken, callback) {
    request(util.format('https://slack.com/api/users.list?token=%s&pretty=1', botToken), function (error, response, body) {
        console.log("end request sc: " + response.statusCode)
        if (!error && response.statusCode == 200) {
            cachedJsonSlackUsers = JSON.parse(body);
            callback(cachedJsonSlackUsers);
        } else {
            callback(undefined); //TODO handle errors
        }
    })
}
