import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { PlayCircle, Edit, Trash2, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const categoryColors = {
  language: "from-blue-400 to-blue-600",
  science: "from-green-400 to-green-600",
  history: "from-yellow-400 to-yellow-600",
  math: "from-purple-400 to-purple-600",
  technology: "from-cyan-400 to-cyan-600",
  business: "from-orange-400 to-orange-600",
  medicine: "from-red-400 to-red-600",
  art: "from-pink-400 to-pink-600",
  other: "from-gray-400 to-gray-600"
};

export default function DeckCard({ deck, cardCount, dueCount, onDelete }) {
  const colorGradient = categoryColors[deck.category] || categoryColors.other;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-white/50 backdrop-blur-sm border-white/20 overflow-hidden group hover:shadow-2xl transition-all duration-300">
        <div className={`h-3 bg-gradient-to-r ${colorGradient}`} />
        
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-1 line-clamp-1">{deck.name}</h3>
              <p className="text-sm text-gray-500 line-clamp-2">{deck.description}</p>
            </div>
            <Badge variant="secondary" className="ml-2 capitalize">
              {deck.category.replace(/_/g, ' ')}
            </Badge>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">{cardCount} cards</span>
            </div>
            {dueCount > 0 && (
              <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                {dueCount} due
              </Badge>
            )}
          </div>

          <div className="flex gap-2">
            <Link to={createPageUrl(`StudyDeck?deck=${deck.id}`)} className="flex-1">
              <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <PlayCircle className="w-4 h-4 mr-2" />
                Study
              </Button>
            </Link>
            <Link to={createPageUrl(`CreateDeck?deck=${deck.id}`)}>
              <Button variant="outline" size="icon" className="rounded-full">
                <Edit className="w-4 h-4" />
              </Button>
            </Link>
            <Button
              variant="outline"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="rounded-full hover:bg-red-50 hover:border-red-200"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}