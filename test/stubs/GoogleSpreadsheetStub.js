
function GoogleSpreadhsheetFacade(){
    this.usedEmployeeNameForSaveEvent = null;
    this.usedWorkEventForSaveEvent = null;
    this.givenErrorForSaveEvent = null;
}

GoogleSpreadhsheetFacade.prototype.saveEventForEmployee = function(workEvent,employeeName,callback){
    this.usedWorkEventForSaveEvent = workEvent;
    this.usedEmployeeNameForSaveEvent = employeeName;
    if(this.givenErrorForSaveEvent != null){
        callback(this.givenErrorForSaveEvent);
    } else {
        callback(null);
    }

}

GoogleSpreadhsheetFacade.prototype.getPage = function(pageNumber,callback){
};

module.exports = GoogleSpreadhsheetFacade;
