var expect = require("chai").expect;
var nock = require("nock");
var MailSender = require("../lib/mail/MailSender.js");
var ProjectManagerProfileParserStub = require("./stubs/ProjectManagerProfileParserStub.js");
var ProjectManagerProfile = require("../lib/model/ProjectManagerProfile.js");
var MailBuilderStub = require("./stubs/MailBuilderStub.js");
var MailCredential = require("../lib/mail/MailCredential.js");

describe("MailSender",function(){
    var sut;
    var mailgun; 
    var pm_profile_parser;
    var mailBuilder;

    beforeEach(function(){
        pm_profile_parser = new ProjectManagerProfileParserStub();
        mailBuilder = new MailBuilderStub();
        mailBuilder.givenMessage = "This is a body";
        sut = new MailSender(dummyMailgunOptions(),pm_profile_parser,mailBuilder);
        mailgun = nock(dummyMailgunOptions().baseURL);
    });

    afterEach(function(){
        sut = null;
        nock.cleanAll();
        mailgun = null;
    });

    describe("#reportProjectManager",function(){
        context("when person has a project",function(){
            beforeEach(function(){
                pm_profile_parser.pm_profile = dummyProjectManagerProfile();
            });

            it("should have application/x-www-form-urlencoded contet-type",function(done){
                stubNockRequestWithContentType();
                sut.sendEmailToEmployeesProjectManager(dummyMailCredential(),function(error,successMessage){
                   expect(error).to.equals(null);
                   done();
               });
            });

            it("should have set Basic Authorization in header",function(done){
                stubNockRequestWithBasicAuthorization();
                sut.sendEmailToEmployeesProjectManager(dummyMailCredential(),function(error,successMessage){
                    expect(error).to.equals(null);
                    done();
                });
            });

            it("should make an request to good URL",function(done){
                stubNockWithGoodURL();
                sut.sendEmailToEmployeesProjectManager(dummyMailCredential(),function(error,successMessage){
                    expect(error).to.equals(null);
                    expect(successMessage).to.equals("success");
                    done();
                }); 
            });

            it("should make an request with body in url-encoded",function(done){
               stubNockWithURLEncodedBody();
               sut.sendEmailToEmployeesProjectManager(dummyMailCredential(),function(error,successMessage){
                    expect(error).to.equals(null);
                    expect(successMessage).to.equals("success");
                    done();
               });
            });

            context("error occured during sedning mail",function(){
                it("should report an error",function(done){
                    stubNockToReturnErrorOnHTTPCall();
                    sut.sendEmailToEmployeesProjectManager(dummyMailCredential(),function(error,successMessage){
                        expect(error).to.not.equals(null);
                        done();
                    });
                });
            });

            
        });

        context("when person does not have a project",function(){
            beforeEach(function(){
                pm_profile_parser.givenError = new Error("PM not found");
                pm_profile_parser.givenError.name = "ProjectManagerNotFoundError";
            });

            it("should send an e-mail to default address",function(done){
                stubNockBodyWithDefaultEmail();
                sut.sendEmailToEmployeesProjectManager(dummyMailCredential(),function(error,successMessage){
                    expect(error).to.equals(null);
                    expect(successMessage).to.equals("success");
                    done();
                });
            });
        });

        context("when unknown error occured during download a pm profile",function(){
            beforeEach(function(){
                pm_profile_parser.givenError = new Error("Unknown");
            });

            it("should report an error",function(done){
               sut.sendEmailToEmployeesProjectManager(dummyMailCredential(),function(error,successMessage){
                    expect(error).to.not.equals(null);
                    expect(successMessage).to.equals(null);
                    done();
               });
            });
        });
    });

   
    function dummyProjectManagerProfile(){
        return new ProjectManagerProfile("Daniel Terol","daniel.terol@mailinator.com");
    }

    function dummyMailCredential(){
        return new MailCredential("dummyName","dummyEventType",null);
    }

    function stubNockToReturnErrorOnHTTPCall(){
        mailgun = mailgun.post().reply(400,{error:"error"});
        return mailgun;
    }

    function stubNockWithGoodURL(){
        addGoodURLToHTTPStub();
        buildSuccessHTTPStub();
    }

    function stubNockWithGoodURL(){
        mailgun = mailgun.post(dummyMailgunOptions().methodURL);
        buildSuccessHTTPStub();
    }

    function stubNockWithURLEncodedBody(){
        dummyBody = "from=HomeOfficer%20%3Chomeofficer%40allinmobile.co%3E&to=daniel.terol%40mailinator.com&subject=HomeOfficer%20report&html=This%20is%20a%20body";
        mailgun = mailgun.post(dummyMailgunOptions().methodURL,dummyBody);
        buildSuccessHTTPStub();
    }

    function stubNockBodyWithDefaultEmail(){
        dummyBody = "from=HomeOfficer%20%3Chomeofficer%40allinmobile.co%3E&to=default%40mailinator.com&subject=HomeOfficer%20report&html=This%20is%20a%20body";
        mailgun = mailgun.post(dummyMailgunOptions().methodURL,dummyBody);
        buildSuccessHTTPStub();
    }

    function stubNockRequestWithContentType(){
        mailgun = nock(dummyMailgunOptions().baseURL,{
            reqheaders:{
                "Content-Type":"application/x-www-form-urlencoded"
            }
        });
        stubNockWithGoodURL();  
    }

    function stubNockRequestWithBasicAuthorization(){
        mailgun = nock(dummyMailgunOptions().baseURL,{
            reqheaders:{
                "Authorization":"Basic "+dummyBasicAuthenticationValue()
            }
        });
       stubNockWithGoodURL(); 
    }

    function buildSuccessHTTPStub(){
        mailgun = mailgun.reply(200,{
           message:"successMessage"
        });
    }

    function dummyBasicAuthenticationValue(){
        return "YXBpOnBhc3N3b3Jk";
    }

    function dummyMailgunOptions(){
        return {
            baseURL:"https://api.mailgun.net",
            defaultEmail:"default@mailinator.com",
            methodURL:"/v3/sandbox72b0644752ac4da4a63ed55eefa7ff16.mailgun.org/messages",
            authorizationUsername:"api",
            authorizationPassword:"password"
        }
    }
});
