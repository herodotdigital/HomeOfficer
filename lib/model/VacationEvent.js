const twoWeeksInDays = 14;



function VacationEvent(dateRange){
    this.name = 'vacation';
    this.dateRange = dateRange;
}

VacationEvent.prototype.deadlineToReport = function(){
    if(this.dateRange.daysBetween() < 3){
        return twoWeeksBeforeDeadlineDate(this);
    } else {
        return monthAgoDeadlineDate(this);
    }
}

function twoWeeksBeforeDeadlineDate(self){
    var startDate = self.dateRange.from;
    var twoWeeksBefore = new Date(startDate.getFullYear(),startDate.getMonth(),startDate.getDate()-twoWeeksInDays+1);
    return twoWeeksBefore;
}

function monthAgoDeadlineDate(self){
    var startDate = self.dateRange.from;
    var monthAgo = new Date(startDate.getFullYear(),startDate.getMonth()-1,startDate.getDate()+1);
    return monthAgo;
}

module.exports = VacationEvent;
