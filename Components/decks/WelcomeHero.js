import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function WelcomeHero() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl p-8 md:p-12 text-white shadow-2xl"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-6 h-6" />
          <span className="text-sm font-medium opacity-90">FlashMind</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          {getGreeting()}{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}!
        </h1>
        <p className="text-lg opacity-90">
          Ready to boost your learning with smart spaced repetition?
        </p>
      </div>
    </motion.div>
  );
}