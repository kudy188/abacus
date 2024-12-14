import { useState, useEffect } from "react";

interface Problem {
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

interface Level {
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

interface Score {
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

function App() {
  const levels: Level[] = [
    {
      grade: "10級",
      minDigits: 2,
      maxDigits: 4,
      operations: {
        addition: { enabled: true },
        subtraction: { enabled: true },
        multiplication: { digits: 2 },
        division: { numeratorDigits: 4, denominatorDigits: 2 },
        mentalCalculation: { lines: 3 }
      }
    },
    {
      grade: "9級",
      minDigits: 2,
      maxDigits: 4,
      operations: {
        addition: { enabled: true },
        subtraction: { enabled: true },
        multiplication: { digits: 2 },
        division: { numeratorDigits: 4, denominatorDigits: 2 },
        mentalCalculation: { lines: 3 }
      }
    },
    {
      grade: "8級",
      minDigits: 2,
      maxDigits: 4,
      operations: {
        addition: { enabled: true },
        subtraction: { enabled: true },
        multiplication: { digits: 3 },
        division: { numeratorDigits: 5, denominatorDigits: 2 },
        mentalCalculation: { lines: 3 }
      }
    },
    {
      grade: "7級",
      minDigits: 2,
      maxDigits: 4,
      operations: {
        addition: { enabled: true },
        subtraction: { enabled: true },
        multiplication: { digits: 3 },
        division: { numeratorDigits: 6, denominatorDigits: 3 },
        mentalCalculation: { lines: 3 }
      }
    },
    {
      grade: "6級",
      minDigits: 3,
      maxDigits: 5,
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
      minDigits: 3,
      maxDigits: 6,
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
      minDigits: 4,
      maxDigits: 7,
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
      minDigits: 5,
      maxDigits: 8,
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
      minDigits: 6,
      maxDigits: 9,
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
      minDigits: 7,
      maxDigits: 10,
      operations: {
        addition: { enabled: true },
        subtraction: { enabled: true },
        multiplication: { digits: 8 },
        division: { numeratorDigits: 16, denominatorDigits: 8 },
        mentalCalculation: { lines: 15 }
      }
    }
  ];

  const [currentLevel, setCurrentLevel] = useState<number>(1);
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

  // Time limits for each grade (in seconds)
  const timeLimits = {
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

  useEffect(() => {
    generateNewProblem();
    const currentGrade = levels[currentLevel - 1].grade;
    setTimeRemaining(timeLimits[currentGrade as keyof typeof timeLimits]);
  }, [currentLevel]);

  // Add time limit enforcement
  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          const newTime = prev - 1;
          if (newTime <= 0) {
            setTimeout(() => {
              generateNewProblem();
            }, 1500);
            return 0;
          }
          return newTime;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeRemaining]);

