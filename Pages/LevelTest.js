import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { GraduationCap, Play, Check, X, Loader2, ArrowRight, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";

const LANGUAGES = ["Spanish", "French", "German", "Italian", "Portuguese", "Russian", "Chinese", "Japanese", "Korean"];

export default function LevelTest() {
  const [user, setUser] = useState(null);
  const [language, setLanguage] = useState("Spanish");
  const [testState, setTestState] = useState("setup"); // setup, testing, results
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const generateTestMutation = useMutation({
    mutationFn: async () => {
      setIsGenerating(true);
      const nativeLang = user?.native_language || "English";
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Create a language level placement test for ${language} learners whose native language is ${nativeLang}.

Generate exactly 15 questions total:
- 5 vocabulary translation questions (mix of A1-C1 difficulty)
- 5 grammar fill-in-the-blank questions (mix of A1-C1 difficulty)
- 5 sentence construction/transformation questions (mix of A1-C1 difficulty)

Each question should have:
- A clear question text
- 4 answer options
- The correct answer index (0-3)
- The difficulty level (A1, A2, B1, B2, C1)
- The question type (vocabulary, grammar, sentence)

Make questions progressively harder. Format as JSON.`,
        response_json_schema: {
          type: "object",
          properties: {
            questions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  question: { type: "string" },
                  options: { type: "array", items: { type: "string" } },
                  correct_index: { type: "number" },
                  difficulty: { type: "string" },
                  type: { type: "string" }
                }
              }
            }
          }
        }
      });

      return response.questions;
    },
    onSuccess: (data) => {
      setQuestions(data);
      setTestState("testing");
      setIsGenerating(false);
    },
    onError: () => {
      setIsGenerating(false);
    }
  });

  const saveResultMutation = useMutation({
    mutationFn: async (result) => {
      await base44.entities.LevelTestResult.create(result);
      await base44.auth.updateMe({ 
        [`${language.toLowerCase()}_level`]: result.level 
      });
    }
  });

  const handleAnswer = (index) => {
    if (showFeedback) return;
    setSelectedAnswer(index);
    setShowFeedback(true);

    const isCorrect = index === questions[currentIndex].correct_index;
    setAnswers([...answers, { 
      questionIndex: currentIndex, 
      correct: isCorrect,
      difficulty: questions[currentIndex].difficulty,
      type: questions[currentIndex].type
    }]);
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      calculateResults();
    }
  };

  const calculateResults = () => {
    const correctAnswers = answers.filter(a => a.correct).length;
    const vocabCorrect = answers.filter(a => a.type === "vocabulary" && a.correct).length;
    const grammarCorrect = answers.filter(a => a.type === "grammar" && a.correct).length;
    
    // Calculate level based on score and difficulty of correct answers
    let level = "A1";
    const score = (correctAnswers / questions.length) * 100;
    
    if (score >= 90) level = "C1";
    else if (score >= 75) level = "B2";
    else if (score >= 60) level = "B1";
    else if (score >= 45) level = "A2";
    else level = "A1";

    const result = {
      language,
      level,
      score: correctAnswers,
      total_questions: questions.length,
      vocabulary_score: vocabCorrect,
      grammar_score: grammarCorrect
    };

    saveResultMutation.mutate(result);
    setTestState("results");
  };

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  if (testState === "setup") {
    return (
      <div className="min-h-screen p-6 md:p-8">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center justify-center gap-3">
              <GraduationCap className="w-8 h-8 text-purple-600" />
              Language Level Test
            </h1>
            <p className="text-gray-500 mt-2">Discover your proficiency level</p>
          </div>

          <Card className="bg-white/60 backdrop-blur-sm border-white/20">
            <CardContent className="p-8 space-y-6">
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Select Language to Test</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="border-gray-200 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map(lang => (
                      <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-blue-50 rounded-xl p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Test Overview</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• 15 questions total (5 vocabulary, 5 grammar, 5 sentences)</li>
                  <li>• Takes approximately 10-15 minutes</li>
                  <li>• Determines your CEFR level (A1-C1)</li>
                </ul>
              </div>

              <Button
                onClick={() => generateTestMutation.mutate()}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating Test...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    Start Test
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (testState === "results") {
    const correctCount = answers.filter(a => a.correct).length;
    const vocabScore = answers.filter(a => a.type === "vocabulary" && a.correct).length;
    const grammarScore = answers.filter(a => a.type === "grammar" && a.correct).length;
    const sentenceScore = answers.filter(a => a.type === "sentence" && a.correct).length;
    
    let level = "A1";
    const score = (correctCount / questions.length) * 100;
    if (score >= 90) level = "C1";
    else if (score >= 75) level = "B2";
    else if (score >= 60) level = "B1";
    else if (score >= 45) level = "A2";

    const levelColors = {
      A1: "from-green-400 to-green-600",
      A2: "from-blue-400 to-blue-600",
      B1: "from-purple-400 to-purple-600",
      B2: "from-orange-400 to-orange-600",
      C1: "from-red-400 to-red-600"
    };

    return (
      <div className="min-h-screen p-6 md:p-8">
        <div className="max-w-2xl mx-auto space-y-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <Card className="bg-white/60 backdrop-blur-sm border-white/20 overflow-hidden">
              <div className={`bg-gradient-to-r ${levelColors[level]} p-8 text-white`}>
                <Trophy className="w-16 h-16 mx-auto mb-4" />
                <h2 className="text-4xl font-bold mb-2">Your Level: {level}</h2>
                <p className="text-white/80">in {language}</p>
              </div>
              <CardContent className="p-8 space-y-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-900">{correctCount}/{questions.length}</p>
                  <p className="text-gray-500">Correct Answers</p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-xl">
                    <p className="text-2xl font-bold text-blue-600">{vocabScore}/5</p>
                    <p className="text-sm text-gray-600">Vocabulary</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-xl">
                    <p className="text-2xl font-bold text-purple-600">{grammarScore}/5</p>
                    <p className="text-sm text-gray-600">Grammar</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-xl">
                    <p className="text-2xl font-bold text-orange-600">{sentenceScore}/5</p>
                    <p className="text-sm text-gray-600">Sentences</p>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    setTestState("setup");
                    setQuestions([]);
                    setAnswers([]);
                    setCurrentIndex(0);
                  }}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  Take Another Test
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">{language} Level Test</h1>
          <span className="text-sm text-gray-500">
            Question {currentIndex + 1} of {questions.length}
          </span>
        </div>

        <Progress value={progress} className="h-2" />

        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="bg-white/60 backdrop-blur-sm border-white/20">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    currentQuestion?.type === "vocabulary" ? "bg-blue-100 text-blue-700" :
                    currentQuestion?.type === "grammar" ? "bg-purple-100 text-purple-700" :
                    "bg-orange-100 text-orange-700"
                  }`}>
                    {currentQuestion?.type}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                    {currentQuestion?.difficulty}
                  </span>
                </div>
                <CardTitle className="text-xl">{currentQuestion?.question}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {currentQuestion?.options.map((option, index) => {
                  const isSelected = selectedAnswer === index;
                  const isCorrect = index === currentQuestion.correct_index;
                  
                  let buttonClass = "w-full p-4 text-left rounded-xl border-2 transition-all ";
                  
                  if (showFeedback) {
                    if (isCorrect) {
                      buttonClass += "border-green-500 bg-green-50";
                    } else if (isSelected && !isCorrect) {
                      buttonClass += "border-red-500 bg-red-50";
                    } else {
                      buttonClass += "border-gray-200 opacity-50";
                    }
                  } else {
                    buttonClass += isSelected 
                      ? "border-purple-500 bg-purple-50" 
                      : "border-gray-200 hover:border-purple-300 hover:bg-purple-50/50";
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswer(index)}
                      disabled={showFeedback}
                      className={buttonClass}
                    >
                      <div className="flex items-center justify-between">
                        <span>{option}</span>
                        {showFeedback && isCorrect && <Check className="w-5 h-5 text-green-600" />}
                        {showFeedback && isSelected && !isCorrect && <X className="w-5 h-5 text-red-600" />}
                      </div>
                    </button>
                  );
                })}

                {showFeedback && (
                  <Button
                    onClick={nextQuestion}
                    className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600"
                  >
                    {currentIndex < questions.length - 1 ? (
                      <>
                        Next Question
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    ) : (
                      "See Results"
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}