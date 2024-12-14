import { useState, useEffect } from "react";

// Export interfaces and types for testing
export interface Problem {
  operator: "+" | "-" | "×" | "÷" | "見取算";
  operands: number[];
}

interface Bead {
  id: string;
  active: boolean;
}

interface Rod {
  id: string;
  heavenBeads: Bead[];
  earthBeads: Bead[];
}

export interface Level {
  grade: "1級" | "2級" | "3級" | "4級" | "5級" | "6級" | "7級" | "8級" | "9級" | "10級";
  minDigits: number;
  maxDigits: number;
  operations: {
    addition?: { enabled: boolean };
    subtraction?: { enabled: boolean };
    multiplication?: { digits: number };
    division?: { numeratorDigits: number; denominatorDigits: number };
    mentalCalculation?: { lines: number };
  };
}

export interface Score {
  addition: number;
  subtraction: number;
  multiplication: number;
  division: number;
  mentalCalculation: number;
  totalProblems: {
    addition: number;
    subtraction: number;
    multiplication: number;
    division: number;
    mentalCalculation: number;
  };
}

export const levels: Level[] = [
  {
    grade: "10級",
    minDigits: 2,
    maxDigits: 4,
    operations: {
      addition: { enabled: true },
      subtraction: { enabled: true }
    }
  },
  {
    grade: "9級",
    minDigits: 2,
    maxDigits: 4,
    operations: {
      addition: { enabled: true },
      subtraction: { enabled: true }
    }
  },
  {
    grade: "8級",
    minDigits: 2,
    maxDigits: 4,
    operations: {
      addition: { enabled: true },
      subtraction: { enabled: true },
      multiplication: { digits: 2 }
    }
  },
  {
    grade: "7級",
    minDigits: 2,
    maxDigits: 4,
    operations: {
      addition: { enabled: true },
      subtraction: { enabled: true },
      multiplication: { digits: 2 }
    }
  },
  {
    grade: "6級",
    minDigits: 3,
    maxDigits: 3,
    operations: {
      addition: { enabled: true },
      subtraction: { enabled: true },
      multiplication: { digits: 3 },
      division: { numeratorDigits: 6, denominatorDigits: 3 },
      mentalCalculation: { lines: 3 }
    }
  },
  {
    grade: "5級",
    minDigits: 4,
    maxDigits: 4,
    operations: {
      addition: { enabled: true },
      subtraction: { enabled: true },
      multiplication: { digits: 4 },
      division: { numeratorDigits: 8, denominatorDigits: 4 },
      mentalCalculation: { lines: 5 }
    }
  },
  {
    grade: "4級",
    minDigits: 5,
    maxDigits: 5,
    operations: {
      addition: { enabled: true },
      subtraction: { enabled: true },
      multiplication: { digits: 5 },
      division: { numeratorDigits: 10, denominatorDigits: 5 },
      mentalCalculation: { lines: 7 }
    }
  },
  {
    grade: "3級",
    minDigits: 6,
    maxDigits: 6,
    operations: {
      addition: { enabled: true },
      subtraction: { enabled: true },
      multiplication: { digits: 6 },
      division: { numeratorDigits: 12, denominatorDigits: 6 },
      mentalCalculation: { lines: 9 }
    }
  },
  {
    grade: "2級",
    minDigits: 7,
    maxDigits: 7,
    operations: {
      addition: { enabled: true },
      subtraction: { enabled: true },
      multiplication: { digits: 7 },
      division: { numeratorDigits: 14, denominatorDigits: 7 },
      mentalCalculation: { lines: 12 }
    }
  },
  {
    grade: "1級",
    minDigits: 8,
    maxDigits: 8,
    operations: {
      addition: { enabled: true },
      subtraction: { enabled: true },
      multiplication: { digits: 8 },
      division: { numeratorDigits: 16, denominatorDigits: 8 },
      mentalCalculation: { lines: 15 }
    }
  }
];

export const timeLimits: { [key: string]: number } = {
  "1級": 420, // 7 minutes for complex calculations
  "2級": 360, // 6 minutes
  "3級": 300, // 5 minutes
  "4級": 240, // 4 minutes
  "5級": 180, // 3 minutes
  "6級": 120, // 2 minutes
  "7級": 90,  // 1.5 minutes
  "8級": 90,
  "9級": 60,
  "10級": 60  // 1 minute for basic calculations
};

