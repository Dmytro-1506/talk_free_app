import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Hotel, Users, MapPin, ShoppingCart, Utensils, Plane, Phone, Briefcase } from "lucide-react";

const ICONS = {
  hotel: Hotel,
  users: Users,
  map: MapPin,
  shopping: ShoppingCart,
  restaurant: Utensils,
  travel: Plane,
  phone: Phone,
  work: Briefcase
};

const difficultyColors = {
  beginner: "bg-green-100 text-green-700",
  intermediate: "bg-yellow-100 text-yellow-700",
  advanced: "bg-red-100 text-red-700"
};

export default function TopicCard({ topic, onClick }) {
  const Icon = ICONS[topic.icon] || Users;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        className="p-6 cursor-pointer bg-white/60 backdrop-blur-sm border-white/20 hover:shadow-xl hover:border-purple-200 transition-all duration-300"
        onClick={onClick}
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 mb-1">{topic.title}</h3>
            <p className="text-sm text-gray-500 mb-3 line-clamp-2">{topic.description}</p>
            <div className="flex gap-2 flex-wrap">
              <Badge className={difficultyColors[topic.difficulty]}>
                {topic.difficulty}
              </Badge>
              <Badge variant="outline" className="text-purple-600 border-purple-200">
                {topic.language}
              </Badge>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}