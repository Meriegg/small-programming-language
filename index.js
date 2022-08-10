const fs = require("fs");
const {
  isString,
  isKeyword,
  consumeString,
  isVariableDeclaration,
  isVariableUse,
} = require("./utils");

class Program {
  constructor(input) {
    this.input = input;
    this.tokenizeRegex = /\s*("|[A-z]*)\s*/g;
    this.memory = {
      variables: {},
      addVariable: (variableName, variableType, variableValue) => {
        this.memory.variables[variableName] = {
          type: variableType,
          value: variableValue,
        };
      },
      getVariable: (variableName) => {
        return this.memory.variables[variableName];
      },
      stdout: (value) => {
        console.log(value);
      },
    };
  }

  tokenize() {
    let tokens = this.input
      .split(this.tokenizeRegex)
      .filter((token) => !token.match(/^\s*$/));

    return tokens;
  }

  separateByLines() {
    const tokens = this.tokenize();
    let lines = [];

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];

      if (token === ";") {
        let line = [];
        for (let j = 0; j <= i; j++) {
          line.push(tokens[j]);
          delete tokens[j];
        }
        lines.push(line.filter((token) => token !== undefined));
      }
    }

    return lines;
  }

  parse() {
    const parsedLines = this.separateByLines();
    let parsedOutput = {};

    let lineIndex = 0;
    let columnIndex = 0;

    while (lineIndex < parsedLines.length) {
      const line = parsedLines[lineIndex];
      let parsedLine = {};

      while (columnIndex < line.length) {
        const token = line[columnIndex];
        let parsedLine = {};

        if (isKeyword(token)[0]) {
          parsedLine = {
            ...parsedLine,
            left: { type: "keyword", value: token },
          };

          if (isString(line[columnIndex + 1])[0]) {
            const stringContent = consumeString(line, columnIndex + 1);

            parsedLine = {
              ...parsedLine,
              right: { type: "string", value: stringContent },
            };
            parsedOutput[`Line_${lineIndex}`] = parsedLine;
            parsedLine = {};
            break;
          } else if (isVariableUse(line[columnIndex + 1])[0]) {
            parsedLine = {
              ...parsedLine,
              right: {
                type: "keyword",
                value: line[columnIndex + 1],
              },
            };
            parsedOutput[`Line_${lineIndex}`] = parsedLine;
            parsedLine = {};
            break;
          }
        } else if (isVariableDeclaration(token)) {
          let columnIndex = 0;
          let parsedVar = {};

          while (columnIndex < line.length) {
            let token = line[columnIndex];

            if (token?.match(/var/g)) {
              parsedVar["left"] = { type: "keyword", value: token };
            } else if (token?.match(/:/g)) {
              parsedVar["right"] = {
                ...parsedVar["right"],
                left: { type: "string", value: line[columnIndex - 1] },
              };
            } else if (isString(token)[0]) {
              const stringContent = consumeString(line, columnIndex);

              parsedVar["right"] = {
                ...parsedVar["right"],
                right: {
                  type: "string",
                  value: stringContent,
                },
              };
            }

            parsedOutput[`Line_${lineIndex}`] = parsedVar;
            columnIndex++;
          }
        }
        columnIndex++;
      }

      lineIndex++;
      columnIndex = 0;
    }

    return parsedOutput;
  }

  run() {
    const parsedOutput = this.parse();

    let lineIndex = 0;

    const parsedOutputKeys = Object.keys(parsedOutput);
    while (lineIndex < parsedOutputKeys.length) {
      const outputKey = parsedOutputKeys[lineIndex];
      const value = parsedOutput[outputKey];

      if (value.left.type === "keyword") {
        switch (value.left.value) {
          case "print":
            if (value.right.type === "string") {
              this.memory.stdout(value.right.value);
            } else if (value.right.type === "keyword") {
              this.memory.stdout(
                this.memory.getVariable(value.right.value).value
              );
            }
            break;
          case "var":
            this.memory.addVariable(
              value.right.left.value,
              value.right.left.type,
              value.right.right.value
            );
            break;
        }
      }

      lineIndex++;
    }
  }
}

fs.readFile("./index.cstm", "utf-8", (err, data) => {
  const program = new Program(data);
  program.run();
});
