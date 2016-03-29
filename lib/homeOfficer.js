module.exports = HomeOfficer;
var SlackUserProvider = require("../lib/slackUserProvider.js");
var GoogleSpreadsheet = require("google-spreadsheet");
var dateUtil = require("../lib/dateUtil.js");
var GoogleSpreadhsheetFacade = require('./spreadsheet/GoogleSpreadsheetFacade.js');
var WorkEvent = require('./model/WorkEvent.js');
var MailSender = require('./mail/MailSender.js');

var mailgunOptions = require('../settings/mailgunKeys.json');
var ProjectManagerSpreadSheetParser = require('./spreadsheet/ProjectManagerSpreadSheetParser.js');
var MailBuilder = require('./mail/MailBuilder.js');
var MailCredential = require('./mail/MailCredential.js');
var moment = require('moment');
var Q = require('q');

var options;
var sheetInfo;
var dateFormat = 'DD MMM YYYY'


function HomeOfficer(options) {
    this.slackUserProvider = new SlackUserProvider(options.slackToken);
    this.googleSpreadsheet = new GoogleSpreadhsheetFacade();
    this.mailSender = new MailSender(mailgunOptions,new ProjectManagerSpreadSheetParser(this.googleSpreadsheet),new MailBuilder());
    this.now = now; 
}

HomeOfficer.prototype.userWantToRegisterEvent = function (slackUser, workEvent, callback) {
    var self = this;
    var slackUserName;

    checkDate(self,workEvent)
    .then(function(){
        return findSlackUsername(self,slackUser); 
    })
    .then(function(userName){
        slackUserName = userName;
        return saveEventInSpreadsheet(self,workEvent,userName);
    })
    .then(function(){
        return sendEmailToEmployeesProjectManager(self,slackUserName,workEvent);
    })
    .then(function(){
        callback(null,'I\'ve just set the '+workEvent.name+' '+workEvent.dateRange.toText(dateFormat)+'.');
    })
    .fail(function(error){
        callback(error);   
    })
    .done();
};

function checkDate(self,workEvent){
    return Q.Promise(function(resolve,reject){
        if(workEvent.deadlineToReport() <= self.now()){
            reject(createTooLateError(workEvent));
        } else {
            resolve("ok");
        }
    });
}

function createTooLateError(workEvent){
    var theBorderDate = workEvent.deadlineToReport();
    var dateFormatter = moment(theBorderDate);
    if(dateUtil.isMidnight(theBorderDate)){
        return new Error('Sorry, but '+workEvent.name+' should be reported before '+dateFormatter.format(dateFormat));
    }

    return new Error('Sorry, but '+workEvent.name+' should be reported before '+dateFormatter.format('HH:mm')+' on '+dateFormatter.format(dateFormat));
}

function findSlackUsername(self,slackUser){
    var deferred = Q.defer();
    self.slackUserProvider.findUser(slackUser, function(error,userName){
        if(error != null){
            deferred.reject(error)
        } else {
            deferred.resolve(userName);
        }
    });

    return deferred.promise;
}

function saveEventInSpreadsheet(self,workEvent,userName){
    var deferred = Q.defer();
    self.googleSpreadsheet.saveEventForEmployee(workEvent,userName,function(error){
        if(error != null){
            deferred.reject(error);
        } else {
            deferred.resolve();
        }
    });

    return deferred.promise;
}

function sendEmailToEmployeesProjectManager(self,userName,workEvent){
    var deferred = Q.defer();
    var mailCredential = new MailCredential(userName,workEvent.name,workEvent.dateRange);
    self.mailSender.sendEmailToEmployeesProjectManager(mailCredential,function(error){
        if(error != null){
            deferred.reject(eventWasSavedButPMWasNotNotifiedError(workEvent));
        } else {
            deferred.resolve();
        }
    });

    return deferred.promise;
}

function eventWasSavedButPMWasNotNotifiedError(workEvent){
    return Error('I\'ve just set the '+workEvent.name+' '+workEvent.dateRange.toText(dateFormat)+', but I couldn\'t be able to send an e-mail to your PM. Please, inform him about that!');
}

HomeOfficer.prototype.getWorksheetLink = function(){
    return this.googleSpreadsheet.getWorksheetLink();
}
var now = function(){
    return new Date();
}
