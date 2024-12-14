import { useState, useEffect } from 'react'
import { Trophy } from "lucide-react"

interface Problem {
  operator: "+" | "-" | "×" | "÷" | "見取算";
  operands: number[];
  timeStarted: number;
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
  description: string;
}

interface Score {
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
    { grade: "10級", description: "2-4桁の基本計算" },
    { grade: "9級", description: "2-4桁の基本計算" },
    { grade: "8級", description: "2-4桁の基本計算" },
    { grade: "7級", description: "2-4桁の基本計算" },
    { grade: "6級", description: "3桁×3桁, 6桁÷3桁, 見取算3行" },
    { grade: "5級", description: "4桁×4桁, 8桁÷4桁, 見取算5行" },
    { grade: "4級", description: "5桁×5桁, 10桁÷5桁, 見取算7行" },
    { grade: "3級", description: "6桁×6桁, 12桁÷6桁, 見取算9行" },
    { grade: "2級", description: "7桁×7桁, 14桁÷7桁, 見取算12行" },
    { grade: "1級", description: "8桁×8桁, 16桁÷8桁, 見取算15行" },
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
    operands: [0],
    operator: '+',
    timeStarted: Date.now()
  });
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [activeBead, setActiveBead] = useState<{
    rodIndex: number;
    isHeaven: boolean;
    beadIndex: number;
  } | null>(null);
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  const [timeExpired, setTimeExpired] = useState(false);

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
    setShowTimeWarning(false);
    setTimeExpired(false);
  }, [currentLevel]);

  // Add time limit enforcement
  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          const newTime = prev - 1;
          if (newTime <= 0) {
            setTimeExpired(true);
            setTimeout(() => {
              setTimeExpired(false);
              generateNewProblem();
            }, 1500);
            return 0;
          }
          setShowTimeWarning(newTime <= 10);
          return newTime;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeRemaining]);

  const generateNewProblem = () => {
    const level = levels[currentLevel - 1];
    const grade = level.grade as keyof typeof timeLimits;

    // Determine digit limits based on grade
    const getDigitLimits = (grade: string) => {
      if (grade === "1級") return { min: 8, max: 16 };
      if (grade === "2級") return { min: 7, max: 14 };
      if (grade === "3級") return { min: 6, max: 12 };
      if (grade === "4級") return { min: 5, max: 10 };
      if (grade === "5級") return { min: 4, max: 8 };
      if (grade === "6級") return { min: 3, max: 6 };
      return { min: 2, max: 4 }; // 7級-10級
    };

    const digitLimits = getDigitLimits(grade);

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
      // Generate mental calculation problem with multiple operands
      const numLines = grade === "1級" ? 15
        : grade === "2級" ? 12
        : grade === "3級" ? 9
        : grade === "4級" ? 7
        : grade === "5級" ? 5
        : 3;

      operands = Array.from({ length: numLines }, () =>
        generateOperand(digitLimits.min, Math.min(digitLimits.max, 8))
      );
    } else if (operation === "×") {
      // Multiplication: both operands same size
      const a = generateOperand(digitLimits.min, Math.min(digitLimits.max, 8));
      const b = generateOperand(digitLimits.min, Math.min(digitLimits.max, 8));
      operands = [a, b];
    } else if (operation === "÷") {
      // Division: result should be whole number
      const b = generateOperand(digitLimits.min, Math.min(digitLimits.max, 8));
      const result = generateOperand(1, 3); // Small result for realistic division
      const a = b * result;
      operands = [a, b];
    } else {
      // Addition/Subtraction
      const a = generateOperand(digitLimits.min, digitLimits.max);
      const b = generateOperand(digitLimits.min, digitLimits.max);
      operands = operation === "-" ? [Math.max(a, b), Math.min(a, b)] : [a, b];
    }

    setCurrentProblem({
      operator: operation,
      operands,
      timeStarted: Date.now()
    });

    // Reset rods and current value
    const newRods = Array.from({ length: 8 }, (_, i) => ({
      id: `rod-${i}`,
      heavenBeads: Array.from({ length: 1 }, (_, j) => ({ id: `heaven-${i}-${j}`, active: false })),
      earthBeads: Array.from({ length: 4 }, (_, j) => ({ id: `earth-${i}-${j}`, active: false }))
    }));

    setRods(newRods);
    setCurrentValue(0);
    // Set time limit based on current grade
    const currentGrade = levels[currentLevel - 1].grade;
    setTimeRemaining(timeLimits[currentGrade as keyof typeof timeLimits]);
  };

  const handleBeadMouseDown = (rodIndex: number, isHeaven: boolean, beadIndex: number) => {
    if (activeBead) return; // Only allow one bead movement at a time
    setActiveBead({ rodIndex, isHeaven, beadIndex });
    const rod = rods[rodIndex];
    moveBead(rod.id, isHeaven ? rod.heavenBeads[beadIndex].id : rod.earthBeads[beadIndex].id, isHeaven);
  };

  const handleBeadMouseMove = (e: React.MouseEvent, rodIndex: number, isHeaven: boolean, beadIndex: number) => {
    if (!activeBead) return;
    e.preventDefault();
    const { rodIndex: activeRodIndex, isHeaven: activeIsHeaven } = activeBead;

    // Only allow movement within the same rod
    if (rodIndex === activeRodIndex && isHeaven === activeIsHeaven) {
      const rod = rods[rodIndex];
      const beads = isHeaven ? rod.heavenBeads : rod.earthBeads;
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      const mouseY = e.clientY - rect.top;
      const totalHeight = rect.height * beads.length;
      const relativeY = (mouseY / totalHeight) * beads.length;

      // Calculate which bead should be activated based on mouse position
      const newBeadIndex = Math.floor(relativeY);

      // Ensure the bead index is within bounds
      if (newBeadIndex !== beadIndex && newBeadIndex >= 0 && newBeadIndex < beads.length) {
        moveBead(rod.id, beads[newBeadIndex].id, isHeaven);
        setActiveBead({ rodIndex, isHeaven, beadIndex: newBeadIndex });
      }
    }
  };

  const handleBeadMouseUp = () => {
    setActiveBead(null);
  };

  const moveBead = (rodId: string, beadId: string, isHeaven: boolean) => {
    const newRods = rods.map(rod => {
      if (rod.id === rodId) {
        return {
          ...rod,
          heavenBeads: isHeaven
            ? rod.heavenBeads.map(bead => ({
                ...bead,
                active: bead.id === beadId ? !bead.active : bead.active
              }))
            : rod.heavenBeads,
          earthBeads: !isHeaven
            ? rod.earthBeads.map(bead => ({
                ...bead,
                active: bead.id === beadId ? !bead.active : bead.active
              }))
            : rod.earthBeads
        };
      }
      return rod;
    });

    setRods(newRods);

    // Calculate total value across all rods
    const total = newRods.reduce((acc, rod, index) => {
      const multiplier = Math.pow(10, rods.length - index - 1);
      const heavenValue = rod.heavenBeads.reduce((sum, bead) =>
        sum + (bead.active ? 5 : 0), 0);
      const earthValue = rod.earthBeads.reduce((sum, bead) =>
        sum + (bead.active ? 1 : 0), 0);
      return acc + ((heavenValue + earthValue) * multiplier);
    }, 0);

    setCurrentValue(total);

    // Calculate expected result based on operation type
    const { operator, operands } = currentProblem;
    let expectedResult: number;

    if (operator === "見取算") {
      // Mental calculation (sequential addition/subtraction)
      expectedResult = operands.reduce((acc, curr, index) => {
        if (index === 0) return curr;
        return acc + curr; // All numbers are added in mental calculation
      }, 0);
    } else {
      const [a, b] = operands;
      expectedResult = operator === "+" ? a + b :
                      operator === "-" ? a - b :
                      operator === "×" ? a * b :
                      Math.floor(a / b); // Division
    }

    // Check if answer is correct
    if (total === expectedResult) {
      const operationType = operator === "+" ? "addition" :
                            operator === "-" ? "subtraction" :
                            operator === "×" ? "multiplication" :
                            operator === "÷" ? "division" :
                            "mentalCalculation";

      setScore(prev => ({
        ...prev,
        totalProblems: {
          ...prev.totalProblems,
          [operationType]: prev.totalProblems[operationType] + 1
        }
      }));

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        generateNewProblem();
      }, 1000);
    }
  };

  return (
    <div className="container mx-auto p-4 min-h-screen bg-gray-50">
      <div className="space-y-4">
        {/* Level and Score Display */}
        <div className="flex justify-between items-center p-4 bg-white rounded-lg shadow-sm">
          <div className="text-2xl font-bold">レベル: <span className="text-purple-600">{levels[currentLevel - 1].grade}</span></div>
          <div className="flex items-center gap-2">
            <Trophy className="text-yellow-500 h-8 w-8" />
            <span className="text-2xl font-bold">{score.totalProblems[currentProblem.operator === "見取算" ? "mentalCalculation" :
              currentProblem.operator === "+" ? "addition" :
              currentProblem.operator === "-" ? "subtraction" :
              currentProblem.operator === "×" ? "multiplication" :
              "division"]}</span>
          </div>
        </div>

        {/* Problem Display */}
        <div className="p-4 bg-white rounded-lg shadow-sm">
          <div className="text-2xl font-bold mb-4">
            問題: <span className="text-blue-600">
              {currentProblem.operator === "見取算" ? (
                <div className="space-y-2">
                  {currentProblem.operands.map((operand, index) => (
                    <div key={index}>
                      {index === 0 ? "" : index === 1 ? "-" : "+"} {operand.toLocaleString()}
                    </div>
                  ))}
                  <div className="border-t-2 border-blue-600">= ?</div>
                </div>
              ) : (
                <>
                  {currentProblem.operands[0].toLocaleString()} {currentProblem.operator} {currentProblem.operands[1].toLocaleString()} = ?
                </>
              )}
            </span>
          </div>
          <div className="text-xl">
            現在の値: <span className="text-green-600">{currentValue.toLocaleString()}</span>
          </div>
          <div className={`text-xl ${showTimeWarning ? 'text-red-600 animate-pulse font-bold' : 'text-gray-600'}`}>
            残り時間: {timeRemaining}秒
          </div>
          {timeExpired && (
            <div className="text-center text-3xl text-red-600 font-bold mb-6 animate-bounce bg-red-50 py-4 rounded-lg">
              時間切れ!
            </div>
          )}
        </div>

        {/* Soroban Display */}
        <div className="p-4 bg-white rounded-lg shadow-sm">
          <div className="grid grid-cols-8 gap-4">
            {rods.map((rod, rodIndex) => (
              <div key={rod.id} className="flex flex-col items-center">
                <div className="text-sm text-gray-500">
                  {Math.pow(10, 7 - rodIndex).toLocaleString()}
                </div>
                {/* Heaven Beads */}
                <div className="relative h-8">
                  {rod.heavenBeads.map((bead, beadIndex) => (
                    <div
                      key={bead.id}
                      className={`absolute w-14 h-7 rounded-full cursor-grab active:cursor-grabbing transition-transform duration-150 ease-in-out
                        ${bead.active ? 'bg-blue-500 shadow-lg -translate-y-3' : 'bg-amber-600 hover:bg-amber-500'}
                        ${activeBead?.rodIndex === rodIndex && activeBead?.isHeaven ? 'z-10' : 'z-0'}`}
                      style={{
                        top: `${beadIndex * 28}px`,
                      }}
                      onMouseDown={() => handleBeadMouseDown(rodIndex, true, beadIndex)}
                      onMouseMove={(e) => handleBeadMouseMove(e, rodIndex, true, beadIndex)}
                      onMouseUp={() => handleBeadMouseUp()}
                      onMouseLeave={() => handleBeadMouseUp()}
                    />
                  ))}
                </div>
                {/* Separator Bar */}
                <div className="w-full h-1 bg-amber-800 my-2" />
                {/* Earth Beads */}
                <div className="relative h-32">
                  {rod.earthBeads.map((bead, beadIndex) => (
                    <div
                      key={bead.id}
                      className={`absolute w-14 h-7 rounded-full cursor-grab active:cursor-grabbing transition-transform duration-150 ease-in-out
                        ${bead.active ? 'bg-blue-500 shadow-lg translate-y-3' : 'bg-amber-600 hover:bg-amber-500'}
                        ${activeBead?.rodIndex === rodIndex && !activeBead?.isHeaven ? 'z-10' : 'z-0'}`}
                      style={{
                        top: `${beadIndex * 28}px`,
                      }}
                      onMouseDown={() => handleBeadMouseDown(rodIndex, false, beadIndex)}
                      onMouseMove={(e) => handleBeadMouseMove(e, rodIndex, false, beadIndex)}
                      onMouseUp={() => handleBeadMouseUp()}
                      onMouseLeave={() => handleBeadMouseUp()}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {showSuccess && (
          <div className="text-center text-3xl text-green-600 font-bold mb-6 animate-bounce bg-green-50 py-4 rounded-lg">
            すごい! 正解です!
          </div>
        )}

        <button
          className="w-full text-xl py-8 bg-blue-600 hover:bg-blue-700 transition-colors"
          onClick={generateNewProblem}
        >
          新しい問題
        </button>
      </div>
    </div>
  );
}

export default App;
