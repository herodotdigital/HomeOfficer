var expect = require("chai").expect;
var GoogleSpreadhsheetFacade = require("./../lib/spreadsheet/GoogleSpreadsheetFacade.js");
describe("GoogleSpreadhsheetFacade",function(){
    var sut;

    beforeEach(function(){
        sut = new GoogleSpreadhsheetFacade({key:"idOfSpreadsheet"}); 
    });

    describe("getLinkForWorksheet",function(){
       it("should return link with based on id",function(){
           var link = sut.getWorksheetLink();
           expect(link).to.equals("https://docs.google.com/spreadsheets/d/idOfSpreadsheet/")
       });   
    });
});
