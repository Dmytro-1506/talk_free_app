import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Target, Award, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import StatCard from "../components/stats/StatCard";
import CategoryBreakdown from "../components/stats/CategoryBreakdown";
import LearningStreak from "../components/stats/LearningStreak";

export default function Statistics() {
  const { data: decks } = useQuery({
    queryKey: ['decks'],
    queryFn: () => base44.entities.Deck.list(),
    initialData: [],
  });

  const { data: flashcards } = useQuery({
    queryKey: ['all-flashcards'],
    queryFn: () => base44.entities.Flashcard.list(),
    initialData: [],
  });

  const totalCards = flashcards.length;
  const masteredCards = flashcards.filter(card => card.difficulty === "mastered").length;
  const learningCards = flashcards.filter(card => card.difficulty === "learning").length;
  const reviewCards = flashcards.filter(card => card.difficulty === "review").length;
  const newCards = flashcards.filter(card => card.difficulty === "new").length;

  const cardsReviewedToday = flashcards.filter(card => {
    if (!card.last_reviewed) return false;
    const today = new Date().toDateString();
    const reviewDate = new Date(card.last_reviewed).toDateString();
    return today === reviewDate;
  }).length;

  const masteryRate = totalCards > 0 ? (masteredCards / totalCards) * 100 : 0;

  const categoryData = decks.reduce((acc, deck) => {
    const deckCards = flashcards.filter(card => card.deck_id === deck.id);
    const category = deck.category || "other";
    
    if (!acc[category]) {
      acc[category] = { total: 0, mastered: 0 };
    }
    
    acc[category].total += deckCards.length;
    acc[category].mastered += deckCards.filter(card => card.difficulty === "mastered").length;
    
    return acc;
  }, {});

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Learning Statistics
          </h1>
          <p className="text-gray-500 mt-1">Track your progress and achievements</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Cards"
            value={totalCards}
            icon={Target}
            color="blue"
          />
          <StatCard
            title="Mastered"
            value={masteredCards}
            icon={Award}
            color="green"
          />
          <StatCard
            title="Reviewed Today"
            value={cardsReviewedToday}
            icon={Calendar}
            color="purple"
          />
          <StatCard
            title="Mastery Rate"
            value={`${masteryRate.toFixed(0)}%`}
            icon={TrendingUp}
            color="orange"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white/50 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle>Learning Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Mastered</span>
                  <span className="text-sm font-bold text-green-600">{masteredCards}</span>
                </div>
                <Progress value={(masteredCards / totalCards) * 100} className="h-2 bg-gray-100" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">In Review</span>
                  <span className="text-sm font-bold text-blue-600">{reviewCards}</span>
                </div>
                <Progress value={(reviewCards / totalCards) * 100} className="h-2 bg-gray-100" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Learning</span>
                  <span className="text-sm font-bold text-purple-600">{learningCards}</span>
                </div>
                <Progress value={(learningCards / totalCards) * 100} className="h-2 bg-gray-100" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">New</span>
                  <span className="text-sm font-bold text-gray-600">{newCards}</span>
                </div>
                <Progress value={(newCards / totalCards) * 100} className="h-2 bg-gray-100" />
              </div>
            </CardContent>
          </Card>

          <CategoryBreakdown categoryData={categoryData} />
        </div>

        <LearningStreak flashcards={flashcards} />
      </div>
    </div>
  );
}