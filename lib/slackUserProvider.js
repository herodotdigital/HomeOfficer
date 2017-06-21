module.exports = SlackUserProvider;
var request = require('request');
var util = require('util');

function SlackUserProvider(token, requestEngine){
    this.token = token;
    this.request = typeof requestEngine  !== 'undefined' ? requestEngine : request;
    this.nowReference = function () {
        return new Date();
    }
}

SlackUserProvider.prototype.findUser = function findUser(userToFind, callback) {
    var self = this;
    getAllUsers.call(this, function(error,slackUsers){
        var slackUser = searchForUser(slackUsers, userToFind);
        if(typeof slackUser !== 'undefined'){
            callback(null,slackUser);
        } else{
            callback(new Error("Slack user not found"));
        }
    })
};

function getAllUsers(callback){
    if (shouldRefreshCache.call(this)) {
        refreshCache.call(this, callback);
    } else {
        callback(null, this.slackUsersCache.data);
    }
}

function shouldRefreshCache() {
    if (typeof this.slackUsersCache == 'undefined') {
        return true 
    }

    var now = this.nowReference()
    var lastCacheUpdateTime = new Date(this.slackUsersCache.timestamp)
    var nextScheduledUpdate = new Date(lastCacheUpdateTime.getFullYear(), lastCacheUpdateTime.getMonth(), lastCacheUpdateTime.getDate()+1, 12, 0, 0, 0)
    return nextScheduledUpdate - now < 0
}

function refreshCache(callback) {
    downloadSlackUsers.call(this, this.token, function(error, slackUsers) {
        saveUsersInCache.call(this, slackUsers);
        callback(null, slackUsers);
    }
    .bind(this));
}

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

function saveUsersInCache(slackUsers) {
    var now = this.nowReference()
    this.slackUsersCache = {
        timestamp: now.getTime(),
        data: slackUsers
    }
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
