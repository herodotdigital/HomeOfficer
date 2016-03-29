var Chrono = require('chrono-node');
var Refiner = Chrono.Refiner;

/**
 * Sometimes it happens that date is created from components likes {day:30,month:2,year:2016}. This date is overflowed (30th of February does not exists). 
 * JS 'new Date()' constructor with such components would create nearest existing date (01 March 2016 in this example) which is not wrong.
 */

function OverflowRefiner(){
    Refiner.apply(this,Array.prototype.slice.call(arguments));
    this.refine = OverflowRefiner.prototype.refine;
};

OverflowRefiner.prototype = new OverflowRefiner();
OverflowRefiner.prototype.refine = function(text, results, opt){
    var notOverflowedResults = results.filter(function(result){
        if(isDateOverflowed(result,'start')){
            delete result['start'];
        }    

        if(isDateOverflowed(result,'end')){
            delete result['end'];
        }

        return result.hasOwnProperty('start');
    });

    return notOverflowedResults;
};


function isDateOverflowed(result,property){
    if(result.hasOwnProperty(property)){
       var components = result[property].knownValues;
       var date = result[property].date();
       return date.getFullYear() != components.year || date.getMonth()+1 != components.month || date.getDate() != components.day
    } else {
        return false;
    }
}

module.exports = OverflowRefiner;
