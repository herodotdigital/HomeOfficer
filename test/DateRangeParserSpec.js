var expect = require("chai").expect;
var DateRangeParser = require("../lib/dateParsing/DateRangeParser.js");
var dateUtil = require("../lib/dateUtil.js");
var moment = require("moment");

function expectDateEqualToDate(given, excepted) {
    expect(given.getFullYear()).to.equal(excepted.getFullYear());
    expect(given.getMonth()).to.equal(excepted.getMonth());
    expect(given.getDate()).to.equal(excepted.getDate());
}

function createDate(year,month,day,hour,minute){
    hour = typeof hour != 'undefined' ? hour : 0;
    minute = typeof minute != 'undefined' ? minute : 0;
    return new Date(year,month-1,day,hour,minute);
}

describe("DateRangeParser", function(){
    var sut = new DateRangeParser();

    describe("#receiveDateRangeFromText",function(){
        it("should be able to parse a 1-day event in multiple formats",function(){
            var dateRange = sut.receiveDateRangeFromText("12.04.2016");
            expectDateEqualToDate(dateRange.from, createDate(2016,04,12));
            expect(dateRange.to).to.equals(null);

            dateRange = sut.receiveDateRangeFromText("at 11/04/2016");
            expectDateEqualToDate(dateRange.from,createDate(2016,4,11));   

            dateRange = sut.receiveDateRangeFromText("11-04-2016");
            expectDateEqualToDate(dateRange.from,createDate(2016,4,11));   
        });

        it("should be able to parse date range event",function(){
            var dateRange = sut.receiveDateRangeFromText("from 12-01-2016 to 12-05-2016");
            expectDateEqualToDate(dateRange.from,createDate(2016,1,12));
            expectDateEqualToDate(dateRange.to,createDate(2016,5,12));

        });

        it("should always parse earlier date as from date",function(){
            dateRange = sut.receiveDateRangeFromText("from 12-05-2016 to 12-01-2016");
            expectDateEqualToDate(dateRange.from,createDate(2016,01,12));
            expectDateEqualToDate(dateRange.to,createDate(2016,05,12));
        })

        it("should be able to parse date from english words",function(){
            sut.refrenceDate = function(){
                var dateAt2AM = createDate(2016,1,1,2,0);
                return dateAt2AM;
            }
            var dateRange = sut.receiveDateRangeFromText("tomorrow");
            var tomorrow = createDate(2016,1,2);
            console.log("***"+dateRange.from+" isEqual? "+tomorrow);
            expectDateEqualToDate(dateRange.from,tomorrow);
            
            dateRange = sut.receiveDateRangeFromText("in 5 days");
            var in5days = createDate(2016,1,6);
            expectDateEqualToDate(dateRange.from,in5days); 
        });

        it("should be able to parse dates in english week days",function(){
            sut.refrenceDate = function(){
                var friday = createDate(2016,1,1);
                return friday;
            }

            var dateRange = sut.receiveDateRangeFromText("tuesday");
            var tuesday = createDate(2016,1,5);
            expectDateEqualToDate(dateRange.from,tuesday);
        });

        context("when date is in wrong format",function(){
            it("should not be able to parse not existing dates",function(){
                expectToNotFindDateInText("35 May 2016");           
                expectToNotFindDateInText("31 April 2016");
                expectToNotFindDateInText("04.31.2016");
                expectToNotFindDateInText("02.29.2015");
                expectToNotFindDateInText("02.30.2016");
                expectToNotFindDateInText("this is sample text without any date");
            });

            it("should parse only properly written dates in date chain",function(){
                var dateRange = sut.receiveDateRangeFromText("from 02.30.2016 to 03.04.2016");
                expectDateEqualToDate(dateRange.from,createDate(2016,4,3));

                dateRange = sut.receiveDateRangeFromText("from 28.02.2016 to 30.02.2016");
                expectDateEqualToDate(dateRange.from,createDate(2016,02,28));
            });
        });
    });

    function expectToNotFindDateInText(text){
        expect(function(){
                sut.receiveDateRangeFromText(text); 
        }).to.throw('Sorry, I cannot find any date inside \''+text+'\'');
    }
});
