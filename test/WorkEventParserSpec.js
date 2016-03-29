var expect = require("chai").expect;
var WorkEvent = require("../lib/model/WorkEvent.js");
var DateRange = require("../lib/model/DateRange.js");
var WorkEventParser = require("../lib/WorkEventParser.js");
var DateRangeParserStub = require("./stubs/DateRangeParserStub.js");

describe("WorkEventParser",function(){
    var sut;
    var dateRangeParser;

    beforeEach(function(){
        dateRangeParser = new DateRangeParserStub();
        sut = new WorkEventParser(dateRangeParser);
    });

    describe("#createWorkEvent",function(){
        var givenDateRange;
        beforeEach(function(){
            givenDateRange = dummyDateRange();
            dateRangeParser.givenDateRange = givenDateRange;
        });

        it("should parse the dateRange with dateRangeParser",function(){
            sut.createWorkEvent({
                command:"vacation",
                message:"dummyMessage"
            });
            expect(dateRangeParser.passedText).to.equals("dummyMessage");
        });

        it("should create work event",function(){
            var json = {
                command: "remote",
                message: "dummyMessage"
            };

            var workEvent = sut.createWorkEvent(json);
            expect(workEvent.name).to.equals("remote");
            expect(workEvent.dateRange).to.equals(givenDateRange);
        });

        context("when type of workEvent is unknown",function(){
            it("should throw an error",function(){
                expect(function(){
                    sut.createWorkEvent({command:"not known type"});
                }).to.throw('Sorry, but \'not known type\' is unknown event type. Availables commands are [vacation, remote|homeoffice]');
            });
        });

        describe("checking for all available event types",function(){
            it("should create an event with type",function(){
                expectSuccesfullParsingForEventType("vacation");
                expectSuccesfullParsingForEventType("remote");
                expectSuccesfullParsingForEventType("homeoffice","remote");
            });
        });
    });

    function dummyDateRange(){
        return new DateRange(new Date(2016,0,1));
    }

    function expectSuccesfullParsingForEventType(type,expected){
        expected = typeof expected == 'undefined' ? type : expected;
        var json = {command:type};
        var workEvent = sut.createWorkEvent(json);
        expect(workEvent.name).to.equals(expected);
    }
});
