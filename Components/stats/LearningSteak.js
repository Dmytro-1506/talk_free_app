import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Flame } from "lucide-react";
import { format, subDays, isToday, isSameDay } from "date-fns";

export default function LearningStreak({ flashcards }) {
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      days.push(subDays(new Date(), i));
    }
    return days;
  };

  const getCardsReviewedOnDate = (date) => {
    return flashcards.filter(card => {
      if (!card.last_reviewed) return false;
      return isSameDay(new Date(card.last_reviewed), date);
    }).length;
  };

  const days = getLast7Days();
  const currentStreak = days.reverse().findIndex(day => getCardsReviewedOnDate(day) === 0);
  const streakCount = currentStreak === -1 ? 7 : currentStreak;

  return (
    <Card className="bg-white/50 backdrop-blur-sm border-white/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-500" />
          Learning Streak
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="text-center">
            <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500 mb-2">
              {streakCount}
            </div>
            <p className="text-gray-500">day{streakCount !== 1 ? 's' : ''} in a row</p>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {getLast7Days().map((day, index) => {
            const cardsReviewed = getCardsReviewedOnDate(day);
            const hasActivity = cardsReviewed > 0;
            
            return (
              <div key={index} className="text-center">
                <div className={`w-full aspect-square rounded-lg flex items-center justify-center mb-1 transition-all duration-300 ${
                  hasActivity 
                    ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {isToday(day) ? (
                    <Calendar className="w-4 h-4" />
                  ) : (
                    <span className="text-xs font-bold">{format(day, 'd')}</span>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {format(day, 'EEE')}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}