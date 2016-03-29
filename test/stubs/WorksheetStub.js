function WorksheetStub(givenRows){
    this.rows = givenRows;
    this.givenError = null;
}

WorksheetStub.prototype.getRows = function(callback){
    if(this.rows == null || this.givenError != null){
        reportError(this,callback);
    } else {
        callback(null,this.rows);
    }
};

function reportError(self,callback){
    var errorToReport = self.givenError;
    if(errorToReport == null){
        errorToReport = new Error("Unkown error. No rows to stub and any error to stub");
    }

    callback(errorToReport);
}

module.exports = WorksheetStub;
