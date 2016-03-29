var util = require('util');
var moment = require('moment');
function MailBuilder(){}

var dateFormat = "DD.MM.YYYY";

MailBuilder.prototype.createMessageinHTML = function(mailCredential){
    return makeHtmlTopTags()
           + makeParagraphTagWithMailCredential(mailCredential)
           + endHtmlTopTags();  
}

function makeHtmlTopTags(){
    return "<html><head></head><body>";
}

function makeParagraphTagWithMailCredential(mailCredential){
    var message =  makeParagraphTag()
                +"Hi!"
                + endParagraphTag()
                + makeParagraphTag()
                + mailCredential.name + " marked " + mailCredential.eventType
                + " "+mailCredential.dateRange.toText(dateFormat)
                + endParagraphTag();
    return message;
}

function makeParagraphTag(){
    return "<p>";
}

function endParagraphTag(){
    return "</p>"
}

function endHtmlTopTags(){
    return "</body></html>";
}

module.exports = MailBuilder;

