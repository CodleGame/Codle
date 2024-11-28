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
const MAX_GUESSES_DISPLAY = 5

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
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const getMaxAttempts = () => attemptMode === 'limited' ? MAX_GUESSES : Infinity

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
        characters = '0123456789'
        newCode = []
        while (newCode.length < codeLength) {
          const char = characters[Math.floor(Math.random() * characters.length)]
          if (!newCode.includes(char)) {
            newCode.push(char)
          }
        }
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
        if (codeLength >= 6 && new Set(newCode).size === newCode.length) {
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
    setGuesses([])
    setFeedback([])
    setCurrentGuessIndex(0)
    setGameWon(false)
    setGameLost(false)
    setCurrentGuess(Array(codeLength).fill(''))
    generateSecretCode()
    inputRefs.current[0]?.focus()
  }

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

    const codeCopy = [...secretCode]
    const newFeedback = currentGuess.map((char, index) => {
      if (char.toUpperCase() === secretCode[index]) {
        codeCopy[index] = null
        return 'green'
      }
      return null
    })

    currentGuess.forEach((char, index) => {
      if (newFeedback[index] === null) {
        const secretIndex = codeCopy.findIndex(c => c === char.toUpperCase())
        if (secretIndex !== -1) {
          newFeedback[index] = 'yellow'
          codeCopy[secretIndex] = null
        } else {
          newFeedback[index] = 'gray'
        }
      }
    })

    const newGuesses = [...guesses, currentGuess]
    setGuesses(newGuesses)

    const newFeedbacks = [...feedback, newFeedback]
    setFeedback(newFeedbacks)

    setCurrentGuess(Array(codeLength).fill(''))
    setCurrentGuessIndex(currentGuessIndex + 1)
    inputRefs.current[0]?.focus()

    if (newFeedback.every(color => color === 'green')) {
      setGameWon(true)
    } else if (attemptMode === 'limited' && currentGuessIndex + 1 >= MAX_GUESSES) {
      setGameLost(true)
    }
  }

  const handleRenounce = () => {
    setGameLost(true)
  }

  const displayedGuesses = attemptMode === 'infinite' 
    ? guesses.slice(-MAX_GUESSES_DISPLAY) 
    : guesses

  const displayedFeedback = attemptMode === 'infinite'
    ? feedback.slice(-MAX_GUESSES_DISPLAY)
    : feedback

  return (
    <div className="flex flex-col lg:flex-row justify-center items-start space-y-4 lg:space-y-0 lg:space-x-4 p-4">
      <div className="w-full lg:w-[65%] bg-white rounded-lg shadow-md p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Crack the Code</h1>
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
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
                  resetGame()
                  setIsSheetOpen(false)
                }} className="w-full">
                  Apply and Start New Game
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
        
        <div className="mb-4">
          <div className={`grid gap-2 mb-2`} style={{ gridTemplateColumns: `repeat(${codeLength}, minmax(0, 1fr))` }}>
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
          <div className="flex space-x-2 mb-4">
            <Button 
              onClick={handleGuess} 
              disabled={currentGuess.some(char => char === '') || gameWon || gameLost} 
              className="flex-grow"
            >
              Guess
            </Button>
            {difficulty === 'extreme' && currentGuessIndex >= 10 && !gameWon && !gameLost && (
              <Button onClick={handleRenounce} variant="destructive" className="w-24">
                Give Up
              </Button>
            )}
          </div>
        </div>
        
        <div className="grid gap-2 max-h-[60vh] overflow-y-auto">
          {displayedGuesses.map((guess, rowIndex) => (
            <div key={rowIndex} className={`grid gap-2`} style={{ gridTemplateColumns: `repeat(${codeLength}, minmax(0, 1fr))` }}>
              {guess.map((char, colIndex) => (
                <div
                  key={colIndex}
                  className={`w-full h-12 flex items-center justify-center text-2xl font-bold rounded-md ${
                    displayedFeedback[rowIndex][colIndex] === 'green' ? 'bg-green-500 text-white' :
                    displayedFeedback[rowIndex][colIndex] === 'yellow' ? 'bg-yellow-500 text-white' :
                    displayedFeedback[rowIndex][colIndex] === 'gray' ? 'bg-gray-300 text-white' :
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
            {attemptMode === 'limited' 
              ? `Attempts remaining: ${MAX_GUESSES - currentGuessIndex}`
              : `Attempts used: ${currentGuessIndex}`
            }
          </p>
        )}
      </div>
      
      <div className="w-full lg:w-[35%]">
        <RulesPanel difficulty={difficulty} attemptMode={attemptMode} codeLength={codeLength} />
      </div>
    </div>
  )
}

export default CrackTheCode