  const generateNewProblem = () => {
    const level = levels[currentLevel - 1];
    const grade = level.grade as keyof typeof timeLimits;

    // Debug logging for problem generation
    console.log(`Generating problem for grade: ${grade}`);

    // Generate a random number with specified number of digits
    const generateOperand = (minDigits: number, maxDigits: number) => {
      const digits = Math.floor(Math.random() * (maxDigits - minDigits + 1)) + minDigits;
      const min = Math.pow(10, digits - 1);
      const max = Math.pow(10, digits) - 1;
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    // Select operation based on grade
    const operations: Array<Problem['operator']> = grade === "1級" || grade === "2級"
      ? ["見取算", "+", "-", "×", "÷"]
      : grade === "3級" || grade === "4級"
      ? ["+", "-", "×", "÷"]
      : ["+", "-", "×"];

    const operation = operations[Math.floor(Math.random() * operations.length)] as Problem['operator'];

    let operands: number[];
    if (operation === "見取算") {
      const numLines = level.operations.mentalCalculation?.lines || 3;
      const signs = Array.from({ length: numLines }, () => Math.random() < 0.5 ? 1 : -1);
      operands = Array.from({ length: numLines }, (_, i) => {
        const num = generateOperand(level.minDigits, Math.min(level.maxDigits, 8));
        console.log(`Mental calc line ${i + 1}/${numLines}: ${signs[i] > 0 ? '+' : '-'}${num}`);
        return num * signs[i];
      });
    } else if (operation === "×") {
      const digits = level.operations.multiplication?.digits || level.minDigits;
      const a = generateOperand(digits, digits);
      const b = generateOperand(digits, digits);
      console.log(`Multiplication: ${a} × ${b} (${a.toString().length}×${b.toString().length} digits)`);
      operands = [a, b];
    } else if (operation === "÷") {
      const { numeratorDigits, denominatorDigits } = level.operations.division ||
        { numeratorDigits: level.minDigits * 2, denominatorDigits: level.minDigits };

      const divisor = generateOperand(denominatorDigits, denominatorDigits);
      const quotientDigits = numeratorDigits - denominatorDigits;
      const quotient = generateOperand(
        Math.max(1, quotientDigits),
        Math.max(2, quotientDigits)
      );
      const dividend = divisor * quotient;
      console.log(`Division: ${dividend} ÷ ${divisor} (${dividend.toString().length}÷${divisor.toString().length} digits)`);
      operands = [dividend, divisor];
    } else {
      const a = generateOperand(level.minDigits, level.maxDigits);
      const b = generateOperand(level.minDigits, level.maxDigits);

      if (operation === "-") {
        const aStr = Math.max(a, b).toString();
        const bStr = Math.min(a, b).toString();
        let needsBorrowing = false;

        for (let i = 0; i < Math.min(aStr.length, bStr.length); i++) {
          const digitA = parseInt(aStr[aStr.length - 1 - i]);
          const digitB = parseInt(bStr[bStr.length - 1 - i]);
          if (digitA < digitB) {
            needsBorrowing = true;
            break;
          }
        }

        if (!needsBorrowing) {
          const newB = parseInt(bStr.slice(0, -1) + '9');
          operands = [Math.max(a, newB), Math.min(a, newB)];
        } else {
          operands = [Math.max(a, b), Math.min(a, b)];
        }
        console.log(`Subtraction: ${operands[0]} - ${operands[1]} (requires borrowing: ${needsBorrowing})`);
      } else {
        const aStr = a.toString();
        const bStr = b.toString();
        let hasCarry = false;

        for (let i = 0; i < Math.min(aStr.length, bStr.length); i++) {
          const digitA = parseInt(aStr[aStr.length - 1 - i]);
          const digitB = parseInt(bStr[bStr.length - 1 - i]);
          if (digitA + digitB >= 10) {
            hasCarry = true;
            break;
          }
        }

        if (!hasCarry) {
          const newA = parseInt(aStr.slice(0, -1) + '9');
          const newB = parseInt(bStr.slice(0, -1) + '9');
          operands = [newA, newB];
        } else {
          operands = [a, b];
        }
        console.log(`Addition: ${operands[0]} + ${operands[1]} (requires carrying: ${hasCarry})`);
      }
    }

    setCurrentProblem({
      operator: operation,
      operands
    });

    const newRods = Array.from({ length: 8 }, (_, i) => ({
      id: `rod-${i}`,
      heavenBeads: Array.from({ length: 1 }, (_, j) => ({ id: `heaven-${i}-${j}`, active: false })),
      earthBeads: Array.from({ length: 4 }, (_, j) => ({ id: `earth-${i}-${j}`, active: false }))
    }));

    setRods(newRods);
    setCurrentValue(0);
    const currentGrade = levels[currentLevel - 1].grade;
    setTimeRemaining(timeLimits[currentGrade as keyof typeof timeLimits]);
  };

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

    // Check if the answer is correct
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

      setScore(prev => ({
        ...prev,
        [operationType]: (prev[operationType] || 0) + 1,
        totalProblems: {
          ...prev.totalProblems,
          [operationType]: (prev.totalProblems[operationType] || 0) + 1
        }
      }));

      // Check if user should advance to next level
      if (score.totalProblems[operationType] >= 10 && currentLevel < levels.length) {
        setCurrentLevel(currentLevel + 1);
      }

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        generateNewProblem();
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">そろばん練習 - {levels[currentLevel - 1].grade}</h1>

        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {levels.reverse().map((level, index) => (
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
