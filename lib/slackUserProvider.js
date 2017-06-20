module.exports = SlackUserProvider;
var request = require('request');
var util = require('util');

function SlackUserProvider(token, requestEngine){
    this.token = token;
    this.request = typeof requestEngine  !== 'undefined' ? requestEngine : request;
}

SlackUserProvider.prototype.findUser = function findUser(userToFind, callback) {
    getAllUsers.call(this, function(error,response){
        var slackUser = searchForUser(response, userToFind);
        if(typeof slackUser !== 'undefined'){
            callback(null,slackUser);
        } else{
            callback(new Error("Slack user not found"));
        }
    })
};

function getAllUsers(callback){
    if (typeof this.slackUsersCache == 'undefined') {
        downloadSlackUsers.call(this, this.token, function(error, slackUsers) {
            this.slackUsersCache = slackUsers;
            callback(null, this.slackUsersCache)
        }
        .bind(this));
    } else{
        callback(null, this.slackUsersCache)
    }
};

function downloadSlackUsers(botToken, callback) {
    var url = util.format('https://slack.com/api/users.list?token=%s&pretty=1', botToken)
    this.request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var slackUsers = JSON.parse(body);
            callback(null, slackUsers);
        } else {
            callback(null, undefined); //TODO handle errors
        }
    })
}

function searchForUser(body, expectedUserName) {
    var result;
    var membersCount = body.members.length;
    for (var i = 0; i < membersCount; i++) {
        if (body.members[i].name === expectedUserName) {
            result = body.members[i].profile.real_name;
            break;
        }
    }
    return result;
}
