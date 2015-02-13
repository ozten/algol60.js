module.exports = function Environment() {
  var scope = [{
    '+': function(left, right) {
      return left + right;
    },
    '-': function(left, right) {
      return left - right;
    },
    '*': function(left, right) {
      return left * right;
    },
    '/': function(left, right) {
      if (right === 0) {
        throw new Error('DivideByZero not a good idea');
      }
      return left / right;
    },
    'NLCR': function() {
      process.stdout.write('\r\n');
    },
    'PRINT': function(number) {
      process.stdout.write(String(number));
    },
    'PRINTTEXT': function(str) {
      process.stdout.write(str);
    }
  }];
  return {
    pushScope: function() {
      scope.push({});
    },
    popScope: function() {
      scope.pop();
    },
    declare: function(name, type) {
      var thisScope = scope[scope.length -1];
      // TODO respect type information
      thisScope[name] = null;
    },
    populate: function(parameter, argument) {
      var thisScope = scope[scope.length -1];
      thisScope[parameter] = argument;
    },
    lookup: function(name) {
      for (var i = scope.length - 1; i >= 0; i--) {
        if (scope[i][name] !== undefined) {
          return scope[i][name];
        }
      }
      console.log(name);
      throw new Error('ReferenceError [' + name + '] is undefined');
    }
  }
};
