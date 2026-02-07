export const mathematicsQuestions = [
    {
      id: 1,
      question: "If 2x + 3y = 12 and x - y = 1, find the value of x + y.",
      options: [
        "3",
        "4",
        "5",
        "6"
      ],
      correctAnswer: 2,
      marks: 2,
      explanation: "Solving the simultaneous equations: From x - y = 1, x = y + 1. Substituting into first equation: 2(y+1) + 3y = 12 => 5y + 2 = 12 => y = 2. Then x = 3. So x + y = 5.",
      difficulty: "medium",
      topic: "Simultaneous Equations"
    },
    {
      id: 2,
      question: "A bag contains 5 red, 4 blue and 3 green balls. What is the probability of picking a blue ball?",
      options: [
        "1/3",
        "1/4",
        "1/5",
        "1/6"
      ],
      correctAnswer: 0,
      marks: 2,
      explanation: "Total balls = 5 + 4 + 3 = 12. Blue balls = 4. Probability = 4/12 = 1/3.",
      difficulty: "easy",
      topic: "Probability"
    },
    {
      id: 3,
      question: "The sum of the interior angles of a regular polygon is 1440°. How many sides does it have?",
      options: [
        "8",
        "10",
        "12",
        "14"
      ],
      correctAnswer: 1,
      marks: 3,
      explanation: "Sum of interior angles = (n-2) × 180° = 1440°. n-2 = 1440/180 = 8. n = 10 sides.",
      difficulty: "medium",
      topic: "Geometry"
    },
    {
      id: 4,
      question: "Simplify: √(50) + √(18) - √(8)",
      options: [
        "5√2",
        "6√2",
        "7√2",
        "8√2"
      ],
      correctAnswer: 1,
      marks: 2,
      explanation: "√50 = 5√2, √18 = 3√2, √8 = 2√2. So 5√2 + 3√2 - 2√2 = 6√2.",
      difficulty: "easy",
      topic: "Surds"
    },
    {
      id: 5,
      question: "If log₂(x) + log₂(x-6) = 4, find x.",
      options: [
        "8",
        "10",
        "12",
        "14"
      ],
      correctAnswer: 0,
      marks: 3,
      explanation: "log₂(x(x-6)) = 4 => x(x-6) = 2⁴ = 16 => x² - 6x - 16 = 0 => (x-8)(x+2) = 0 => x = 8 (since x>0).",
      difficulty: "hard",
      topic: "Logarithms"
    },
    {
      id: 6,
      question: "Find the derivative of y = 3x⁴ - 2x³ + 5x - 7",
      options: [
        "12x³ - 6x² + 5",
        "12x³ - 6x² - 5",
        "12x³ + 6x² + 5",
        "12x³ - 6x² + 5x"
      ],
      correctAnswer: 0,
      marks: 2,
      explanation: "dy/dx = d/dx(3x⁴) - d/dx(2x³) + d/dx(5x) - d/dx(7) = 12x³ - 6x² + 5",
      difficulty: "medium",
      topic: "Calculus"
    },
    {
      id: 7,
      question: "In a circle of radius 7cm, find the area of a sector with angle 60°.",
      options: [
        "25.67 cm²",
        "51.33 cm²",
        "77.00 cm²",
        "154.00 cm²"
      ],
      correctAnswer: 0,
      marks: 2,
      explanation: "Area of sector = (θ/360) × πr² = (60/360) × (22/7) × 49 = (1/6) × 154 = 25.67 cm²",
      difficulty: "medium",
      topic: "Circle Geometry"
    },
    {
      id: 8,
      question: "Solve the quadratic equation: 2x² - 5x - 3 = 0",
      options: [
        "x = 3 or x = -0.5",
        "x = -3 or x = 0.5",
        "x = 3 or x = 0.5",
        "x = -3 or x = -0.5"
      ],
      correctAnswer: 0,
      marks: 2,
      explanation: "Using quadratic formula: x = [5 ± √(25 + 24)]/4 = [5 ± 7]/4 = 3 or -0.5",
      difficulty: "easy",
      topic: "Quadratic Equations"
    },
    {
      id: 9,
      question: "If sin θ = 3/5 and θ is acute, find tan θ.",
      options: [
        "3/4",
        "4/3",
        "4/5",
        "5/4"
      ],
      correctAnswer: 0,
      marks: 2,
      explanation: "sin θ = opposite/hypotenuse = 3/5. Using Pythagoras, adjacent = √(5² - 3²) = 4. tan θ = opposite/adjacent = 3/4.",
      difficulty: "medium",
      topic: "Trigonometry"
    },
    {
      id: 10,
      question: "The mean of 5 numbers is 12. If four of them are 8, 10, 14, and 16, find the fifth number.",
      options: [
        "12",
        "13",
        "14",
        "15"
      ],
      correctAnswer: 0,
      marks: 2,
      explanation: "Total of 5 numbers = 5 × 12 = 60. Sum of given 4 = 8+10+14+16 = 48. Fifth number = 60-48 = 12.",
      difficulty: "easy",
      topic: "Statistics"
    }
  ];