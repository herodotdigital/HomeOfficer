
var DateRange = require("../model/DateRange.js");
var Chrono = require('chrono-node');
var OverflowRefiner = require('./OverflowRefiner.js');
var ENSlashDateWithDayFirstFormatParser = require('./ENSlashDateWithDayFirstFormatParser.js');
var ENNextWeekdayParser = require("./ENNextWeekdayParser.js");

function DateRangeParser(){
    this.dateParser = new Chrono.Chrono(chronoOptions());
    this.refrenceDate = today();
}

DateRangeParser.prototype.receiveDateRangeFromText = function(text){
    var results = this.dateParser.parse(text,this.refrenceDate());

    if(!isAnyDateParsed(results)){
        throw new Error('Sorry, I cannot find any date inside \''+text+'\'');
    }

    var dateRange = new DateRange(null,null);
    var start = results[0].start;
    dateRange.from = start.date();
    var end = results[0].end;
    if(end != null){
        dateRange.to = end.date();
    }

    return dateRange;
}

function isAnyDateParsed(parsedInfo){
    return parsedInfo[0] != null && typeof parsedInfo[0] != 'undefined';
}


function chronoOptions(){
    return {
        parsers: [
            new Chrono.parser.ENISOFormatParser(true),
            new ENNextWeekdayParser(true),
            new Chrono.parser.ENDeadlineFormatParser(true),
            new Chrono.parser.ENMonthNameLittleEndianParser(true),
            new Chrono.parser.ENMonthNameMiddleEndianParser(true),
            new ENSlashDateWithDayFirstFormatParser(true),
            new Chrono.parser.ENSlashDateFormatStartWithYearParser(true),
            new Chrono.parser.ENTimeAgoFormatParser(true),
            new Chrono.parser.ENTimeExpressionParser(true),
            new Chrono.parser.ENCasualDateParser(true)
        ],

        refiners: [
            // Removing overlaping first
            new Chrono.refiner.OverlapRemovalRefiner(),

            // ETC
            new Chrono.refiner.ENMergeDateTimeRefiner(),
            new Chrono.refiner.ENMergeDateRangeRefiner(),
            new Chrono.refiner.JPMergeDateRangeRefiner(),

            // Extract additional info later
            new Chrono.refiner.ExtractTimezoneOffsetRefiner(),
            new Chrono.refiner.ExtractTimezoneAbbrRefiner(),
            new Chrono.refiner.UnlikelyFormatFilter(),
            new OverflowRefiner()
        ]
    }
}

function today(){
    return function(){
        return new Date();
    }
}

module.exports = DateRangeParser;
