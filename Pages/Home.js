import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { BookOpen, MessageCircle, GraduationCap, TrendingUp, Target, Award, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";

export default function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: flashcards } = useQuery({
    queryKey: ['all-flashcards'],
    queryFn: () => base44.entities.Flashcard.list(),
    initialData: [],
  });

  const { data: decks } = useQuery({
    queryKey: ['decks'],
    queryFn: () => base44.entities.Deck.list(),
    initialData: [],
  });

  const { data: dialogueSessions } = useQuery({
    queryKey: ['dialogue-sessions'],
    queryFn: () => base44.entities.DialogueSession.list(),
    initialData: [],
  });

  // Calculate stats
  const totalCards = flashcards.length;
  const masteredCards = flashcards.filter(c => c.difficulty === "mastered").length;
  const cardsToReview = flashcards.filter(card => {
    if (!card.next_review_date) return true;
    return new Date(card.next_review_date) <= new Date();
  }).length;
  const masteryRate = totalCards > 0 ? Math.round((masteredCards / totalCards) * 100) : 0;

  // Calculate streak
  const today = new Date().toDateString();
  const reviewedToday = flashcards.filter(c => 
    c.last_reviewed && new Date(c.last_reviewed).toDateString() === today
  ).length;

  const practiceOptions = [
    {
      title: "Learn Words",
      description: "Practice vocabulary with smart flashcards",
      icon: BookOpen,
      href: createPageUrl("LearnWords"),
      gradient: "from-blue-500 to-cyan-500",
      stats: `${totalCards} cards • ${cardsToReview} to review`
    },
    {
      title: "Learn Grammar",
      description: "Master grammar rules with interactive exercises",
      icon: GraduationCap,
      href: createPageUrl("GrammarPractice"),
      gradient: "from-purple-500 to-pink-500",
      stats: "Exercises & quizzes"
    },
    {
      title: "Practice Dialogue",
      description: "Have real conversations with AI",
      icon: MessageCircle,
      href: createPageUrl("DialoguePractice"),
      gradient: "from-orange-500 to-red-500",
      stats: `${dialogueSessions.length} conversations`
    }
  ];

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 text-white"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Welcome back{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}! 👋
          </h1>
          <p className="text-white/80 text-lg">
            Ready to continue your language learning journey?
          </p>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-white/60 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Your Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-blue-100 flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{totalCards}</p>
                  <p className="text-sm text-gray-500">Total Cards</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-green-100 flex items-center justify-center">
                    <Award className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{masteredCards}</p>
                  <p className="text-sm text-gray-500">Mastered</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-orange-100 flex items-center justify-center">
                    <Target className="w-6 h-6 text-orange-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{cardsToReview}</p>
                  <p className="text-sm text-gray-500">To Review</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-purple-100 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{reviewedToday}</p>
                  <p className="text-sm text-gray-500">Reviewed Today</p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Mastery Progress</span>
                  <span className="text-sm font-bold text-purple-600">{masteryRate}%</span>
                </div>
                <Progress value={masteryRate} className="h-3" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Practice Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <h2 className="text-2xl font-bold text-gray-900">What do you want to practice today?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {practiceOptions.map((option, index) => (
              <motion.div
                key={option.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link to={option.href}>
                  <Card className="h-full cursor-pointer bg-white/60 backdrop-blur-sm border-white/20 hover:shadow-xl transition-all duration-300 overflow-hidden">
                    <div className={`h-2 bg-gradient-to-r ${option.gradient}`} />
                    <CardContent className="p-6">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${option.gradient} flex items-center justify-center mb-4`}>
                        <option.icon className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{option.title}</h3>
                      <p className="text-gray-500 mb-4">{option.description}</p>
                      <p className="text-sm font-medium text-purple-600">{option.stats}</p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}