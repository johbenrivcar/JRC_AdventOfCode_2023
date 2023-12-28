// https://adventofcode.com/2023/day/8

const { readFileSync } = require('fs');

//type Nodes = Record<string, { L: string; R: string }>;

const solution = solve(readLines(`${__dirname}/Day8Input.txt`));
console.log(solution.part2.toLocaleString());

function readLines(inputFilePath) {
  const input = readFileSync(inputFilePath, 'utf-8');
  return input.replace(/\r\n/g, '\n').split('\n');
}

function solve(inputLines) {
  const [instructionsLine, , ...nodeLines] = inputLines;
  const instructions = instructionsLine.split('') 
  const nodes = parseNodes(nodeLines);

  return {
    /*part1: getSteps({
      instructions,
      nodes,
      startingNode: 'AAA',
      endingCondition: (node) => node === 'ZZZ',
    }),*/
    part2: solvePart2(instructions, nodes),
  };
}

function parseNodes(nodeLines) {
  return nodeLines.reduce((acc, line) => {
    const [nodeId, connections] = line.split('=').map((x) => x.trim());
    const match = connections.match(/\((?<left>.+),\s+(?<right>.+)\)/);
    const { left, right } = match.groups;
    acc[nodeId] = { L: left, R: right };
    return acc;
  }, {});
}

function getSteps({
  instructions,
  nodes,
  startingNode,
  endingCondition,
}
/*: {
  instructions: Array<'L' | 'R'>;
  nodes: Nodes;
  startingNode: string;
  endingCondition: (node: string) => boolean;
}
*/) {
  const getNextInstruction = createInstructionIterator(instructions);

  let stepsCount = 0;
  let currentNode = startingNode;
  let currentInstruction;

  while (!endingCondition(currentNode)) {
    currentInstruction = getNextInstruction();
    currentNode = nodes[currentNode][currentInstruction];
    stepsCount++;
  }

  return stepsCount;
}

function createInstructionIterator(instructions) {
  let currentIndex = 0;

  return () => instructions[currentIndex++ % instructions.length];
}

function solvePart2(instructions, nodes) {
  const startingNodes = Object.keys(nodes).filter(
    ([, , endLetter]) => endLetter === 'A'
  );

  const cycles = startingNodes.map((startingNode) =>
    getSteps({
      instructions,
      nodes,
      startingNode,
      endingCondition: (node) => node[2] === 'Z',
    })
  );

  return lcm(cycles);
}

function lcm(arr) {
  return arr.reduce((acc, n) => (acc * n) / gcd(acc, n));
}

function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}