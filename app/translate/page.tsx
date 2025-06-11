"use client"
import { useState, useEffect } from 'react';

export default function TextModifier() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [operation, setOperation] = useState('add');
  const [operationValue, setOperationValue] = useState(1);

  // Convert alphabet to number (a/A=1, b/B=2, ..., z/Z=26)
  const alphabetToNumber = (char: string): number | null => {
    const code = char.toLowerCase().charCodeAt(0);
    return code >= 97 && code <= 122 ? code - 96 : null;
  };

  // Convert number back to alphabet (1=a, 2=b, ..., 26=z)
  const numberToAlphabet = (num: number, isUppercase: boolean): string => {
    const clampedNum = ((num - 1) % 26) + 1; // Wrap around 1-26
    const charCode = clampedNum + 96; // 'a' is 97
    const char = String.fromCharCode(charCode);
    return isUppercase ? char.toUpperCase() : char;
  };

  // Perform the mathematical operation
  const performOperation = (value: number, operationValue: number, operation: string): number => {
    switch (operation) {
      case 'add':
        return value + operationValue;
      case 'subtract':
        return value - operationValue;
      case 'multiply':
        return value * operationValue;
      case 'divide':
        return operationValue !== 0 ? Math.round(value / operationValue) : value;
      default:
        return value;
    }
  };

  // Process the input text
  const processText = () => {
    if (!inputText.trim()) {
      setOutputText('');
      return;
    }

    const processed = inputText.split('').map(char => {
      // Check if it's a number
      if (/\d/.test(char)) {
        const num = parseInt(char);
        const result = performOperation(num, operationValue, operation);
        return Math.max(0, Math.min(9, result)).toString(); // Keep within 0-9 range
      }
      
      // Check if it's an alphabet
      if (/[a-zA-Z]/.test(char)) {
        const isUppercase = char === char.toUpperCase();
        const num = alphabetToNumber(char);
        if (num !== null) {
          const result = performOperation(num, operationValue, operation);
          const clampedResult = Math.max(1, result); // Ensure positive for alphabet conversion
          return numberToAlphabet(clampedResult, isUppercase);
        }
      }
      
      // Return unchanged for special characters, punctuation, etc.
      return char;
    }).join('');

    setOutputText(processed);
  };

  // Auto-process when inputs change
  useEffect(() => {
    processText();
  }, [inputText, operation, operationValue]);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        Text Number & Alphabet Modifier
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Controls */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Operation
            </label>
            <select
              value={operation}
              onChange={(e) => setOperation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="add">Add</option>
              <option value="subtract">Subtract</option>
              <option value="multiply">Multiply</option>
              <option value="divide">Divide</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Value
            </label>
            <input
              type="number"
              value={operationValue}
              onChange={(e) => setOperationValue(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter value"
            />
          </div>
          
          <button
            onClick={processText}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Process Text
          </button>
        </div>

        {/* Info Panel */}
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="font-semibold text-gray-800 mb-2">How it works:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Numbers (0-9) are modified mathematically</li>
            <li>• Letters are converted: A/a=1, B/b=2, ..., Z/z=26</li>
            <li>• Operations are applied to these values</li>
            <li>• Results are converted back to letters (wrapping A-Z)</li>
            <li>• Special characters remain unchanged</li>
          </ul>
          
          <div className="mt-3 text-sm">
            <strong>Current operation:</strong> {operation} by {operationValue}
          </div>
        </div>
      </div>

      {/* Text Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Input Text
          </label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full h-40 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Enter your text here... Numbers and letters will be modified, special characters will remain unchanged."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Output Text
          </label>
          <textarea
            value={outputText}
            readOnly
            className="w-full h-40 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 resize-none"
            placeholder="Processed text will appear here..."
          />
        </div>
      </div>
      
      {/* Example */}
      <div className="mt-6 p-4 bg-blue-50 rounded-md">
        <h3 className="font-semibold text-blue-800 mb-2">Example:</h3>
        <p className="text-sm text-blue-700">
          Input: "Hello123 World!" with Add operation by 1<br/>
          Output: "Ifmmp234 Xpsme!" (H→I, e→f, l→m, etc., 1→2, 2→3, 3→4)
        </p>
      </div>
    </div>
  );
}