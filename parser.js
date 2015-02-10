module.exports = function(tokens) {
  var tokenIndex = -1;
  var currentToken;
  var nextToken;
  advanceTokenStream();

  var programExpression = parseProgram(tokens);

  

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

console.log('loading');
  console.log('ProcedureExpression.prototype', ProcedureExpression.prototype);
  

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

  function BlockExpression(expressions) {
    this.expressions = expressions;
  }
  BlockExpression.prototype.toString = function() {
    var exp = [];
    for (e in this.expressions) {      
      exp.push(this.expressions[e].toString());
    }
    
    return ['(BlockExpression ', exp.join(';\n')].join('');
  };


  function BlockVarExpression(name, type) {
    this.name = name;
    this.type = type;
  };
  BlockVarExpression.prototype.toString = function() {
    return ['(BlockVarExpression name=', this.name, ':', this.type,
      ')'].join('');
  };

  function IfExpression(test, thenBlock, elseBlock) {
    this.test = test;
    this.thenBlock = thenBlock;
    this.elseBlock = elseBlock;
  };
  IfExpression.prototype.toString = function() {
    return ['(IfExpression test=', this.test, '?', this.thenBlock,
      this.elseBlock, ')'].join('');
  };

  function TestExpression(left, relational, right) {
    this.left = left;
    this.relational = relational;
    this.right = right;
  }
  TestExpression.prototype.toString = function() {
    return ['(TestExpression ', this.left, this.relational, this.right,
      ')'].join('');
  };

  function ForExpresssion(assignment, step, limit, forBlock) {
    this.assignment = assignment;
    this.step = step;
    this.limit = limit;
    this.forBlock = forBlock;
  }
  ForExpresssion.prototype.toString = function() {
    return ['(ForExpresssion ', this.assignment, ' step ', this.step,
      ' until ', this.limit, this.forBlock, ')'].join('');
  }

  function VariableExpression(name) {
    this.name = name;
  };
  VariableExpression.prototype.toString = function() {
    return ['(VariableExpression name=', this.name,')'].join('');
  };

  function LiteralExpression(value) {
    this.value = value;
  };
  LiteralExpression.prototype.toString = function() {
    return ['(LiteralExpression value=', this.value,')'].join('');
  };

  function ProcedureCallExpression(proc, args) {
    this.proc = proc;
    this.args = args;
  }
  ProcedureCallExpression.prototype.toString = function() {
    return ['(ProcedureCallExpression ', this.proc, this.args, ')'].join('');
  };

  function AssignmentExpression(lValue, rExpr) {
    this.lValue;
    this.rExpr = rExpr;
  }
  AssignmentExpression.prototype.toString = function() {
    return ['(AssignmentExpression ', this.lValue, '=',
      this.rExpr, ')'].join('');
  }

  function LabelExpression(label) {
    this.label = label;
  }
  LabelExpression.prototype.toString = function() {
    return ['(LabelExpression ', this.label, ')'].join('');
  }

  function ArrayAccessExpression(arrayName, indices) {
    this.arrayName = arrayName;
    this.indices = indices;
  }
  ArrayAccessExpression.prototype.toString = function() {
    return ['(ArrayAccessExpression ', this.arrayName, '(',
      this.indices.join(','), '))'].join('');
  }

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

    blockExpression = new BlockExpression(parseBlock(name));

    var expr = new ProcedureExpression(name, parameterExpressions,
      blockExpression);
    process.stdout.write(expr.toString());
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
        expressions.push(parseExpression());
      }
    }
    consumeValue('end');

    if (blockName) {
      consumeValue(blockName);
    }
    return expressions;
  }

  function parseIf() {
    var test;
    var left;
    var relation;
    var right;
    var thenBlock;
    var elseBlock;

    consumeValue('if');
    left = parseExpression();
    relation = consumeType('relationals');
    right = parseExpression();

    // TODO we could check to make sure left and right are
    // either VariableExpression or LiteralExpression

    test = new TestExpression(left, nextToken.value, right);

    consumeValue('then');

    thenBlock = parseExpression();

    if (currentToken.value === 'else') {
      consumeValue('else');
      //...
      elseBlock = parseExpression();
    }
    return new IfExpression(test, thenBlock, elseBlock);
  }

  function parseFor() {
    var assignment;
    var step;
    var limit;
    var forBlock;

    consumeValue('for');
    assignment = parseAssignmentExpression();
    consumeValue('step');
    step = consumeType('literal').value;// TODO parseInt(x, 10)
    consumeValue('until');
    limit = parseExpression();
    consumeValue('do');
    forBlock = parseExpression();
    return new ForExpresssion(assignment, step, limit, forBlock); 
  }

  function parseExpression() {
    var exp;
    if (currentToken.value === 'if') {
      return parseIf();
    } else if (currentToken.value === 'begin') {
      return parseBlock();
    } else if (currentToken.value === 'for') {
      return parseFor();
    } else if (currentToken.type === 'name') {
      if (nextToken.value === '(') {
        return parseProcedureCall();
      } else if (nextToken.value === '[') {
        return parseArrayAccess();
      } else if (nextToken.value === ':=') {        
        return parseAssignmentExpression();
      } else if (nextToken.value === ':') {
        return parseLabelExpression();
      } else {
        return new VariableExpression(consumeType('name').value);
      }
    } else if (currentToken.type === 'literal') {
      return new LiteralExpression(consumeType('literal').value);
    } else if (currentToken.value === '(') {
      consumeValue('(');
      exp = parseExpression();
      consumeValue(')');
      return exp;
    } else {
      debugger;
      throw new Error('Unexpected Token: ' + fmt(currentToken) +
        fmt(nextToken));


    }
  }

  function parseProcedureCall() {
    var proc = consumeType('name').value;
    var args = parseArguments();
    return new ProcedureCallExpression(proc, args);
  }

  function parseArrayAccess() {
    var arrayName;
    var indices = [];
    arrayName = new VariableExpression(consumeType('name').value);

    while (currentToken.value === '[') {
      indices.push(parseIndexed());      
    } 
    return new ArrayAccessExpression(arrayName, indices);
  }

  function parseIndexed() {
    var exp;
    // [1] or [a]
    consumeValue('[');    
    if (currentToken.type === 'name') {
      exp = new VariableExpression(consumeType('name').value);
    } else if (currentToken.type === 'literal') {
      exp = new LiteralExpression(consumeType('literal').value);
    }
    consumeValue(']');
    return exp;
  }

  function parseAssignmentExpression() {
    var lValue;
    var rExpression;
    lValue = consumeType('name');
    consumeValue(':=');    
    return new AssignmentExpression(lValue, parseExpression());
  }

  function parseLabelExpression() {
    var label = consumeType('name');
    consumeValue(':');
    return new LabelExpression(label);
  }

  function parseArguments() {
    var args = [];
    consumeValue('(');
    // Take a and b of integer a, b, c
    while (nextToken.value === ',') {      
      args.push(parseExpression());
      consumeValue(',');
    }
    args.push(parseExpression());
    // Take c of a, b, c
    consumeValue(')');
    return args;
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
    return vars;
  }

  // etc
  function fmt(token) {
    return ['[', token.type, '][', token.value, '] line: ', token.lineNumber,
    token.columnNumber].join('');
  }

  return programExpression;
};

