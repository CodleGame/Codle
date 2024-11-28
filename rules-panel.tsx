import React from 'react'

type RulesPanelProps = {
  difficulty: 'easy' | 'normal' | 'hard' | 'extreme'
  attemptMode: 'limited' | 'infinite'
  codeLength: number
}

const RulesPanel: React.FC<RulesPanelProps> = ({ difficulty, attemptMode, codeLength }) => {
  return (
    <div className="w-full bg-white rounded-lg shadow-md p-4">
      <h2 className="text-xl font-bold mb-4">How to Play</h2>
      <ul className="list-disc list-inside space-y-2 text-sm">
        <li>Guess the secret {codeLength}-character code.</li>
        <li>Enter one character per box and click "Guess" or press Enter.</li>
        <li>After each guess, you'll receive feedback:</li>
        <ul className="list-none ml-4 space-y-1">
          <li className="flex items-center">
            <span className="w-4 h-4 rounded-full bg-green-500 mr-2"></span>
            Correct character, correct position
          </li>
          <li className="flex items-center">
            <span className="w-4 h-4 rounded-full bg-yellow-500 mr-2"></span>
            Correct character, wrong position
          </li>
          <li className="flex items-center">
            <span className="w-4 h-4 rounded-full bg-gray-300 mr-2"></span>
            Character not in the code
          </li>
        </ul>
        <li>Difficulty: <strong>{difficulty}</strong></li>
        <ul className="list-none ml-4">
          {difficulty === 'easy' && <li>Numbers 0-9, no repetitions</li>}
          {difficulty === 'normal' && <li>Numbers 0-9, possible repetitions</li>}
          {difficulty === 'hard' && <li>Numbers 0-9, forced repetition if code length ≥ 6</li>}
          {difficulty === 'extreme' && (
            <>
              <li>Numbers and letters (A-Z), possible repetitions</li>
              <li>After 10 attempts, you can choose to give up or continue</li>
            </>
          )}
        </ul>
        <li>Attempt mode: <strong>{attemptMode}</strong></li>
        <ul className="list-none ml-4">
          {attemptMode === 'limited' && <li>You have 10 attempts to guess the code</li>}
          {attemptMode === 'infinite' && <li>You have unlimited attempts to guess the code</li>}
        </ul>
        <li>Click the gear icon in the top right corner to change game settings.</li>
      </ul>
    </div>
  )
}

export default RulesPanel

