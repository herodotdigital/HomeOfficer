var expect = require("chai").expect;
var moment = require('moment');
var msgParser = require("../lib/slackUserProvider.js");
var SlackUserProvider = require("../lib/slackUserProvider.js");

describe("SlackUserProvider", function(){
    var sut;
    var requestEngine;

    beforeEach(function(){
        requestEngine = new RequestEngineMock();
        sut = new SlackUserProvider("dummy", requestEngine.request.bind(requestEngine));
    });

    afterEach(function() {
        requestEngine = null;
        sut = null;
    });

    describe("findUser", function() {
        context("when it isn't the first call for any user", function() {
            beforeEach(function() {
                sut.findUser("dummy", function() { })
            });

            it("usees cached response to search for user", function(done) {
                sut.findUser("dummy", function() {
                    expect(requestEngine.didCall).to.equal(1)
                    done()
                });
            });
        });

        it("asks for the user real name for given slack nickname", function() {
            sut.findUser("jsnow", function(error, fullName) {
                expect(fullName).to.equal("John Snow");
            });

            sut.findUser("jsnow", function(error, fullName) {
                expect(fullName).to.equal("John Snow");
            });
        });

        describe("refreshes the cache after 1 day", function() {
            beforeEach(function() {
                sut.nowReference = function () { return createDate(2017,6,1,14,00); };
                sut.findUser("dummy", function() {})
            });
        
            it("refreshes for next day after 12 PM", function() {
                sut.nowReference = function () { return createDate(2017,6,2,12,01); };
                sut.findUser("dummy", function() {})
                expect(requestEngine.didCall).to.equal(2);
            });

            it("doesnt refresh for date before 12 PM", function(done) {
                sut.nowReference = function () { return createDate(2017,6,2,11,59); };
                sut.findUser("dummy", function() {
                    expect(requestEngine.didCall).to.equal(1);
                    done();
                })
            });
        });
    });
});

var path = require('path');
var fs = require("fs");  
var filePath = path.resolve(__dirname,".","slackFriendsJsonSample.json")
var sampleJSONBody = fs.readFileSync(filePath).toString();

function RequestEngineMock() {
    this.didCall = 0;
    this.response = {statusCode: 200}
    this.body = sampleJSONBody;
}

RequestEngineMock.prototype.request = function request(url, callback) {
    this.didCall += 1;
    callback(this.error, this.response, this.body);
}

function createDate(year,month,day,hour,minute){
    hour = typeof hour != 'undefined' ? hour : 0;
    minute = typeof minute != 'undefined' ? minute : 0;
    return new Date(year,month-1,day,hour,minute);
}