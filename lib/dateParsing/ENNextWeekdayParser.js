/*
    Date format with slash "/" (also "-" and ".") between numbers 
    - Tuesday 11/3/2015 (11 March 2015)
    - 11/3/2015
    - 11/3
*/

var moment = require('moment');
var Chrono = require('chrono-node');
var Parser = Chrono.Parser;
var ParsedResult = Chrono.ParsedResult;

var DAYS_OFFSET = { 'sunday': 0, 'sun': 0, 'monday': 1, 'mon': 1,'tuesday': 2, 'tues':2, 'tue':2, 'wednesday': 3, 'wed': 3,
    'thursday': 4, 'thurs':4, 'thur': 4, 'thu': 4,'friday': 5, 'fri': 5,'saturday': 6, 'sat': 6,}

var PATTERN = new RegExp('(\\W|^)' +
    '(?:(?:\\,|\\(|\\（)\\s*)?' +
    '(?:(next)\\s*)?' +
    '(' + Object.keys(DAYS_OFFSET).join('|') + ')' +
    '(?:\\s*(?:\\,|\\)|\\）))?' +
    '(?:\\s*(next)\\s*week)?' +
    '(?=\\W|$)', 'i');

var PREFIX_GROUP = 2;
var WEEKDAY_GROUP = 3;
var POSTFIX_GROUP = 4;

var daysInWeek = 7;

function ENNextWeekdayParser(){
    Parser.apply(this,Array.prototype.slice.call(arguments));
    this.pattern = ENNextWeekdayParser.prototype.pattern;
    this.extract = ENNextWeekdayParser.prototype.extract;
}

ENNextWeekdayParser.prototype = new ENNextWeekdayParser();

ENNextWeekdayParser.prototype.pattern = function(){
    return PATTERN;
};

ENNextWeekdayParser.prototype.extract = function(text, ref, match, opt){
        var index = match.index + match[1].length;
        var text = match[0].substr(match[1].length, match[0].length - match[1].length);
        var result = new ParsedResult({
            index: index,
            text: text,
            ref: ref,
        });

        var dayOfWeek = match[WEEKDAY_GROUP].toLowerCase();
        var offset = DAYS_OFFSET[dayOfWeek];
        if(offset === undefined) return null;

        var startMoment = moment(ref);
        var refOffset = startMoment.day();

        console.log("Before"+startMoment.toDate());
        startMoment.add(offset-refOffset,"days");
        if(refOffset >= offset){
            startMoment.add(daysInWeek,"days");
        }

        console.log("After changes"+startMoment.toDate());

        result.start.assign('weekday', offset);
        result.start.assign('day', startMoment.date())
        result.start.assign('month', startMoment.month() + 1)
        result.start.assign('year', startMoment.year())
        return result;
}

module.exports = ENNextWeekdayParser;
