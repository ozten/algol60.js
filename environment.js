module.exports = function Environment() {
  this.scope = [{
    '+': function(left, right) {
      return left + right;
    },
    'NLCR': function() {
      process.stdout.write('\r\n');
    },
    'PRINTTEXT': function(str) {
      process.stdout.write(str);
    }
  }];
  return {
    pushScope: function() {
      this.scope.push({});
    },
    popScope: function() {
      this.scope.pop();
    },
    populate: function(parameter, argument) {
      var scope = this.scope[this.scope.length -1];
      scope[parameter] = argument;
    },
    lookup: function(name) {
      // AOK TODO
    }
  }
};
