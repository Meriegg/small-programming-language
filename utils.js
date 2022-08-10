const isKeyword = (token) => {
  return [token?.match(/print/g), token];
};

const isString = (token) => {
  return [token?.match(/"/g), token];
};

const consumeString = (tokens, index) => {
  let tempIndex = index + 1;
  let finalStringContent = "";

  while (tempIndex < tokens.length) {
    const stringWord = tokens[tempIndex];
    if (stringWord?.match(/"/g) || stringWord?.match(/;/g) || !stringWord) {
      delete tokens[tempIndex];
      break;
    }

    const splitWord = stringWord?.split("");
    for (let letterIndex = 0; letterIndex < splitWord.length; letterIndex++) {
      const letter = splitWord[letterIndex];
      finalStringContent += letter;
    }

    finalStringContent += " ";
    tempIndex++;
  }

  return finalStringContent;
};

const isVariableDeclaration = (token) => {
  return [token?.match(/var/g), token];
};

const isVariableUse = (token) => {
  return [!token?.match(/"/g), token];
};

module.exports = {
  isString,
  consumeString,
  isKeyword,
  isVariableDeclaration,
  isVariableUse,
};
