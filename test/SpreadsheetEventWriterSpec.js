var expect = require("chai").expect;
var SpreadsheetEventWriter = require("../lib/spreadsheet/SpreadsheetEventWriter.js");
var SheetProviderMock = require("./stubs/SheetProviderMock.js");
var WorkEvent = require("../lib/model/WorkEvent.js");
var RemoteEvent = require("../lib/model/RemoteEvent.js");
var VacationEvent = require("../lib/model/VacationEvent.js");
var DateRange = require("../lib/model/DateRange.js");
var WorksheetStub = require("./stubs/WorksheetStub.js");

describe("SpreadsheetEventWriter",function(){
    var sut;
    var rowsProvider = new SheetProviderMock();
    var rows;
    var worksheetPage;

    function rowShouldFailOnIndexWithError(index,error){
        rows[index]["save"] = function(callback){
            callback(error);
        }
    }

    beforeEach(function(){
        rows = rowsProvider.getPageSync(0);
        worksheetPage = new WorksheetStub(rows);
        sut = new SpreadsheetEventWriter(worksheetPage);
        console.log(rows);
    });

    afterEach(function(){
        rows = null;
        sut = null;
    });

    describe("#saveEvent",function(){
        context("when it is a single day event",function(){
          beforeEach(function(done){
            var workEvent = new WorkEvent("vacation",new DateRange(new Date(2016,0,4)));
            sut.saveEventForEmployee(workEvent,"Gerard Adamczyk",function(){
              done();
            });
          });

          it("should mark the date with event name",function(){
               expect(rows[7]["gerardadamczyk"]).to.equals("vacation");
          });

          it("change the format of date to allow Worksheet to parse it",function(){
            expect(rows[7]["x"]).to.equals("2016-01-04")
          });

          it("should save changes at row",function(){
              expect(rows[7].saveWasInvoked).to.equals(true);
            });
        });

        context("when it is a multiple days event",function(){
          beforeEach(function(done){
            var workEvent = new WorkEvent("remote",new DateRange(new Date(2016,0,5), new Date(2016,0,7)));
            sut.saveEventForEmployee(workEvent,"Anastazy Wyrick",function(){
              done();
            });
          });

           it("should save changes is every rows for days",function(){
              expect(rows[8]["anastazywyrick"]).to.equals("remote")
              expect(rows[9]["anastazywyrick"]).to.equals("remote")
              expect(rows[10]["anastazywyrick"]).to.equals("remote")
           });

           it("change the format of the date to allow Worksheet to parse it", function(){
              expect(rows[8]["x"]).to.equals("2016-01-05")
              expect(rows[9]["x"]).to.equals("2016-01-06")
              expect(rows[10]["x"]).to.equals("2016-01-07")
           });
        });

        context("when slack username and spreadsheet username dont fit eachother",function(){
            it("should comapre name from spreadsheet without diacritics",function(done){
                var workEvent = new RemoteEvent(new DateRange(new Date(2016,0,5),null));
                sut.saveEventForEmployee(workEvent,"Jaroslaw Sobol",function(error){
                    expect(error).to.equals(null);
                    expect(rows[8]["jarosławsobol"]).to.equals("remote");
                    done();
                });
            });

            it("should compare name from slack without diacritics",function(done){
                var workEvent = new RemoteEvent(new DateRange(new Date(2016,0,5),null));
                sut.saveEventForEmployee(workEvent,"Miłosław Piontek",function(error){
                    expect(error).to.equals(null);
                    expect(rows[8]["miloslawpiontek"]).to.equals("remote");
                    done();
                });
            });

            it("should report an error if names and any nearby possibilities do not fit",function(done){
                sut.saveEventForEmployee(dummyEvent(),"DoesNotExists",function(error){
                    expect(error).to.not.equals(null);
                    expect(error.message).to.equals("Sorry, but I can\'t find you inside spreadsheets. Check if DoesNotExists is your name.");
                    done();
                });
            });

        });

        context("when error occured in any of cells",function(){
            it("should report pass an error", function(done){
                var givenError = new Error("GivenError");
                rowShouldFailOnIndexWithError(9,givenError);

                var workEvent = new WorkEvent("remote",new DateRange(new Date(2016,0,5), new Date(2016,0,7)));
                sut.saveEventForEmployee(workEvent,"Anastazy Wyrick",function(error){
                    expect(error).to.equals(givenError);
                    done();
                });
            });
        });

        context("when error occured during downloading rows for worksheet page",function(){
            var givenError;
            beforeEach(function(){
                givenError = new Error("Cannot download rows for the page");
                worksheetPage.givenError = givenError;
            });

            it("should pass the error",function(done){
                var workEvent = new WorkEvent("remote",new DateRange(new Date(2016,0,5), new Date(2016,0,7)));
                sut.saveEventForEmployee(workEvent,"Anastazy Wyrick",function(error){
                    expect(error).to.equals(givenError);
                    done();
                });
            });
        });

        it("should marks only workdays",function(done){
            var eventWithWeekend = new RemoteEvent(new DateRange(new Date(2016,0,8), new Date(2016,0,11)));
            sut.saveEventForEmployee(eventWithWeekend,"Anastazy Wyrick",function(error){
                   expect(rows[11]["anastazywyrick"]).to.equals("remote")
                   expect(rows[12]["anastazywyrick"]).to.not.equals("remote")
                   expect(rows[13]["anastazywyrick"]).to.not.equals("remote")
                   expect(rows[14]["anastazywyrick"]).to.equals("remote")
                   done();
            });
        });
    });

    function dummyEvent(){
        return new RemoteEvent(new DateRange(new Date(2016,0,5)));
    }
});
