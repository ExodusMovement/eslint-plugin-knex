module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: "Avoid SQL injections",
    },
    messages: {
      avoid: `Avoid using {{query}}() with an interpolated string`,
    },
  },

  create(context) {
    const options = {
      rawStatements: /^(raw|whereRaw|joinRaw)$/,
      builderNamePattern: null,
    };
    if (context.settings && context.settings.knex) {
      const {
        rawStatements,
        builderName: builderNamePattern,
      } = context.settings.knex;

      if (rawStatements) options.rawStatements = rawStatements;
      if (builderNamePattern) options.builderNamePattern = builderNamePattern;
    }

    return {
      [`CallExpression[callee.property.name=${options.rawStatements}][arguments.0.type!='Literal']`](
        node,
      ) {
        if (options.builderNamePattern) {
          const builder = node.callee.object;
          const builderName = builder.name || builder.callee.name;

          if (!options.builderNamePattern.test(builderName)) {
            return;
          }
        }

        check(context, node);
      },
    };
  },
};

function check(context, node) {
  const statement = node.callee.property.name;
  const queryNode = node.arguments[0];

  if (
    queryNode === undefined ||
    (queryNode.type === "TemplateLiteral" && queryNode.expressions.length === 0)
  ) {
    return;
  }

  if (queryNode.type === "Identifier") {
    let currentScope = context.getScope();

    while (
      currentScope.upper &&
      !currentScope.variables.find(v => v.name === queryNode.name)
    ) {
      currentScope = currentScope.upper;
    }

    const variableDefinition = currentScope.variables.find(
      v => v.name === queryNode.name,
    );

    // The input variable is not defined?
    if (!variableDefinition) return;

    const queryVariableDefinition = variableDefinition.defs[0].node;
    if (!queryVariableDefinition.init) return;

    if (
      queryVariableDefinition.init.type === "Literal" ||
      (queryVariableDefinition.init.type === "TemplateLiteral" &&
        queryVariableDefinition.init.expressions.length === 0)
    ) {
      return;
    }
  }

  context.report({
    node: node.callee.property,
    messageId: "avoid",
    data: {
      query: statement,
    },
  });
}
