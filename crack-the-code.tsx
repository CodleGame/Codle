"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Cog6ToothIcon } from '@heroicons/react/24/solid'
import RulesPanel from './rules-panel'

type Difficulty = 'easy' | 'normal' | 'hard' | 'extreme'
type AttemptMode = 'limited' | 'infinite'

const MAX_GUESSES = 10

const CrackTheCode: React.FC = () => {
  const [codeLength, setCodeLength] = useState<number>(4)
  const [secretCode, setSecretCode] = useState<string[]>([])
  const [currentGuess, setCurrentGuess] = useState<string[]>(Array(codeLength).fill(''))
  const [guesses, setGuesses] = useState<string[][]>([])
  const [feedback, setFeedback] = useState<string[][]>([])
  const [currentGuessIndex, setCurrentGuessIndex] = useState<number>(0)
  const [gameWon, setGameWon] = useState<boolean>(false)
  const [gameLost, setGameLost] = useState<boolean>(false)
  const [difficulty, setDifficulty] = useState<Difficulty>('normal')
  const [attemptMode, setAttemptMode] = useState<AttemptMode>('limited')
  const [isSheetOpen, setIsSheetOpen] = useState(false); // Added state for Sheet
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const getMaxAttempts = () => attemptMode === 'limited' ? codeLength : MAX_GUESSES

  useEffect(() => {
    generateSecretCode()
    resetGame()
  }, [codeLength, difficulty, attemptMode])

  useEffect(() => {
    setCurrentGuess(Array(codeLength).fill(''))
    inputRefs.current = inputRefs.current.slice(0, codeLength)
  }, [codeLength])

  const generateSecretCode = () => {
    let characters: string
    let newCode: string[]

    switch (difficulty) {
      case 'easy':
        characters = '123456789'
        newCode = Array.from({ length: codeLength }, (_, index) => 
          characters[Math.floor(Math.random() * (characters.length - index))]
        )
        break
      case 'normal':
        characters = '0123456789'
        newCode = Array.from({ length: codeLength }, () => 
          characters[Math.floor(Math.random() * characters.length)]
        )
        break
      case 'hard':
        characters = '0123456789'
        newCode = Array.from({ length: codeLength }, () => 
          characters[Math.floor(Math.random() * characters.length)]
        )
        // Ensure at least one repeated number
        if (new Set(newCode).size === newCode.length) {
          const indexToRepeat = Math.floor(Math.random() * codeLength)
          newCode[indexToRepeat] = newCode[(indexToRepeat + 1) % codeLength]
        }
        break
      case 'extreme':
        characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
        newCode = Array.from({ length: codeLength }, () => 
          characters[Math.floor(Math.random() * characters.length)]
        )
        break
    }

    setSecretCode(newCode)
  }

  const resetGame = () => {
    const maxAttempts = getMaxAttempts();
    setGuesses(Array(maxAttempts).fill(Array(codeLength).fill('')));
    setFeedback(Array(maxAttempts).fill(Array(codeLength).fill('')));
    setCurrentGuessIndex(0);
    setGameWon(false);
    setGameLost(false);
    setCurrentGuess(Array(codeLength).fill(''));
    generateSecretCode();
    inputRefs.current[0]?.focus();
  };

  const handleInputChange = (index: number, value: string) => {
    const newGuess = [...currentGuess]
    newGuess[index] = value.toUpperCase()
    setCurrentGuess(newGuess)

    if (value && index < codeLength - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !currentGuess[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'Enter' && !currentGuess.includes('')) {
      handleGuess()
    }
  }

  const handleGuess = () => {
    if (currentGuess.some(char => char === '')) return

    const newFeedback = currentGuess.map((char, index) => {
      if (char.toUpperCase() === secretCode[index]) return 'green'
      if (secretCode.includes(char.toUpperCase())) return 'yellow'
      return 'gray'
    })

    const newGuesses = [...guesses]
    newGuesses[currentGuessIndex] = currentGuess
    setGuesses(newGuesses)

    const newFeedbacks = [...feedback]
    newFeedbacks[currentGuessIndex] = newFeedback
    setFeedback(newFeedbacks)

    setCurrentGuess(Array(codeLength).fill(''))
    setCurrentGuessIndex(currentGuessIndex + 1)
    inputRefs.current[0]?.focus()

    if (newFeedback.every(color => color === 'green')) {
      setGameWon(true)
    } else if (currentGuessIndex + 1 >= getMaxAttempts()) {
      setGameLost(true)
    }
  }

  return (
    <div className="flex flex-col md:flex-row justify-center items-start space-y-4 md:space-y-0 md:space-x-4 p-4">
      <div className="w-full md:w-96 bg-white rounded-lg shadow-md p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Crack the Code</h1>
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}> {/* Updated Sheet component */}
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Cog6ToothIcon className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Game Options</SheetTitle>
                <SheetDescription>
                  Adjust the game settings here. Changes will apply to the next game.
                </SheetDescription>
              </SheetHeader>
              <div className="py-4">
                <Label htmlFor="codeLength" className="block mb-2">Number of characters:</Label>
                <Input
                  id="codeLength"
                  type="number"
                  min="3"
                  max="10"
                  value={codeLength}
                  onChange={(e) => setCodeLength(Math.max(3, Math.min(10, Number(e.target.value))))}
                  className="mb-4"
                />
                
                <Label htmlFor="difficulty" className="block mb-2">Difficulty:</Label>
                <Select onValueChange={(value: Difficulty) => setDifficulty(value)} defaultValue={difficulty}>
                  <SelectTrigger className="w-full mb-4">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                    <SelectItem value="extreme">Extreme</SelectItem>
                  </SelectContent>
                </Select>

                <Label className="block mb-2">Attempt Mode:</Label>
                <RadioGroup
                  defaultValue={attemptMode}
                  onValueChange={(value: AttemptMode) => setAttemptMode(value)}
                  className="flex space-x-4 mb-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="limited" id="limited" />
                    <Label htmlFor="limited">Limited</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="infinite" id="infinite" />
                    <Label htmlFor="infinite">Infinite</Label>
                  </div>
                </RadioGroup>
                
                <Button onClick={() => {
                  resetGame();
                  setIsSheetOpen(false); // Updated onClick handler
                }} className="w-full">
                  Apply and Start New Game
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
        
        <div className="mb-4">
          <div className="grid grid-cols-4 gap-2 mb-2">
            {currentGuess.map((char, index) => (
              <Input
                key={index}
                type="text"
                value={char}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                maxLength={1}
                className="w-full h-12 text-center text-2xl font-bold"
                disabled={gameWon || gameLost}
                ref={el => inputRefs.current[index] = el}
              />
            ))}
          </div>
          <Button onClick={handleGuess} disabled={currentGuess.some(char => char === '') || gameWon || gameLost} className="w-full">
            Guess
          </Button>
        </div>
        
        <div className="grid gap-2" style={{ gridTemplateRows: `repeat(${getMaxAttempts()}, minmax(0, 1fr))` }}>
          {guesses.map((guess, rowIndex) => (
            <div key={rowIndex} className="grid grid-cols-4 gap-2">
              {guess.map((char, colIndex) => (
                <div
                  key={colIndex}
                  className={`w-full h-12 flex items-center justify-center text-2xl font-bold rounded-md ${
                    feedback[rowIndex][colIndex] === 'green' ? 'bg-green-500 text-white' :
                    feedback[rowIndex][colIndex] === 'yellow' ? 'bg-yellow-500 text-white' :
                    feedback[rowIndex][colIndex] === 'gray' ? 'bg-gray-300 text-white' :
                    'bg-gray-100'
                  }`}
                >
                  {char}
                </div>
              ))}
            </div>
          ))}
        </div>
        
        {gameWon && (
          <div className="mt-4 text-center">
            <p className="text-xl font-bold text-green-600">Congratulations! You cracked the code!</p>
            <Button onClick={resetGame} className="mt-2">
              Play Again
            </Button>
          </div>
        )}

        {gameLost && (
          <div className="mt-4 text-center">
            <p className="text-xl font-bold text-red-600">Game Over! You've run out of attempts.</p>
            <p className="mt-2">The correct code was: {secretCode.join('')}</p>
            <Button onClick={resetGame} className="mt-2">
              Play Again
            </Button>
          </div>
        )}

        {!gameWon && !gameLost && (
          <p className="mt-2 text-center">
            Attempts remaining: {getMaxAttempts() - currentGuessIndex}
          </p>
        )}
      </div>
      
      <RulesPanel difficulty={difficulty} attemptMode={attemptMode} codeLength={codeLength} />
    </div>
  )
}

export default CrackTheCode

