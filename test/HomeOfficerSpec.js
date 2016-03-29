var expect = require("chai").expect;
var HomeOfficer = require('../lib/HomeOfficer.js');
var DateRange = require('../lib/model/DateRange.js')

var SlackUserProviderStub = require('./stubs/SlackUserProviderStub.js');
var GoogleSpreadsheetStub = require('./stubs/GoogleSpreadsheetStub.js');
var MailSenderStub = require('./stubs/MailSenderStub.js');

var RemoteEvent = require('../lib/model/RemoteEvent.js');
var VacationEvent = require('../lib/model/VacationEvent.js');

describe("HomeOfficer", function (){
    var sut;
    beforeEach(function(){
        sut = new HomeOfficer({});
        sut.slackUserProvider = new SlackUserProviderStub();
        sut.googleSpreadsheet = new GoogleSpreadsheetStub();
        sut.mailSender = new MailSenderStub();
        stubDateAsNow(2016,3,2);
    });

    describe("#userWantToRegisterEvent",function(){
        context("should check for deadline of",function(){
            var event;

            context("remote event",function(){
                beforeEach(function(){
                    var dateRange = new DateRange(createDate(2016,3,3),dummyToDate());
                    event = new RemoteEvent(dateRange);
                });

                it("shouldn't be allowed if it wasn't reported day before until 3 PM",function(done){
                    stubDateAsNow(createDate(2016,3,2,15,00));

                    sut.userWantToRegisterEvent(dummySlackUser,event,function(error,successMessage){
                        expect(error).to.not.equals(null);
                        expect(error.message).to.equals("Sorry, but remote should be reported before 15:00 on 02 Mar 2016");
                        done();
                    });
                });

                it("should pass if it was reported day before until 3 PM",function(done){
                    stubDateAsNow(createDate(2016,3,2,14,59));

                    sut.userWantToRegisterEvent(dummySlackUser,event,function(error,successMessage){
                        expect(error).to.equals(null);
                        done();
                    });
                });
 
            });

            context("vacation event",function(){
                context("longer then 3 days",function(){
                    beforeEach(function(){
                        var dateRange = new DateRange(createDate(2016,3,3),createDate(2016,3,6));
                        event = new VacationEvent(dateRange);
                    })

                    it("shouldn't pass it if it wasn't reported a month before",function(done){
                        stubDateAsNow(createDate(2016,2,4,0,0));
                        sut.userWantToRegisterEvent(dummySlackUser(),event,function(error,success){
                            expect(error.message).to.equals("Sorry, but vacation should be reported before 04 Feb 2016");
                            done();
                        });
                    }); 

                    it("should be passed if was reported a month before",function(done){
                        stubDateAsNow(createDate(2016,2,3,23,59));
                        sut.userWantToRegisterEvent(dummySlackUser(),event,function(error){
                            expect(error).to.equals(null);
                            done();
                        });
                    });
                });

            
                context("between 1-3 days",function(){
                    beforeEach(function(){
                        var dateRange = new DateRange(createDate(2016,3,3),createDate(2016,3,5));
                        event = new VacationEvent(dateRange);
                    });

                    it("shouldn't be passed if wasn't reported 2 weeks earlier",function(done){
                        stubDateAsNow(createDate(2016,2,19,0,0));
                        sut.userWantToRegisterEvent(dummySlackUser(),event,function(error){
                            expect(error.message).to.equals("Sorry, but vacation should be reported before 19 Feb 2016");
                            done();
                        });    
                    });

                    it("should be passed if was reported 2 weeks earlier",function(done){
                        stubDateAsNow(createDate(2016,2,18,23,59));
                        sut.userWantToRegisterEvent(dummySlackUser(),event,function(error){
                            expect(error).to.equals(null);
                            done();
                        });
                    });
                });
            });
        });

        context("if everything went good",function(){
            it("should inform what dates was set for remote event",function(done){
                var event = new RemoteEvent(new DateRange(createDate(2016,5,2),createDate(2016,5,5)));
                sut.userWantToRegisterEvent(dummySlackUser(),event,function(error,successMessage){
                    expect(successMessage).to.equals("I've just set the remote from 02 May 2016 to 05 May 2016.");
                    done();
                }); 
            });

            it("should inform what dates was set for vacation event",function(done){
                var event = new VacationEvent(new DateRange(createDate(2016,5,2),createDate(2016,5,5)));
                sut.userWantToRegisterEvent(dummySlackUser(),event,function(error,successMessage){
                    expect(successMessage).to.equals("I've just set the vacation from 02 May 2016 to 05 May 2016.");
                    done();
                }); 
            });
        });

        context("if couldn't receive full name of user",function(){
            beforeEach(function(){
                sut.slackUserProvider.givenErrorForFindUser = new Error("Error passed by userProvider");
            });

            it("should pass an error reported by userProvider",function(done){
                sut.userWantToRegisterEvent(dummySlackUser(),dummyEvent(),function(error){
                    expect(error.message).to.equals("Error passed by userProvider");
                    done();
                });
            });
        });


        context("if couldn't set event in worksheet",function(){
            beforeEach(function(){
                sut.googleSpreadsheet.givenErrorForSaveEvent = new Error("Error from googleSpreadsheet");
            });

            it("should pass an error reported by googleSpreadsheet",function(done){
                sut.userWantToRegisterEvent(dummySlackUser(),dummyEvent(),function(error){
                    expect(error.message).to.equals("Error from googleSpreadsheet");
                    done();
                });
            });
        });

        context("if couldn't send e-mail to PM",function(){
            beforeEach(function(){
                sut.mailSender.givenError = new Error("Error from mailSender");
            });

            it("should say that homeoffice is reported, but the emplyee needs to inform the PM on his own",function(done){
                var event = new RemoteEvent(new DateRange(createDate(2016,5,2),createDate(2016,5,5)));
                sut.userWantToRegisterEvent(dummySlackUser(),event,function(error){
                    expect(error.message).to.equals("I've just set the remote from 02 May 2016 to 05 May 2016, but I couldn't be able to send an e-mail to your PM. Please, inform him about that!");
                    done();
                }); 
            });
        });
    });

    function stubDateAsNow(date){
        sut.now = function(){
           return date;
        }
    }

    function createDate(year,month,day,hours,minutes){
        hours = typeof hours != 'undefined' ? hours : 0;
        minutes = typeof minutes != 'undefined' ? minutes : 0; 
        return new Date(year,month-1,day,hours,minutes);
    }

    function dummyToDate(){
        var today = new Date();
        return createDate(today.getFullYear()+1,today.getMonth,today.getDate());
    }

    function dummySlackUser(){
        return "aborek";
    }

    function dummyEvent(){
        return new RemoteEvent(new DateRange(createDate(2016,5,2)),null);
    }
});

