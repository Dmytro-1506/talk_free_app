import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { GraduationCap, Play, Check, X, Loader2, ArrowRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

const LANGUAGES = [
  "Spanish", "French", "German", "Italian", "Portuguese", 
  "Russian", "Chinese", "Japanese", "Korean", "English"
];

const GRAMMAR_TOPICS = [
  { id: "verb_conjugation", title: "Verb Conjugation", description: "Practice conjugating verbs in different tenses" },
  { id: "articles", title: "Articles & Gender", description: "Master the use of articles and noun genders" },
  { id: "pronouns", title: "Pronouns", description: "Learn subject, object, and possessive pronouns" },
  { id: "prepositions", title: "Prepositions", description: "Use prepositions correctly in sentences" },
  { id: "sentence_structure", title: "Sentence Structure", description: "Build grammatically correct sentences" },
  { id: "tenses", title: "Tenses", description: "Practice past, present, and future tenses" }
];

export default function GrammarPractice() {
  const [user, setUser] = useState(null);
  const [language, setLanguage] = useState("Spanish");
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentExercise, setCurrentExercise] = useState(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [exerciseCount, setExerciseCount] = useState(0);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const generateExercise = async () => {
    setIsGenerating(true);
    setFeedback(null);
    setUserAnswer("");

    const nativeLanguage = user?.native_language || "English";
    const topic = GRAMMAR_TOPICS.find(t => t.id === selectedTopic);

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Create a ${language} grammar exercise about "${topic.title}".

Generate ONE fill-in-the-blank or transformation exercise appropriate for intermediate learners.

The exercise should:
1. Have a clear instruction in ${nativeLanguage}
2. Present a sentence or phrase with a blank or transformation needed
3. Have exactly ONE correct answer
4. Include a brief explanation of the grammar rule

Format your response as JSON.`,
      response_json_schema: {
        type: "object",
        properties: {
          instruction: { type: "string" },
          question: { type: "string" },
          correct_answer: { type: "string" },
          hint: { type: "string" },
          explanation: { type: "string" }
        }
      }
    });

    setCurrentExercise(response);
    setIsGenerating(false);
    setExerciseCount(prev => prev + 1);
  };

  const checkAnswer = async () => {
    if (!userAnswer.trim()) return;

    setIsGenerating(true);

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Check if this grammar answer is correct.

Exercise: ${currentExercise.question}
Correct answer: ${currentExercise.correct_answer}
User's answer: ${userAnswer}

Determine if the user's answer is correct (exact match or acceptable variation).
Provide brief, encouraging feedback in ${user?.native_language || "English"}.`,
      response_json_schema: {
        type: "object",
        properties: {
          is_correct: { type: "boolean" },
          feedback: { type: "string" }
        }
      }
    });

    setFeedback({
      isCorrect: response.is_correct,
      message: response.feedback,
      correctAnswer: currentExercise.correct_answer,
      explanation: currentExercise.explanation
    });

    setScore(prev => ({
      correct: prev.correct + (response.is_correct ? 1 : 0),
      total: prev.total + 1
    }));

    setIsGenerating(false);
  };

  const resetPractice = () => {
    setSelectedTopic(null);
    setCurrentExercise(null);
    setFeedback(null);
    setUserAnswer("");
    setScore({ correct: 0, total: 0 });
    setExerciseCount(0);
  };

  if (!selectedTopic) {
    return (
      <div className="min-h-screen p-6 md:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-3">
              <GraduationCap className="w-8 h-8 text-purple-600" />
              Grammar Practice
            </h1>
            <p className="text-gray-500 mt-1">Master grammar rules with interactive exercises</p>
          </div>

          <Card className="bg-white/60 backdrop-blur-sm border-white/20 p-6">
            <div className="space-y-2 max-w-xs">
              <Label className="text-gray-700 font-medium">Select Language</Label>
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
          </Card>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Choose a Topic</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {GRAMMAR_TOPICS.map((topic) => (
                <motion.div
                  key={topic.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    onClick={() => setSelectedTopic(topic.id)}
                    className="cursor-pointer bg-white/60 backdrop-blur-sm border-white/20 hover:border-purple-300 hover:shadow-lg transition-all"
                  >
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-gray-900 mb-2">{topic.title}</h3>
                      <p className="text-sm text-gray-500">{topic.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const topic = GRAMMAR_TOPICS.find(t => t.id === selectedTopic);

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{topic.title}</h1>
            <p className="text-gray-500">{language} Grammar Practice</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-lg px-4 py-2">
              {score.correct}/{score.total}
            </Badge>
            <Button variant="ghost" onClick={resetPractice}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>

        {!currentExercise ? (
          <Card className="bg-white/60 backdrop-blur-sm border-white/20 p-12 text-center">
            <GraduationCap className="w-16 h-16 text-purple-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to Practice?</h3>
            <p className="text-gray-500 mb-6">Generate your first {topic.title.toLowerCase()} exercise</p>
            <Button
              onClick={generateExercise}
              disabled={isGenerating}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Start Exercise
                </>
              )}
            </Button>
          </Card>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={exerciseCount}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="bg-white/60 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-lg">{currentExercise.instruction}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <p className="text-xl text-gray-900 font-medium">{currentExercise.question}</p>
                    {currentExercise.hint && (
                      <p className="text-sm text-gray-500 mt-2">💡 Hint: {currentExercise.hint}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Your Answer</Label>
                    <Input
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !feedback && checkAnswer()}
                      placeholder="Type your answer..."
                      disabled={!!feedback}
                      className="text-lg"
                    />
                  </div>

                  {feedback && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`rounded-xl p-4 ${
                        feedback.isCorrect ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {feedback.isCorrect ? (
                          <Check className="w-6 h-6 text-green-600 flex-shrink-0" />
                        ) : (
                          <X className="w-6 h-6 text-red-600 flex-shrink-0" />
                        )}
                        <div>
                          <p className={`font-medium ${feedback.isCorrect ? "text-green-800" : "text-red-800"}`}>
                            {feedback.message}
                          </p>
                          {!feedback.isCorrect && (
                            <p className="text-sm mt-1 text-gray-600">
                              Correct answer: <strong>{feedback.correctAnswer}</strong>
                            </p>
                          )}
                          <p className="text-sm mt-2 text-gray-600">{feedback.explanation}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div className="flex gap-3">
                    {!feedback ? (
                      <Button
                        onClick={checkAnswer}
                        disabled={!userAnswer.trim() || isGenerating}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
                      >
                        {isGenerating ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            <Check className="w-5 h-5 mr-2" />
                            Check Answer
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        onClick={generateExercise}
                        disabled={isGenerating}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
                      >
                        {isGenerating ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            <ArrowRight className="w-5 h-5 mr-2" />
                            Next Exercise
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}