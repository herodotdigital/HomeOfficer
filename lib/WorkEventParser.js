var WorkEvent = require('./model/WorkEvent.js');
var VacationEvent = require('./model/VacationEvent.js');
var RemoteEvent = require('./model/RemoteEvent.js');

const vacationRegex = "vacation";
const remoteRegex = "remote|homeoffice";

function WorkEventParser(dateRangeParser){
    this.dateRangeParser = dateRangeParser;
}

WorkEventParser.prototype.createWorkEvent = function(json){
    if(!isKnownEventType(json.command)){
        throw new Error('Sorry, but \''+json.command+'\' is unknown event type. Availables commands are ['+knownEventTypes().join(", ")+']');
    }

   var dateRange = this.dateRangeParser.receiveDateRangeFromText(json.message);
   var type = json.command;
   return createWorkEvent(type,dateRange); 
}

function isKnownEventType(type){
    return new RegExp(vacationRegex+"|"+remoteRegex).test(type);
}

function knownEventTypes(){
    return [vacationRegex,remoteRegex];
}

function createWorkEvent(type, dateRange){

    if(doesMatchToRegex(type,vacationRegex)){
        return new VacationEvent(dateRange);
    }
    
    if(doesMatchToRegex(type,remoteRegex)){
        return new RemoteEvent(dateRange);
    }

    return new WorkEvent("unknown",dateRange);
}

function doesMatchToRegex(text,regex){
    var expression = new RegExp(regex);
    console.log(text,expression,expression.test(text));
    return expression.test(text);
}

module.exports = WorkEventParser;
