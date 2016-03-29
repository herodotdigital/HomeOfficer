var request = require('request');
var options;

function MailSender(v_options,projectManagerProfileParser,mailBuilder){
   options = v_options;
   this.projectManagerProfileParser = projectManagerProfileParser;
   this.mailBuilder = mailBuilder;
}

MailSender.prototype.sendEmailToEmployeesProjectManager = function(mailCredential,callback){
    var mailBuilder  = this.mailBuilder;
    this.projectManagerProfileParser.receiveProjectManagerProfile(mailCredential.name,function(error,profile){
        var message = mailBuilder.createMessageinHTML(mailCredential);
        if(error != null){
           handleError(error,message,callback);
        } else {
           sendEmail(profile.email,message,callback);
        }
    });
};

function sendEmail(email,message,callback){
         request.post(URLForMailgunAPI(),{
                auth:basicAuthorizationJSONForMailgun(),
                form:bodyForMailRequest(email,message)
           },function(error,response,body){
               if(error != null){
                   callback(error,null); 
               } else {
                   callback(null,"success");
                   console.log("E-mail was sent to: "+email);
               }
           });   
}

function handleError(error,message,callback){
    if(isProjectManagerNotFound(error)){
        tryToSendEmailToDefaultEmailAddress(message,callback);
    } else {
       callback(error,null); 
    }
}

function URLForMailgunAPI(){
    return options.baseURL+options.methodURL;
}

function basicAuthorizationJSONForMailgun(){
    return {
        user:options.authorizationUsername,
        pass:options.authorizationPassword,
        sendImmediately:true
    }
}


function bodyForMailRequest(emailTo,message){
    return {
           from:"HomeOfficer <homeofficer@allinmobile.co>",
           to:emailTo,
           subject:"HomeOfficer report",
           html:message
        }
}

function handleResponse(callback){
    return function(error,response,body){
    };
}

function isProjectManagerNotFound(error){
    return error.name == "ProjectManagerNotFoundError";
}

function tryToSendEmailToDefaultEmailAddress(message,callback){
    if(options.hasOwnProperty("defaultEmail")){
        sendEmail(options.defaultEmail,message,callback);
    } else {
        callback(new Error("Sorry, but I did not send an e-mail to PM. Default e-mail address is unknown"));
    } 
}

function messageFromMessageBuilder(mailBuilder,mailCredential){
    return mailBuilder.createMessageinHTML(mailCredential);
}

module.exports = MailSender;