export const generateNewProblem = (gradeNum: number) => {
  const levelIndex = gradeNum - 1;
  const level = levels[levelIndex];
  const grade = level.grade;

  console.log(`Generating problem for grade ${grade} (levelIndex: ${levelIndex})`);
  console.log(`Level config:`, level);

  const generateOperand = (minDigits: number, maxDigits: number, forceExact?: number) => {
    const digits = forceExact || Math.floor(Math.random() * (maxDigits - minDigits + 1)) + minDigits;
    const min = Math.pow(10, digits - 1);
    const max = Math.pow(10, digits) - 1;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  let operations: Array<Problem['operator']> = [];
  if (level.operations.addition) operations.push("+");
  if (level.operations.subtraction) operations.push("-");
  if (level.operations.multiplication?.digits) operations.push("×");
  if (level.operations.division?.numeratorDigits) operations.push("÷");
  if (level.operations.mentalCalculation?.lines) operations.push("見取算");

  console.log(`Available operations:`, operations);
  const operation = operations[Math.floor(Math.random() * operations.length)] as Problem['operator'];
  let operands: number[];

  if (operation === "見取算") {
    const numLines = level.operations.mentalCalculation?.lines || 3;
    operands = Array.from({ length: numLines }, () => {
      const num = generateOperand(level.minDigits, level.maxDigits);
      return Math.random() < 0.5 ? num : -num;
    });
  } else if (operation === "×") {
    const digits = level.operations.multiplication?.digits || 2;
    operands = [
      generateOperand(digits, digits, digits),
      generateOperand(digits, digits, digits)
    ];
  } else if (operation === "÷") {
    const { numeratorDigits, denominatorDigits } = level.operations.division ||
      { numeratorDigits: 4, denominatorDigits: 2 };

    const divisor = generateOperand(denominatorDigits, denominatorDigits, denominatorDigits);
    const quotient = generateOperand(1, Math.max(1, numeratorDigits - denominatorDigits));
    const dividend = divisor * quotient;
    operands = [dividend, divisor];
  } else {
    const a = generateOperand(level.minDigits, level.maxDigits);
    let b;
    do {
      b = generateOperand(level.minDigits, level.maxDigits);
    } while (b === a);

    if (operation === "-") {
      operands = [Math.max(a, b), Math.min(a, b)];
    } else {
      operands = [a, b];
    }
  }

  return { operator: operation, operands };
};

function App() {
  const [currentLevel, setCurrentLevel] = useState<number>(10); // Start with Grade 10 (10級)
  const [rods, setRods] = useState<Rod[]>(() =>
    Array.from({ length: 8 }, (_, i) => ({
      id: `rod-${i}`,
      heavenBeads: [{ id: `heaven-${i}-0`, active: false }],
      earthBeads: Array.from({ length: 4 }, (_, j) => ({
        id: `earth-${i}-${j}`,
        active: false
      }))
    }))
  );
  const [score, setScore] = useState<Score>({
    addition: 0,
    subtraction: 0,
    multiplication: 0,
    division: 0,
    mentalCalculation: 0,
    totalProblems: {
      addition: 0,
      subtraction: 0,
      multiplication: 0,
      division: 0,
      mentalCalculation: 0
    }
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentValue, setCurrentValue] = useState(0);
  const [currentProblem, setCurrentProblem] = useState<Problem>({
    operands: [0, 0],
    operator: '+'
  });
  const [timeRemaining, setTimeRemaining] = useState(60);

  useEffect(() => {
    const problem = generateNewProblem(currentLevel);
    setCurrentProblem(problem);
    const currentGrade = levels[currentLevel - 1].grade;
    setTimeRemaining(timeLimits[currentGrade as keyof typeof timeLimits]);
  }, [currentLevel]);

  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          const newTime = prev - 1;
          if (newTime <= 0) {
            setTimeout(() => {
              const problem = generateNewProblem(currentLevel);
              setCurrentProblem(problem);
            }, 1500);
            return 0;
          }
          return newTime;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeRemaining]);

  const handleBeadClick = (rodIndex: number, isHeaven: boolean, beadIndex: number) => {
    const newRods = rods.map((rod, i) => ({
      ...rod,
      heavenBeads: rod.heavenBeads.map((bead, j) => ({
        ...bead,
        active: i === rodIndex && isHeaven && j === beadIndex ? !bead.active : bead.active
      })),
      earthBeads: rod.earthBeads.map((bead, j) => ({
        ...bead,
        active: i === rodIndex && !isHeaven && j === beadIndex ? !bead.active : bead.active
      }))
    }));

    setRods(newRods);
    updateCurrentValue(newRods);
  };

  const updateCurrentValue = (currentRods: Rod[]) => {
    let total = 0;
    currentRods.forEach((rod, i) => {
      const heavenValue = rod.heavenBeads.filter(b => b.active).length * 5;
      const earthValue = rod.earthBeads.filter(b => b.active).length;
      total += (heavenValue + earthValue) * Math.pow(10, 7 - i);
    });
    setCurrentValue(total);

    const { operands, operator } = currentProblem;
    let expectedResult = 0;

    if (operator === "+") {
      expectedResult = operands.reduce((a, b) => a + b, 0);
    } else if (operator === "-") {
      expectedResult = operands[0] - operands[1];
    } else if (operator === "×") {
      expectedResult = operands[0] * operands[1];
    } else if (operator === "÷") {
      expectedResult = Math.floor(operands[0] / operands[1]);
    } else if (operator === "見取算") {
      expectedResult = operands.reduce((a, b) => a + b, 0);
    }

    if (total === expectedResult) {
      const operationType = operator === "+" ? "addition" :
                          operator === "-" ? "subtraction" :
                          operator === "×" ? "multiplication" :
                          operator === "÷" ? "division" :
                          "mentalCalculation";

      setScore((prev: Score) => ({
        ...prev,
        [operationType]: prev[operationType] + 1,
        totalProblems: {
          ...prev.totalProblems,
          [operationType]: prev.totalProblems[operationType] + 1
        }
      }));

      if (score.totalProblems[operationType] >= 10 && currentLevel < levels.length) {
        setCurrentLevel(currentLevel + 1);
      }

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        const problem = generateNewProblem(currentLevel);
        setCurrentProblem(problem);
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">そろばん練習 - {levels[currentLevel - 1].grade}</h1>

        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {levels.map((level, index) => (
            <button
              key={level.grade}
              className={`px-4 py-2 rounded-lg ${
                currentLevel === levels.length - index
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
              onClick={() => setCurrentLevel(levels.length - index)}
            >
              {level.grade}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <div className="text-xl">
              問題: {currentProblem.operands.map((num, i) => (
                <span key={i}>
                  {i > 0 && <span className="mx-2">{currentProblem.operator}</span>}
                  {num.toLocaleString()}
                </span>
              ))}
            </div>
            <div className="text-xl">
              現在値: {currentValue.toLocaleString()}
            </div>
          </div>

          <div className="grid grid-cols-8 gap-4 mb-8">
            {rods.map((rod, rodIndex) => (
              <div key={rod.id} className="flex flex-col items-center">
                <div className="mb-2">
                  {rod.heavenBeads.map((bead, beadIndex) => (
                    <div
                      key={bead.id}
                      className={`w-8 h-4 border border-gray-400 cursor-pointer ${
                        bead.active ? 'bg-blue-500' : 'bg-white'
                      }`}
                      onClick={() => handleBeadClick(rodIndex, true, beadIndex)}
                    />
                  ))}
                </div>
                <div className="border-t-2 border-gray-400 w-full mb-2" />
                <div>
                  {rod.earthBeads.map((bead, beadIndex) => (
                    <div
                      key={bead.id}
                      className={`w-8 h-4 border border-gray-400 cursor-pointer ${
                        bead.active ? 'bg-blue-500' : 'bg-white'
                      }`}
                      onClick={() => handleBeadClick(rodIndex, false, beadIndex)}
                    />
                  ))}
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  {Math.pow(10, 7 - rodIndex).toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center">
            <div className="text-lg">
              時間: {timeRemaining}秒
            </div>
            <div className="text-lg">
              スコア: {Object.entries(score.totalProblems).map(([type, total], i) => (
                <span key={type}>
                  {i > 0 && ' | '}
                  {type}: {score[type as keyof Omit<Score, 'totalProblems'>]}/{total}
                </span>
              ))}
            </div>
          </div>
        </div>

        {showSuccess && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-8 rounded-lg shadow-xl">
              <h2 className="text-2xl font-bold mb-4">正解!</h2>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded"
                onClick={() => setShowSuccess(false)}
              >
                次へ
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
