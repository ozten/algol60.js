module.exports = function(tokens) {
  var tokenIndex = -1;
  var currentToken;
  var nextToken;
  var parsers;

  advanceTokenStream();

  /* State Machine */
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

  /* Types */
  // Super class
  function Expression() {}

  // TODO... name this.propExpr versus this.prop for Expressions

  function ProcedureExpression(name, parameters, blockExpression) {
    this.name = name;
    this.parameters = parameters;
    this.blockExpression = blockExpression;
  }
  ProcedureExpression.prototype.toString = function() {
    return ['(ProcedureExpression name=', this.name, '\n\t', this.parameters,
      this.blockExpression, ')\n'].join('');
  };
  ProcedureExpression.prototype.evaluate = function(env) {
    // arguments to this function should already be evaluated
    // TODO call by NAME instead of VALUE
    // TODO a function application is apply instead of evaluate?
    env[this.name] = function() {
      var i;
      env.pushScope();
      //TODO evaluate parameters here or in populate?
      for (i=0; i < this.parameters.length; i++) {
        var param = this.parameters[i].evaluate(env);
        env.populate(param, this.arguments[i]);
      }
      env.populate(this.parameters, arguments);
      for (i=0; i < this.blockExpression.length; i++) {
        this.blockExpression[i].evaluate(env);
      }
      env.popScope();
    };
  };

  function ParameterExpression(name, type) {
    this.name = name;
    this.type = type;
  }
  ParameterExpression.prototype.toString = function() {
    return ['(ParameterExpression name=', this.name, ':', this.type,
      ')'].join('');
  };
  ParameterExpression.prototype.evaluate = function(env) {
    env.lookup(this.name);
  };

  function BlockExpression(expressions) {
    this.expressions = expressions;
  }
  BlockExpression.prototype.toString = function() {
    var exp = [];
    for (var e in this.expressions) {
      exp.push(this.expressions[e].toString());
    }

    return ['\n(BlockExpression ', exp.join(';\n')].join('');
  };
  BlockExpression.prototype.evaluate = function(env) {
    for (var e in this.expressions) {
      e.evaluate(env);
    }
  };


  function BlockVarExpression(name, type) {
    this.name = name;
    this.type = type;
  }
  BlockVarExpression.prototype.toString = function() {
    return ['(BlockVarExpression name=', this.name, ':', this.type,
      ')'].join('');
  };

  function IfExpression(test, thenBlock, elseBlock) {
    this.test = test;
    this.thenBlock = thenBlock;
    this.elseBlock = elseBlock;
  }
  IfExpression.prototype.toString = function() {
    return ['(IfExpression test=', this.test, ' ?\n\t', this.thenBlock, '\n\t',
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
    return ['\n(ForExpresssion ', this.assignment, ' step ', this.step,
      ' until ', this.limit, '\n\t\t', this.forBlock, ')'].join('');
  };

  function VariableExpression(name) {
    this.name = name;
  }
  VariableExpression.prototype.toString = function() {
    return ['(VariableExpression name=', this.name.toString(),')'].join('');
  };

  function LiteralExpression(value) {
    this.value = value;
  }
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
    this.lValue = lValue;
    this.rExpr = rExpr;
  }
  AssignmentExpression.prototype.toString = function() {
    return ['(AssignmentExpression ', this.lValue, ' <= ',
      this.rExpr, ')\n'].join('');
  };

  function LabelExpression(label) {
    this.label = label;
  }
  LabelExpression.prototype.toString = function() {
    return ['(LabelExpression ', this.label, ')\n'].join('');
  };

  function GoToExpression(label) {
    this.label = label;
  }
  GoToExpression.prototype.toString = function() {
    return ['(GoToExpression ', this.label, ')\n'].join('');
  };

  function ArrayAccessExpression(arrayName, indices) {
    this.arrayName = arrayName;
    this.indices = indices;
  }
  ArrayAccessExpression.prototype.toString = function() {
    return ['(ArrayAccessExpression ', this.arrayName, '(',
      this.indices.join(','), '))'].join('');
  };

  function OperatorExpression(left, op, right) {
    this.left = left;
    this.op = op;
    this.right = right;
  }
  OperatorExpression.prototype.toString = function() {
    return ['(OperatorExpression ', this.left, ' ', this.op, ' ', this.right,
      ')'].join('');
  };

  parsers = {
    prefix: {
      'if': parseIf,
      'begin': parseBlock,
      'for': parseFor,
      'goto': parseGoTo,
      'procedure': parseProcedure,
      '(': parseGroupedExpression
    },
    infix: {
      '(':  { '10': parseProcedureCall },
      '[':  { '40': parseArrayAccess },
      ':=': { '60': parseAssignmentExpression },
      ':':  { '20': parseLabelExpression },
      '+':   { '30': parseArithmetic },
      '-':   { '30': parseArithmetic },
      '*':   { '40': parseArithmetic },
      '/':   { '40': parseArithmetic }

      // TODO currently if bakes in the comparision operator,
      // but maybe this should just be an expression
      // and an infix expression?

      //// TODO parseAssignment expression could just be infix?
    }
  };

  /* driver */
  function parseExpression() {
    var exp;
    var prefixParser = parsers.prefix[currentToken.value];
    var infixParser;

    if (prefixParser !== undefined) {
      exp = prefixParser();
    } else if (['name', 'literal'].indexOf(currentToken.type) != -1) {
      exp = parseVariableOrLiteral();
    } else {
      throw new Error('Unexpected Token: ' + fmt(currentToken) +
        fmt(nextToken));
    }

    var infixExp;

    var infixParserMode = parsers.infix[currentToken.value];
    while (infixParserMode !== undefined) {
      var key = Object.keys(infixParserMode)[0];
      var precedence = parseInt(key, 10);

      // TODO compare our precedence with theirs
      infixParser = infixParserMode[key];



      infixExp = infixParser(infixExp || exp);
      // Can we keep parsing infix?
      infixParserMode = parsers.infix[currentToken.value]
    }

    return infixExp || exp;
  }

  /* parsers */

  // PREFIX procedure
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

    blockExpression = new BlockExpression(parseBlock());
    consumeValue(name);

    var expr = new ProcedureExpression(name, parameterExpressions,
      blockExpression);
    process.stdout.write(expr.toString());
    return expr;
  }

  // PREFIX begin
  function parseBlock() {
    var expressions = [];
    consumeValue('begin');

    while (currentToken.value !== 'end') {
      if (currentToken.type === 'declarator') {
        expressions.push(parseVariableDeclaration());
      } else {
        expressions.push(parseExpression());
      }
    }
    consumeValue('end');
    return new BlockExpression(expressions);
  }

  // PREFIX if
  function parseIf() {
    var test;
    var left;
    var relation;
    var right;
    var thenBlock;
    var elseBlock;

    consumeValue('if');
    left = parseExpression();
    relation = consumeType('relationals').value;
    right = parseExpression();

    // TODO we could check to make sure left and right are
    // either VariableExpression or LiteralExpression


    test = new TestExpression(left, relation, right);

    consumeValue('then');

    thenBlock = parseExpression();

    if (currentToken.value === 'else') {
      consumeValue('else');
      //...
      elseBlock = parseExpression();
    }
    return new IfExpression(test, thenBlock, elseBlock);
  }

  // PREFIX for
  function parseFor() {
    var assignment;
    var step;
    var limit;
    var forBlock;

    consumeValue('for');
    // TODO let the infix grammer take care of this?
    var left = parseVariableOrLiteral();
    assignment = parseAssignmentExpression(left);
    consumeValue('step');
    step = consumeType('literal').value;// TODO parseInt(x, 10)
    consumeValue('until');
    limit = parseExpression();
    consumeValue('do');
    forBlock = parseExpression();
    return new ForExpresssion(assignment, step, limit, forBlock);
  }

  // PREFIX goto
  function parseGoTo() {
    consumeValue('goto');
    return new GoToExpression(consumeType('name').value);
  }

  // PREFIX DECLARATION NAME
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

  // PREFIX (
  function parseGroupedExpression() {
    var exp;
    consumeValue('(');
    exp = parseExpression();
    consumeValue(')');
    return exp;
  }

  // INFIX NAME ( EXPR
  function parseProcedureCall(procName) {
    var args = parseArguments();
    return new ProcedureCallExpression(procName, args);
  }



  // INFIX NAME []
  function parseArrayAccess(arrayName) {
    var indices = [];

    consumeValue('[');

    while (nextToken.value === ',') {
      //TODO exp isn't declared?
      exp = parseVariableOrLiteral();
      indices.push(exp);
      consumeValue(',');
    }
    exp = parseVariableOrLiteral();
    indices.push(exp);
    consumeValue(']');
    return new ArrayAccessExpression(arrayName, indices);
  }

  // infix NAME := EXPR
  function parseAssignmentExpression(left) {
    var rExpression;
    consumeValue(':=');
    return new AssignmentExpression(left, parseExpression());
  }

  // INFIX NAME :
  function parseLabelExpression(left) {
    consumeValue(':');
    return new LabelExpression(left);
  }

  // INFIX NAMEorLITERAL ARITHMETICS
  // Explode into + - etc
  function parseArithmetic(left) {
    var op = consumeType('arithmetics').value;
    var right = parseVariableOrLiteral();
    return new OperatorExpression(left, op, right);
  }

  /* Helper functions */
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

  function parseVariableOrLiteral() {
    var exp;
    if (currentToken.type === 'name') {
      exp = new VariableExpression(consumeType('name').value);
    } else {
      exp = new LiteralExpression(consumeType('literal').value);
    }
    return exp;
  }

  // etc
  function fmt(token) {
    return ['[', token.type, '][', token.value, '] line: ', token.lineNumber,
    token.columnNumber].join('');
  }
  return parseExpression();
};

