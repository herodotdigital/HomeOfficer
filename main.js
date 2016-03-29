var express = require('express');
var app = express();
var bodyParser = require('body-parser');

var slackKeys = require('./settings/slackKeys.json');
var request = require('request');
var MailCredential = require('./lib/mail/MailCredential.js');
var HomeOfficer = require('./lib/HomeOfficer.js');
var WorkEvent = require('./lib/model/WorkEvent.js');
var WorkEventParser = require('./lib/WorkEventParser.js');
var DateRangeParser = require('./lib/dateParsing/DateRangeParser.js');
require('./lib/extensions/String+Utils.js');

var homeOfficer = new HomeOfficer({
    slackToken: slackKeys.slack_bot_token 
});

var workEventParser = new WorkEventParser(new DateRangeParser());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));


app.use(function (req, res, next) {
    if(!doesRequestComeFromSlack(req)){
        res.status(401).send('Sorry, it seems that your request didn\'t come from slack.');
    } else {
        next();
    }
});

function doesRequestComeFromSlack(request){
    var validationKey = request.body.token;
    var slackTokens = slackKeys.validation_tokens;
    var index = slackTokens.indexOf(validationKey);
    return index > -1
}

function extractData(json) {
    return {
        userName: json.user_name,
        command: json.command.replaceOccurencesOfString("/",""),
        message: json.text,
        responseURL: json.response_url
    };
};

function sendResponseTo(responseURL){
    var callback = function (error,successMessage){ 
        var messageToRespone = successMessage;
        
        if(error != null){
            messageToRespone = error.message;
            console.log("Error was thrown! "+error.message+'.*** Stacktrace:'+error.stack);
        }
        
        console.log("Send response message \'"+messageToRespone+'\' to URL'+responseURL);
        postResponse(responseURL,messageToRespone);
    }

    return callback;
}

function postResponse(responseURL,msg) {
    request.post(
        responseURL,
        {json: {text: msg}},
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log(body)
            }
        }
    );
}

app.use('/homeofficer/report/:type',function(req,res) {
    try {
        var extracted = extractData(req.body);
        var workEvent = workEventParser.createWorkEvent(extracted);
        homeOfficer.userWantToRegisterEvent(extracted.userName,workEvent,sendResponseTo(extracted.responseURL));
        res.status(202).send("Please give me a moment...");
    } catch (error){
        console.log("Error was thrown! "+error.message+'.*** Stacktrace:'+error.stack); 
        res.status(400).send(error.message);
    }
});

app.use('/homeofficer/worksheet',function(req,res){
    try{
        res.status(200).send("Hey! Link to worksheet is: "+homeOfficer.getWorksheetLink());
    } catch (error){
        console.log("Error was thrown! "+error.message+'.*** Stacktrace:'+error.stack); 
        res.status(400).send(error.message);
    }
});


var server = app.listen(5553, function () {
    var host = server.address().address
    var port = server.address().port
    console.log("Listening at http://%s:%s", host, port)
});
