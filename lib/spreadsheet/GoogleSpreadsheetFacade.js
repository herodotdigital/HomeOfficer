var SpreadsheetEventWriter = require('./SpreadsheetEventWriter.js');
var googleConsoleCertificate = require('../../settings/googleConsoleCertificate.json');
var googleSpreadsheetKeys = require('../../settings/googleSpreadsheetKeys.json');
var GoogleSpreadsheet = require("google-spreadsheet");

function GoogleSpreadhsheetFacade(spreadsheet){
    this.spreadsheetInfo = typeof spreadsheet != 'undefined' && spreadsheet != null ? spreadsheet : googleSpreadsheetKeys;
    initializeGoogleSheet(this);
}

function initializeGoogleSheet(self){
    self.googleSheet = new GoogleSpreadsheet(self.spreadsheetInfo.key);
    self.googleSheet.useServiceAccountAuth(googleConsoleCertificate, function (err) {
         self.googleSheet.getInfo(function (err, sheet_info) {
            if (err) {
                console.log("Error during downloading a Spreadsheet" + err)
            } else {
                console.log(sheet_info.title + ' is loaded');
                self.sheetInfo = sheet_info;
                self.eventWriter = new SpreadsheetEventWriter(sheet_info.worksheets[0]);
            }
        });
    });   
}

GoogleSpreadhsheetFacade.prototype.saveEventForEmployee = function(workEvent,employeeName,callback){
    this.eventWriter.saveEventForEmployee(workEvent,employeeName,callback);
}

GoogleSpreadhsheetFacade.prototype.getPage = function(pageNumber,callback){
    try{
        var sheet = this.sheetInfo.worksheets[pageNumber];
        sheet.getRows(function(error,rows){
            callback(error,rows);
        }); 
    } catch (error) {
        callback(error);
    }
};

GoogleSpreadhsheetFacade.prototype.getWorksheetLink = function (){
    return "https://docs.google.com/spreadsheets/d/"+this.spreadsheetInfo.key+"/"; 
}

module.exports = GoogleSpreadhsheetFacade;
