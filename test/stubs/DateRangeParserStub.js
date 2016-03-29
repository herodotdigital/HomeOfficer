function DateRangeParserStub(givenDateRange){
    this.errorToThrow = null;
    this.givenDateRange = givenDateRange;
}

DateRangeParserStub.prototype.receiveDateRangeFromText = function(text){
    this.passedText = text;
    if(this.errorToThrow != null){
        throw this.errorToThrow;
    } else {
        return this.givenDateRange;
    }
}

module.exports = DateRangeParserStub;
