var dateUtil = require('../DateUtil.js');

function RemoteEvent(dateRange){
    this.name = 'remote';
    this.dateRange = dateRange;
}

RemoteEvent.prototype.deadlineToReport = function(){
    var firstDateToMark = this.dateRange.from;
    var dayBeforeUntil3PM = new Date(firstDateToMark.getFullYear(),firstDateToMark.getMonth(),firstDateToMark.getDate()-1,15,00,00);
    return dayBeforeUntil3PM; 
}

module.exports = RemoteEvent;

