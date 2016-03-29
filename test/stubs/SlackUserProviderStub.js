
module.exports = SlackUserProviderStub;
var request = require('request');
var util = require('util');


function SlackUserProviderStub(){
    this.givenUsernameForFindUser = null;
    this.givenErrorForFindUser = null;
    this.usedUserIdForFindUser = null;
}

SlackUserProviderStub.prototype.getAllUsers = function getAllUsers(callback){
};

SlackUserProviderStub.prototype.findUser = function findUser(userId, callback){
    this.usedUserIdForFindUser = userId;
    if(this.givenErrorForFindUser){
        callback(this.givenErrorForFindUser);
    } else {
        callback(null,this.givenUsernameForFindUser);
    }
};

