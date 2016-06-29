var dateUtil = require("../DateUtil.js");
var Rx = require("Rx");
var removeDiacritic = require("diacritics").remove;
var Q = require("q");
var moment = require("moment");

function SpreadsheetEventWriter(worksheetPage){
    this.worksheetPage = worksheetPage;
    this.beginingOfDateRow = 4;
    this.nameOfDateColumn = "x";
}

SpreadsheetEventWriter.prototype.saveEventForEmployee = function(workEvent,employeeName,callback){
    var self = this;

    getRows(self)
    .flatMap(function(rows){
        return saveEvent(self,workEvent,employeeName,rows);
    })
    .subscribe(function(onNext){
    },function(onError){
        callback(onError);
    },function(){
        callback(null);
        console.log(workEvent.name+" event was saved for "+employeeName);
    });

}

function getRows(self){
    return Rx.Observable.create(function(observable){
        self.worksheetPage.getRows(function(error,rows){
            if(error != null){
                observable.onError(error);
            } else {
                observable.onNext(rows);
                observable.onCompleted();
            }
        });
    });
}

function saveEvent(self,event,employeeName,rows){
    var usernameInSpreadsheet = findCorrespondingUsernameInSpreadsheet(employeeName,rows);
    if(usernameInSpreadsheet == null){
        return Rx.Observable.throw(new Error('Sorry, but I can\'t find you inside spreadsheets. Check if '+employeeName+' is your name.'));
    }

    var firstRowIndexToFill = findFirstRowIndexToFill(self,event,rows);
    var numberOfDaysToMark = event.dateRange.lengthInDays();
    var saveActionSignals = saveUserEventsForRowsAtRange(self,event,firstRowIndexToFill,numberOfDaysToMark,usernameInSpreadsheet,rows);
    return zippedSaveSignals(saveActionSignals);
}

function saveUserEventsForRowsAtRange(self,workEvent,firstRowIndexToFill,numberOfDaysToMark,usernameInSpreadsheet,rows){
    var signals = [];
    for(var i=0;i<numberOfDaysToMark;i++){
        var currentIndex=firstRowIndexToFill+i;
        var date = extractDateFromRow(self,rows[currentIndex]);
        if(dateUtil.isWorkday(date)){
            rows[currentIndex][usernameInSpreadsheet] = workEvent.name;
            rows[currentIndex][self.nameOfDateColumn] = dateInReadableFormatForWorksheet(date)
            var signalAction = saveSpreadsheetRowSignal(rows[currentIndex]);
            signals.push(signalAction);
        }
    }

    return signals;
}

function dateInReadableFormatForWorksheet(date) {
  return moment(date).format('YYYY-MM-DD')
}

function zippedSaveSignals(signals){
    if(signals.length == 1){
        appendDummySignalBecauseZipNeedsAtLeastTwoSignalsInside(signals);
    }

    return Rx.Observable.zip(signals);
}

function findFirstRowIndexToFill(self,workEvent,rows){
    var startDateInSpreadsheet = extractDateFromRow(self,rows[self.beginingOfDateRow]);
    var daysFromStart = Math.floor(dateUtil.daysBetween(startDateInSpreadsheet, workEvent.dateRange.from));
    var desiredRow = self.beginingOfDateRow + daysFromStart;
    return desiredRow;
}

function saveSpreadsheetRowSignal(row){
    return Rx.Observable.create(function (observer){
        row.save(function(error){
           if(error != null){
               observer.onError(error);
           } else {
               observer.onCompleted();
           }
        });
    });
}

function appendDummySignalBecauseZipNeedsAtLeastTwoSignalsInside(saveActions){
    saveActions.push([Rx.Observable.just(1)]);
}

function extractDateFromRow(self,row) {
    var parts = row[self.nameOfDateColumn].split(' ');
    return new Date(2000 + parseInt(parts[3], 10), parts[2] - 1, parts[1]);
}

function findCorrespondingUsernameInSpreadsheet(employeeName,rows) {
    employeeName = employeeName.toLowerCase();
    var splitedName = employeeName.split(' ')

    var firstLastName = splitedName[0]+splitedName[1]
    if(isColumNameValid(firstLastName,rows)){
        return firstLastName;
    }

    var lastFirstName = splitedName[1]+splitedName[0];
    if(isColumNameValid(lastFirstName,rows)){
        return lastFirstName;
    }

    return searchForColumnNameWithoutDiacritics(employeeName,rows);
};


function isColumNameValid(columName,rows) {
    return typeof rows[0][columName] !== "undefined"
};

function searchForColumnNameWithoutDiacritics(employeeName,rows){
    employeeName = employeeName.toLowerCase();
    var splitedName = employeeName.split(' ')

    var sheetrow = rows[0];
    var firstLastNameWithoutDiacritics = removeDiacritic(splitedName[0]+splitedName[1]);
    var lastFirstNameWithoutDiacrtics = removeDiacritic(splitedName[1]+splitedName[0]);

    var foundColumnName = null;
    var columnNames = Object.keys(sheetrow);
    var index = 0;

    while(foundColumnName == null && index < columnNames.length){
        var columNameWithoutDiacritics = removeDiacritic(columnNames[index]);
        if(columNameWithoutDiacritics == firstLastNameWithoutDiacritics || columNameWithoutDiacritics == lastFirstNameWithoutDiacrtics){
            foundColumnName = columnNames[index];
        }
        index+=1;
    }
    
    return foundColumnName;
}

module.exports = SpreadsheetEventWriter;
