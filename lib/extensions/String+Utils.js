String.prototype.replaceOccurencesOfString = function(search,replacement){
    return this.split(search).join(replacement);
}
