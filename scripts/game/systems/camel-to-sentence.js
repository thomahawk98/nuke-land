function camelToSentence(str) {
    return str
        .replace(/([A-Z])/g, ' $1') // 1. Add a space before every capital letter
        .toLowerCase() // 2. Lowercase the entire string
        .replace(/^./, (match) => match.toUpperCase()) // 3. Capitalize the first letter of the sentence
        .trim(); // 4. Remove any accidental leading/trailing spaces
}