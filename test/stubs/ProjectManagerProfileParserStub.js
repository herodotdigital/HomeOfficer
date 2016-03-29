function ProjectManagerProfileParserStub(){
    this.pm_profile = null;
    this.givenError = null;
}

ProjectManagerProfileParserStub.prototype.receiveProjectManagerProfile = function(name,callback){
    if(this.givenError == null){
        callback(null,this.pm_profile);
    } else {
        callback(this.givenError,null);
    }
};

module.exports = ProjectManagerProfileParserStub;
