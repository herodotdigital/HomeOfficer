var ProjectManagerProfile = require('../model/ProjectManagerProfile.js');
var sheetProvider;
function ProjectManagerSpreadSheetParser(v_sheetProvider){
    sheetProvider = v_sheetProvider;
}

ProjectManagerSpreadSheetParser.prototype.receiveProjectManagerProfile = function(name,callback){
    sheetProvider.getPage(0,function(errorOfPage1, firstPage){
        sheetProvider.getPage(1,function(errorOfPage2, secondPage){
            if(errorOfPage1 != null || errorOfPage2 != null){
                reportSpreadsheetError(callback);               
            } else {
               tryToParseSpreadsheetPages(name,firstPage,secondPage,callback);
            }   
        });
    });
};

function reportSpreadsheetError(callback){
    callback(new SpreadSheetDownloadError('Cannot download a spreadsheet page'),null); 
}

function tryToParseSpreadsheetPages(employeeName,firstPage,secondPage,callback){
    try{
        var profileOfProjectManager = findProfileOfProjectManager(employeeName,firstPage,secondPage);
        callback(null,profileOfProjectManager);
    } catch (error) { 
       callback(error,null);
    }
}
 

function findProfileOfProjectManager(employeeName,firstSpreadsheetPage,secondSpreadSheetPage){
    var projectName = receiveProjectNameForEmployee(firstSpreadsheetPage,employeeName);
    var projectManagerJSON = receiveJSONOfProjectManager(projectName,secondSpreadSheetPage); 
   
    if(projectManagerJSON == null){
        throw new ProjectManagerNotFoundError('Project Manager was not found');
    }
    var email = projectManagerJSON.email;
    var name = projectManagerJSON.name;
    return new ProjectManagerProfile(name,email);
};

function receiveProjectNameForEmployee(spreadSheetPage,employeeName){
    var projectsRow = spreadSheetPage[2];
    var simplifiedName = employeeName.replace(" ","");
    simplifiedName = simplifiedName.toLowerCase(); 
    var projectName = projectsRow[simplifiedName];
    return projectName; 
}

function receiveJSONOfProjectManager(projectName,spreadsheetPage){
    var jsonWithProjectNames = mapToJSONWithProjectNameAsKeys(spreadsheetPage);
    var projectManagerJSON = jsonWithProjectNames[projectName];
    return projectManagerJSON;
}

function mapToJSONWithProjectNameAsKeys(googleSheet){
    return googleSheet.reduce(function(result,jsonElement,index,array){
        result[jsonElement.nameofproject] = {
            name: jsonElement.projectmanager,
            email: jsonElement.emailtopm
        };
        return result;
    },{});
}


module.exports = ProjectManagerSpreadSheetParser;

function SpreadSheetDownloadError(message){
    this.name = "SpreadSheetDownloadError";
    this.message = message;
}

SpreadSheetDownloadError.prototype = Object.create(Error.prototype);
SpreadSheetDownloadError.prototype.constructor = SpreadSheetDownloadError;

function ProjectManagerNotFoundError(message){
    this.name = "ProjectManagerNotFoundError";
    this.message = message; 
}
ProjectManagerNotFoundError.prototype = Object.create(Error.prototype);
ProjectManagerNotFoundError.prototype.constructor = ProjectManagerNotFoundError;

