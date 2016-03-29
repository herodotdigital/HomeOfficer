
function WorkEvent(name,dateRange){
    this.name = name;
    this.dateRange = dateRange;
}

WorkEvent.prototype.deadlineToReport = function(){
    return new Date();
}

module.exports = WorkEvent;
