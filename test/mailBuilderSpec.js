var expect = require("chai").expect;
var MailBuilder = require("../lib/mail/MailBuilder.js");
var MailCredential = require("../lib/mail/MailCredential.js");
var util = require('util');
var DateRange = require("../lib/model/DateRange.js");
var moment = require("moment");

function dummyMailCredential(){
    var dummyDateRange = new DateRange(moment('2016.02.21','YYYY.MM.DD'),moment('2016.02.22','YYYY.MM.DD'));
    return new MailCredential("DummyName","dummyEvent",dummyDateRange);
}

function mailCredentialWithSingleDateFormatWithDobuledToDate(){
    var date = moment('2016.02.21','YYYY.MM.DD');
    var singleDateRange = new DateRange(date,date);
    return new MailCredential("DummyName","dummyEvent",singleDateRange);
}

function mailCredentialWithSingleDateFromatWithNullToDate(){
    var mailCredential = mailCredentialWithSingleDateFormatWithDobuledToDate();
    mailCredential.dateRange.to = null;
    return mailCredential;
}

function dummyHtmlMessage(){
   return '<html><head></head><body><p>Hi!</p><p>DummyName marked dummyEvent from 21.02.2016 to 22.02.2016</p></body></html>';
}

function dummySingleDateMessage(){
    return '<html><head></head><body><p>Hi!</p><p>DummyName marked dummyEvent on 21.02.2016</p></body></html>';
}

describe("mailBuilder",function(){
    var sut = new MailBuilder();
    
    it("should create e-mail message from mailCredential", function() {
       var mailCredentials = dummyMailCredential(); 
       expect(sut.createMessageinHTML(mailCredentials)).to.equals(dummyHtmlMessage());
    });
  
    context("when dateRange is one day range",function(){
        it("should create e-mail in single form",function(){
            var mailCredential = mailCredentialWithSingleDateFromatWithNullToDate();
            expect(sut.createMessageinHTML(mailCredential)).to.equals(dummySingleDateMessage());
            mailCredential = mailCredentialWithSingleDateFromatWithNullToDate();
            expect(sut.createMessageinHTML(mailCredential)).to.equals(dummySingleDateMessage());
        });
    });
    
});
