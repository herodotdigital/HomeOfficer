

function MailSender(){
   this.givenError = null;
  this.usedMailCredential = null; 
}

MailSender.prototype.sendEmailToEmployeesProjectManager = function(mailCredential,callback){
    this.usedMailCredential = mailCredential;
    if(this.givenError != null){
        callback(this.givenError);
    } else {
        callback(null);
    }
};

module.exports = MailSender;
