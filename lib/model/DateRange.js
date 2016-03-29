var moment = require('moment');
var dateUtil = require("../DateUtil.js");

function DateRange(from,to){
    this.from = from;
    this.to = to;
}

DateRange.prototype.isSingleDateRange = function(){
    return (this.from != null && this.to == null) || (this.from == this.to);
}

DateRange.prototype.toText = function(dateFormat){
    if(this.isSingleDateRange())
       return "on " + formatDate(this.from,dateFormat) ;
    else 
       return "from " + formatDate(this.from,dateFormat) + " to " + formatDate(this.to,dateFormat);
}

DateRange.prototype.daysBetween = function(){
    if(this.to == null || typeof this.to == 'undefined'){
        return 0;
    }
    
    return moment(this.to).diff(moment(this.from),'days');
}

DateRange.prototype.lengthInDays = function(){
    return this.daysBetween()+1;  
}

function formatDate(date,format){
    return moment(date).format(format); 
}

module.exports = DateRange;
