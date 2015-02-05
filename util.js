exports.isAlphabetic = function(c) {
    return ('a' <= c && c <= 'z') ||
           ('A' <= c && c <= 'Z');
};

exports.isNumeric = function(c) {
    return '0' <= c && c <= '9';
}
