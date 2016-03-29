var path = require('path');
var fileStream = require('fs');

function SheetProviderMock(){
    this.shouldFailAtFirstPage = false;
    this.shouldFailAtSecondPage = false;
}

SheetProviderMock.prototype.getPage = function(pageNumber,callback){
    var filePath = getFileName(pageNumber);
    if(this._shouldReportError(pageNumber)){
        callback(new Error("Cannot download page "+pageNumber),null);
    } else {    
        fileStream.readFile(filePath,function(error,data){
            var json = createSpreadsheetRowsFromData(data);
            callback(error,json);
        }); 
    }
}

function getFileName(pageNumber) {
    var fileName = pageNumber == 0 ? "spreadsheetPage1JSON.json" : "spreadsheetPage2JSON.json"
    var filePath = path.resolve(__dirname,"../",fileName);
    return filePath;
} 

function createSpreadsheetRowsFromData(data){
    var json = JSON.parse(data);
    json.forEach(function(row){
       row.saveWasInvoked = false;
       row.save = function(callback){
          row.saveWasInvoked = true;
          callback(null);
       }   
    });
    return json;
}

SheetProviderMock.prototype.getPageSync = function(pageNumber){
    var fileName = getFileName(pageNumber);
    var data = fileStream.readFileSync(fileName);
    var json = createSpreadsheetRowsFromData(data);
    return json;

}

SheetProviderMock.prototype._shouldReportError = function(pageNumber){
    if(pageNumber == 0 && this.shouldFailAtFirstPage == true){
        return true;
    }

    if(pageNumber == 1 && this.shouldFailAtSecondPage == true){
        return true;
    }

    if(pageNumber > 1){
        return true;
    }

    return false;
}

module.exports = SheetProviderMock;
