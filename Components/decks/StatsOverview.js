import React from "react";
import { BookOpen, Clock, Award, LayoutGrid } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const stats = [
  { icon: BookOpen, label: "Total Cards", key: "totalCards", color: "blue" },
  { icon: Clock, label: "Due Today", key: "cardsToReview", color: "orange" },
  { icon: Award, label: "Mastered", key: "masteredCards", color: "green" },
  { icon: LayoutGrid, label: "Decks", key: "decksCount", color: "purple" }
];

export default function StatsOverview({ totalCards, cardsToReview, masteredCards, decksCount }) {
  const values = { totalCards, cardsToReview, masteredCards, decksCount };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.key} className="bg-white/50 backdrop-blur-sm border-white/20 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900">{values[stat.key]}</p>
              </div>
              <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-100 flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}