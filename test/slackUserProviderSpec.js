var expect = require("chai").expect;
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
    });
});

var path = require('path');
var fs = require("fs");  
var filePath = path.resolve(__dirname,".","slackFriendsJsonSample.json").toString();
var sampleJSONBody = fs.readFileSync(filePath)

function RequestEngineMock() {
    this.didCall = 0;
    this.response = {statusCode: 200}
    this.body = sampleJSONBody;
}

RequestEngineMock.prototype.request = function request(url, callback) {
    this.didCall += 1;
    callback(this.error, this.response, this.body);
}