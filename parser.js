module.exports = function(tokens) {
  var tokenIndex = -1;
  var currentToken;
  var nextToken;
  advanceTokenStream();

  var programExpression = parseProgram(tokens);

  return programExpression;

  // State Machine
  function advanceTokenStream() {
    tokenIndex++;
    currentToken = tokenIndex < tokens.length ? tokens[tokenIndex] : null;
    nextToken = tokenIndex + 1 < tokens.length ? tokens[tokenIndex + 1] : null;
    
  }
  function consumeType(type) {    
    if (currentToken.type === type) {
      var t = currentToken;
      advanceTokenStream();
      return t;
    } else {
      throw new Error('Expected type:' + type + ', but found ' +
        fmt(currentToken));
    }
  }
  function consumeValue(value) {
    if (currentToken.value === value) {
      var t = currentToken;
      advanceTokenStream();
      return t;
    } else {
      throw new Error('Expected ' + value + ', but found ' +
        fmt(currentToken));
    }
  }

  // Types
  // Super class
  function Expression() {};

  function ProcedureExpression(name, parameters, blockExpression) {
    this.name = name;
    this.parameters = parameters;
    this.blockExpression = blockExpression;
  };
  ProcedureExpression.prototype.toString = function() {
    return ['(ProcedureExpression name=', this.name, this.parameters,
      this.blockExpression, ')\n'].join('');
  };

  function ParameterExpression(name, type) {
    this.name = name;
    this.type = type;
  };
  ParameterExpression.prototype.toString = function() {
    return ['(ParameterExpression name=', this.name, ':', this.type,
      ')'].join('');
  };


  function BlockVarExpression(name, type) {
    this.name = name;
    this.type = type;
  };
  BlockVarExpression.prototype.toString = function() {
    return ['(BlockVarExpression name=', this.name, ':', this.type,
      ')'].join('');
  };

  function parseProgram() {
    var procedureExpression = parseProcedure();
    return procedureExpression;
  }

  function parseProcedure() {
    var name;
    var parameters;
    var parameterTypes = {}; // we eventually fold types into parameters
    var blockExpression;

    consumeType('declarator');
    if (currentToken.type === 'name') {
      name = consumeType('name').value;
    } else {
      throw new Error('Expected type: name, but got ' + currentToken);
    }

    parameters = parseParameters();
    parameterTypes = parseParameterTypes();
    var parameterExpressions = [];
    for (var i=0; i < parameters.length; i++) {
      parameterExpressions.push(new ParameterExpression(parameters[i],
        parameterTypes[parameters[i]]));
    }

    blockExpression = parseBlock(name);

    var expr = new ProcedureExpression(name, parameterExpressions,
      blockExpression);
    return expr;
  }

  function parseParameters() {
    var params = [];
    consumeValue('(');
    while (currentToken.value !== ')') {
      params.push(consumeType('name').value);
      if (currentToken.value === ',') {
        if (nextToken.value === ')') {
          throw new Error('Unexpected trailing , on parameter list ' + nextToken );
        }
        consumeValue(',');
      }
    }
    consumeValue(')');
    return params;
  }

  function parseParameterTypes() {
    var types = {};
    while (currentToken.type === 'declarator') {
      var type = consumeType('declarator').value;
      if (type === 'string') {
        console.log(currentToken);
        console.log(nextToken);
      }

      // Take a and b of integer a, b, c
      while (nextToken.value === ',') {
        types[consumeType('name').value] = type;
        consumeValue(',');
      }
      types[consumeType('name').value] = type;
      // Take c of a, b, c
    }
    return types;
  }

  function parseBlock(blockName) {
    var expressions = [];
    consumeValue('begin');

    while (currentToken.value !== 'end') {
      if (currentToken.type === 'declarator') {
        expressions.push(parseVariableDeclaration());
      } else {
        // AOK TODO
        console.log('Unknown token', currentToken);        
        advanceTokenStream();
      }
    }
    consumeValue('end');
    console.log('AOK', currentToken);
    if (blockName) {
      consumeValue(blockName);
    }
  }

  function parseVariableDeclaration() {
    var type = consumeType('declarator').value;
    var vars = [];
    // Take a and b of integer a, b, c
    while (nextToken.value === ',') {
      vars.push(new BlockVarExpression(consumeType('name').value,
        type));        
      consumeValue(',');
    }
    vars.push(new BlockVarExpression(consumeType('name').value,
        type));
    // Take c of a, b, c
  }

  // etc
  function fmt(token) {
    return ['[', token.type, ']=', token.value, ' line: ', token.lineNumber,
    token.columnNumber].join('');
  }
};

