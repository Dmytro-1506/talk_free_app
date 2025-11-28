import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const categoryLabels = {
  language: "Language",
  science: "Science",
  history: "History",
  math: "Mathematics",
  technology: "Technology",
  business: "Business",
  medicine: "Medicine",
  art: "Art",
  other: "Other"
};

export default function CategoryBreakdown({ categoryData }) {
  const categories = Object.entries(categoryData).sort((a, b) => b[1].total - a[1].total);

  if (categories.length === 0) {
    return (
      <Card className="bg-white/50 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle>Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">No data yet. Create some decks to see your progress!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/50 backdrop-blur-sm border-white/20">
      <CardHeader>
        <CardTitle>Category Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {categories.map(([category, data]) => {
          const masteryPercent = data.total > 0 ? (data.mastered / data.total) * 100 : 0;
          
          return (
            <div key={category}>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {categoryLabels[category] || category}
                </span>
                <span className="text-sm text-gray-500">
                  {data.mastered} / {data.total} mastered
                </span>
              </div>
              <Progress value={masteryPercent} className="h-2 bg-gray-100" />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}