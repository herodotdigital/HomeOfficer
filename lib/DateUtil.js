exports = module.exports = {};

function treatAsUTC(date) {
    var result = new Date(date);
    result.setMinutes(result.getMinutes() - result.getTimezoneOffset());
    return result;
}

exports.daysBetween = function(startDate, endDate) {
    var millisecondsPerDay = 24 * 60 * 60 * 1000;
    return (treatAsUTC(endDate) - treatAsUTC(startDate)) / millisecondsPerDay;
}

exports.isWorkday = function(date){
    return date.getDay() != 6 && date.getDay() != 0;
}

exports.addDays = function(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

exports.isMidnight = function(date){
    return date.getHours() == 0 && date.getMinutes() == 0;
}
