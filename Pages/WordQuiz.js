import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Lightbulb, Check, X, Volume2, Trophy, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";

export default function WordQuiz() {
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const listId = urlParams.get("listId");

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState({ correct: 0, incorrect: 0 });
  const [quizComplete, setQuizComplete] = useState(false);
  const [shuffledWords, setShuffledWords] = useState([]);
  const [user, setUser] = useState(null);
  const [optionsMap, setOptionsMap] = useState({});

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: wordList, isLoading } = useQuery({
    queryKey: ['word-list', listId],
    queryFn: async () => {
      const lists = await base44.entities.WordList.filter({ id: listId });
      return lists[0];
    },
    enabled: !!listId
  });

  const { data: progress } = useQuery({
    queryKey: ['word-progress', listId],
    queryFn: () => base44.entities.UserWordProgress.filter({ word_list_id: listId }),
    initialData: [],
    enabled: !!listId
  });

  useEffect(() => {
    if (wordList?.words) {
      const shuffled = [...wordList.words].sort(() => Math.random() - 0.5);
      setShuffledWords(shuffled);
      
      // Pre-generate options for all words
      const newOptionsMap = {};
      shuffled.forEach((word, index) => {
        const correctAnswer = word.translation;
        const otherTranslations = shuffled
          .filter(w => w.word !== word.word)
          .map(w => w.translation)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);
        newOptionsMap[index] = [correctAnswer, ...otherTranslations].sort(() => Math.random() - 0.5);
      });
      setOptionsMap(newOptionsMap);
    }
  }, [wordList]);

  const updateProgressMutation = useMutation({
    mutationFn: async ({ word, correct }) => {
      const existing = progress.find(p => p.word === word);
      if (existing) {
        const newCorrect = (existing.correct_count || 0) + (correct ? 1 : 0);
        const newIncorrect = (existing.incorrect_count || 0) + (correct ? 0 : 1);
        const newStatus = newCorrect >= 3 ? "mastered" : "learning";
        
        await base44.entities.UserWordProgress.update(existing.id, {
          correct_count: newCorrect,
          incorrect_count: newIncorrect,
          status: newStatus
        });
      } else {
        await base44.entities.UserWordProgress.create({
          word_list_id: listId,
          word,
          status: "learning",
          correct_count: correct ? 1 : 0,
          incorrect_count: correct ? 0 : 1
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['word-progress', listId] });
      queryClient.invalidateQueries({ queryKey: ['user-word-progress'] });
    }
  });

  const speakWord = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = getLanguageCode(wordList?.language);
      window.speechSynthesis.speak(utterance);
    }
  };

  const getLanguageCode = (lang) => {
    const codes = {
      Spanish: "es-ES", French: "fr-FR", German: "de-DE",
      Italian: "it-IT", Portuguese: "pt-PT", Russian: "ru-RU",
      Japanese: "ja-JP", Korean: "ko-KR", Chinese: "zh-CN"
    };
    return codes[lang] || "en-US";
  };

  const handleAnswer = (answer) => {
    if (showFeedback) return;
    
    setSelectedAnswer(answer);
    setShowFeedback(true);

    const isCorrect = answer === shuffledWords[currentIndex].translation;
    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      incorrect: prev.incorrect + (isCorrect ? 0 : 1)
    }));

    updateProgressMutation.mutate({ word: shuffledWords[currentIndex].word, correct: isCorrect });
  };

  const nextQuestion = () => {
    if (currentIndex < shuffledWords.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setShowHint(false);
    } else {
      setQuizComplete(true);
    }
  };

  const restartQuiz = () => {
    const newShuffled = [...wordList.words].sort(() => Math.random() - 0.5);
    setShuffledWords(newShuffled);
    
    const newOptionsMap = {};
    newShuffled.forEach((word, index) => {
      const correctAnswer = word.translation;
      const otherTranslations = newShuffled
        .filter(w => w.word !== word.word)
        .map(w => w.translation)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      newOptionsMap[index] = [correctAnswer, ...otherTranslations].sort(() => Math.random() - 0.5);
    });
    setOptionsMap(newOptionsMap);
    
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setShowHint(false);
    setScore({ correct: 0, incorrect: 0 });
    setQuizComplete(false);
  };

  if (isLoading || !wordList || shuffledWords.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const currentWord = shuffledWords[currentIndex];
  const options = optionsMap[currentIndex] || [];

  if (quizComplete) {
    const percentage = Math.round((score.correct / shuffledWords.length) * 100);
    
    return (
      <div className="min-h-screen p-6 md:p-8 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl text-center overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
              <Trophy className="w-16 h-16 mx-auto mb-4" />
              <h2 className="text-3xl font-bold">Quiz Complete!</h2>
            </div>
            <CardContent className="p-8 space-y-6">
              <div className="text-center">
                <p className="text-5xl font-bold text-gray-900">{percentage}%</p>
                <p className="text-gray-500">Score</p>
              </div>

              <div className="flex justify-center gap-8">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{score.correct}</p>
                  <p className="text-sm text-gray-500">Correct</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{score.incorrect}</p>
                  <p className="text-sm text-gray-500">Incorrect</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={restartQuiz} className="flex-1">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Link to={createPageUrl("LearnWords")} className="flex-1">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600">
                    Back to Lists
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  const progressPercent = ((currentIndex + 1) / shuffledWords.length) * 100;

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link to={createPageUrl("LearnWords")}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="text-center">
            <h1 className="font-bold text-gray-900">{wordList.title}</h1>
            <p className="text-sm text-gray-500">{currentIndex + 1} / {shuffledWords.length}</p>
          </div>
          <div className="flex gap-2">
            <Badge className="bg-green-100 text-green-700">{score.correct} ✓</Badge>
            <Badge className="bg-red-100 text-red-700">{score.incorrect} ✗</Badge>
          </div>
        </div>

        <Progress value={progressPercent} className="h-2" />

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
              <CardContent className="p-8">
                {/* Word Display */}
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <h2 className="text-4xl font-bold text-gray-900">{currentWord.word}</h2>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => speakWord(currentWord.word)}
                      className="rounded-full"
                    >
                      <Volume2 className="w-6 h-6 text-purple-600" />
                    </Button>
                  </div>
                  <p className="text-gray-500">What does this word mean?</p>
                </div>

                {/* Hint Button / Image */}
                {!showHint ? (
                  <Button
                    variant="outline"
                    onClick={() => setShowHint(true)}
                    className="w-full mb-6"
                    disabled={showFeedback}
                  >
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Show Hint (Image)
                  </Button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mb-6 rounded-xl overflow-hidden"
                  >
                    <img
                      src={currentWord.image_url}
                      alt="Hint"
                      className="w-full h-48 object-cover"
                    />
                  </motion.div>
                )}

                {/* Answer Options */}
                <div className="grid grid-cols-1 gap-3">
                  {options.map((option, index) => {
                    const isSelected = selectedAnswer === option;
                    const isCorrect = option === currentWord.translation;
                    
                    let buttonClass = "p-4 text-left rounded-xl border-2 transition-all ";
                    
                    if (showFeedback) {
                      if (isCorrect) {
                        buttonClass += "border-green-500 bg-green-50";
                      } else if (isSelected && !isCorrect) {
                        buttonClass += "border-red-500 bg-red-50";
                      } else {
                        buttonClass += "border-gray-200 opacity-50";
                      }
                    } else {
                      buttonClass += "border-gray-200 hover:border-purple-300 hover:bg-purple-50/50 cursor-pointer";
                    }

                    return (
                      <button
                        key={index}
                        onClick={() => handleAnswer(option)}
                        disabled={showFeedback}
                        className={buttonClass}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{option}</span>
                          {showFeedback && isCorrect && <Check className="w-5 h-5 text-green-600" />}
                          {showFeedback && isSelected && !isCorrect && <X className="w-5 h-5 text-red-600" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Next Button */}
                {showFeedback && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-6"
                  >
                    <Button
                      onClick={nextQuestion}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
                    >
                      {currentIndex < shuffledWords.length - 1 ? "Next Word" : "See Results"}
                    </Button>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}