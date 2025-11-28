import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Check, BookmarkPlus, ChevronLeft, ChevronRight, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

export default function WordViewer() {
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const listId = urlParams.get("listId");

  const [currentIndex, setCurrentIndex] = useState(0);
  const [user, setUser] = useState(null);

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

  const updateProgressMutation = useMutation({
    mutationFn: async ({ word, status }) => {
      const existing = progress.find(p => p.word === word);
      if (existing) {
        await base44.entities.UserWordProgress.update(existing.id, { status });
      } else {
        await base44.entities.UserWordProgress.create({
          word_list_id: listId,
          word,
          status
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

  if (isLoading || !wordList) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const words = wordList.words || [];
  const currentWord = words[currentIndex];
  const wordProgress = progress.find(p => p.word === currentWord?.word);

  const goNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const markAsMastered = () => {
    updateProgressMutation.mutate({ word: currentWord.word, status: "mastered" });
  };

  const addToLearning = () => {
    updateProgressMutation.mutate({ word: currentWord.word, status: "learning" });
  };

  return (
    <div className="min-h-screen p-6 md:p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
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
            <p className="text-sm text-gray-500">{currentIndex + 1} / {words.length}</p>
          </div>
          <Badge className="bg-purple-100 text-purple-700">{wordList.level}</Badge>
        </div>

        {/* Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl overflow-hidden">
              {/* Image */}
              {currentWord?.image_url && (
                <div className="h-64 overflow-hidden">
                  <img
                    src={currentWord.image_url}
                    alt={currentWord.word}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Content */}
              <div className="p-8 text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <h2 className="text-4xl font-bold text-gray-900">{currentWord?.word}</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => speakWord(currentWord?.word)}
                    className="rounded-full"
                  >
                    <Volume2 className="w-6 h-6 text-purple-600" />
                  </Button>
                </div>
                <p className="text-xl text-gray-600">{currentWord?.translation}</p>

                {wordProgress?.status && (
                  <Badge className={`mt-4 ${
                    wordProgress.status === "mastered" 
                      ? "bg-green-100 text-green-700" 
                      : "bg-blue-100 text-blue-700"
                  }`}>
                    {wordProgress.status === "mastered" ? "✓ Mastered" : "📚 Learning"}
                  </Badge>
                )}
              </div>

              {/* Actions */}
              <div className="px-8 pb-8 flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={addToLearning}
                  disabled={wordProgress?.status === "learning"}
                >
                  <BookmarkPlus className="w-4 h-4 mr-2" />
                  Add to Learning
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600"
                  onClick={markAsMastered}
                  disabled={wordProgress?.status === "mastered"}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Mark as Mastered
                </Button>
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={goPrev}
            disabled={currentIndex === 0}
            className="w-32"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Previous
          </Button>

          <div className="flex gap-1">
            {words.slice(Math.max(0, currentIndex - 3), Math.min(words.length, currentIndex + 4)).map((_, i) => {
              const actualIndex = Math.max(0, currentIndex - 3) + i;
              return (
                <button
                  key={actualIndex}
                  onClick={() => setCurrentIndex(actualIndex)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    actualIndex === currentIndex 
                      ? "bg-purple-600 w-6" 
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
                />
              );
            })}
          </div>

          <Button
            variant="outline"
            onClick={goNext}
            disabled={currentIndex === words.length - 1}
            className="w-32"
          >
            Next
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}