function MailBuilderStub(){
    this.givenMessage = null;
}

MailBuilderStub.prototype.createMessageinHTML = function(mailCredential){
    return this.givenMessage;
};

module.exports = MailBuilderStub;
