var expect = require('chai').expect;
var SheetProviderMock = require('./stubs/SheetProviderMock');
var ProjectManagerSpreadSheetParser = require('../lib/spreadsheet/ProjectManagerSpreadSheetParser.js');
var ProjectManagerProfile = require('../lib/model/ProjectManagerProfile.js');
describe("ProjectManagerSpreadSheetParser",function(){
    var sut;
    var sheetProvider;

    beforeEach(function(){
        sheetProvider = new SheetProviderMock(); 
        sut = new ProjectManagerSpreadSheetParser(sheetProvider);
    });

    afterEach(function(){
        sut = null;
    });

    describe("#receiveProjectManagerProfile",function(){
        context("when user has corresponding project manager",function(){
            it("should parse name of the project manager",function(done){
               sut.receiveProjectManagerProfile("Lechosław Michel",function(error,profile){
                   expect(profile.name).to.equals("Jarogniew Bukowski");
                   done();
               });
            });
            
            it("should parse email of the project manager",function(done){
               sut.receiveProjectManagerProfile("Lechosław Michel",function(error,profile){
                   expect(profile.email).to.equals("jarogniew@mailinator.com");
                   done();
               });
            });
        });

        context("when user doesn't have a project",function(){
            it("should return an error that PM was not found",function(done){
                sut.receiveProjectManagerProfile("Przemo Janda",function(error,profile){
                    expect(profile).to.equals(null);
                    expect(error.name).to.equals("ProjectManagerNotFoundError");
                    done();
                });
            });
        });

        context("when sheetProvider will return error",function(){
            context("error for page1",function(){
                beforeEach(function(){
                   sheetProvider.shouldFailAtFirstPage = true;
                });

                it("should report an error",function(done){
                    sut.receiveProjectManagerProfile("error",function(error,profile){
                        expect(profile).to.equals(null);
                        expect(error.name).to.equals("SpreadSheetDownloadError");
                        done();
                    });
                });
            });

            context("error for page2",function(){
                beforeEach(function(){
                    sheetProvider.shouldFailAtSecondPage = true;
                });

                it("should report an error",function(done){
                    sut.receiveProjectManagerProfile("error",function(error,profile){
                        expect(profile).to.equals(null);
                        expect(error.name).to.equals("SpreadSheetDownloadError");
                        done();
                    });
                });
            });
        });
    });
});
