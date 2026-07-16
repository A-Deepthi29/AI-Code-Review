function analyzeComplexity(code) {

    const linesOfCode = code.split("\n").length;

    const numberOfFunctions =
        (code.match(/function\s+\w+/g) || []).length +
        (code.match(/=>/g) || []).length;

    const numberOfClasses =
        (code.match(/class\s+\w+/g) || []).length;

    let cyclomaticComplexity = 1;

    cyclomaticComplexity += (code.match(/\bif\b/g) || []).length;
    cyclomaticComplexity += (code.match(/\bfor\b/g) || []).length;
    cyclomaticComplexity += (code.match(/\bwhile\b/g) || []).length;
    cyclomaticComplexity += (code.match(/\bcase\b/g) || []).length;
    cyclomaticComplexity += (code.match(/\bcatch\b/g) || []).length;
    cyclomaticComplexity += (code.match(/&&/g) || []).length;
    cyclomaticComplexity += (code.match(/\|\|/g) || []).length;
    cyclomaticComplexity += (code.match(/\?/g) || []).length;

    return {
        linesOfCode,
        numberOfFunctions,
        numberOfClasses,
        cyclomaticComplexity
    };
}

module.exports = analyzeComplexity;