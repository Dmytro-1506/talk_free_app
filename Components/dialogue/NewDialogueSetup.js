import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Play, Hotel, Users, MapPin, Utensils, ShoppingCart, Plane, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const LANGUAGES = [
  "Spanish", "French", "German", "Italian", "Portuguese", 
  "Russian", "Chinese", "Japanese", "Korean", "Arabic",
  "Dutch", "Polish", "Turkish", "Swedish", "Greek", "English"
];

const LEVELS = [
  { id: "A1", name: "A1 - Beginner", description: "Basic phrases and simple sentences" },
  { id: "A2", name: "A2 - Elementary", description: "Simple everyday conversations" },
  { id: "B1", name: "B1 - Intermediate", description: "Clear speech on familiar topics" },
  { id: "B2", name: "B2 - Upper Intermediate", description: "Fluent interaction with native speakers" },
  { id: "C1", name: "C1 - Advanced", description: "Complex topics and nuanced expression" },
  { id: "C2", name: "C2 - Proficient", description: "Near-native fluency" }
];

const STANDARD_TOPICS = [
  { id: "hotel", title: "Hotel Reservation", icon: Hotel, prompt: "You are a friendly hotel receptionist. Help the guest book a room, answer questions about amenities, prices, and services. Keep responses short and natural." },
  { id: "coworkers", title: "Meeting New Coworkers", icon: Users, prompt: "You are a new coworker meeting someone for the first time at the office. Introduce yourself, ask about their role, and make friendly conversation. Keep responses short and natural." },
  { id: "directions", title: "Asking for Directions", icon: MapPin, prompt: "You are a helpful local person giving directions. Help the tourist find places like the train station, museum, restaurant, etc. Use landmarks and simple directions. Keep responses short." },
  { id: "restaurant", title: "Restaurant Ordering", icon: Utensils, prompt: "You are a waiter at a restaurant. Help the customer with the menu, take their order, and handle requests. Keep responses short and natural." },
  { id: "shopping", title: "Shopping at a Store", icon: ShoppingCart, prompt: "You are a store clerk helping a customer. Help them find products, discuss prices, sizes, and colors. Keep responses short and natural." },
  { id: "airport", title: "Airport & Travel", icon: Plane, prompt: "You are an airport staff member. Help travelers with check-in, boarding passes, gate information, and general airport questions. Keep responses short." },
  { id: "custom", title: "Custom Topic", icon: Edit3, prompt: "" }
];

export default function NewDialogueSetup({ onBack, onStart }) {
  const [language, setLanguage] = useState("Spanish");
  const [level, setLevel] = useState("A2");
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [customTopic, setCustomTopic] = useState("");

  const handleStart = () => {
    if (!selectedTopic) return;

    let topic = STANDARD_TOPICS.find(t => t.id === selectedTopic);
    let finalPrompt = topic.prompt;
    let finalTitle = topic.title;

    if (selectedTopic === "custom") {
      if (!customTopic.trim()) return;
      finalPrompt = `You are role-playing a scenario about: "${customTopic}". Act naturally as an appropriate character for this scenario. Keep responses short and conversational.`;
      finalTitle = customTopic;
    }

    // Add level instructions to the prompt
    const levelInstructions = {
      A1: "Use only very basic vocabulary and simple present tense. Speak slowly with short sentences (max 5-6 words). Use common everyday words only.",
      A2: "Use simple vocabulary and basic grammar. Keep sentences short (max 8-10 words). Use present and simple past tense. Avoid idioms.",
      B1: "Use intermediate vocabulary. You can use various tenses and some compound sentences. Keep responses clear and not too complex.",
      B2: "Use natural speech with varied vocabulary and grammar. You can use idioms occasionally and more complex sentence structures.",
      C1: "Use advanced vocabulary, complex grammar, and natural idiomatic expressions. Speak as you would to an educated native speaker.",
      C2: "Use sophisticated vocabulary, nuanced expressions, and complex structures. Include cultural references and subtle language."
    };

    const levelPrompt = `${finalPrompt}\n\nIMPORTANT: Adjust your language to ${level} level. ${levelInstructions[level]}`;

    onStart({
      language,
      level,
      topicId: selectedTopic,
      topicTitle: finalTitle,
      prompt: levelPrompt
    });
  };

  const canStart = selectedTopic && (selectedTopic !== "custom" || customTopic.trim());

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Button variant="ghost" onClick={onBack} className="mb-6 gap-2">
        <ArrowLeft className="w-4 h-4" />
        Back
      </Button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Start New Dialogue</h2>
          <p className="text-gray-500">Choose your language and conversation topic</p>
        </div>

        <Card className="p-6 bg-white/60 backdrop-blur-sm border-white/20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">Practice Language</Label>
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
            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">Difficulty Level</Label>
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger className="border-gray-200 bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEVELS.map(l => (
                    <SelectItem key={l.id} value={l.id}>
                      <div className="flex flex-col">
                        <span>{l.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-3">
            {LEVELS.find(l => l.id === level)?.description}
          </p>
        </Card>

        <div className="space-y-4">
          <Label className="text-gray-700 font-medium text-lg">Select Topic</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {STANDARD_TOPICS.map((topic) => {
              const Icon = topic.icon;
              const isSelected = selectedTopic === topic.id;
              
              return (
                <motion.div
                  key={topic.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    onClick={() => setSelectedTopic(topic.id)}
                    className={`p-4 cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 shadow-lg"
                        : "bg-white/60 border-gray-200 hover:border-purple-300 hover:bg-purple-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isSelected ? "bg-white/20" : "bg-purple-100"
                      }`}>
                        <Icon className={`w-5 h-5 ${isSelected ? "text-white" : "text-purple-600"}`} />
                      </div>
                      <span className="font-medium">{topic.title}</span>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {selectedTopic === "custom" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
          >
            <Card className="p-6 bg-white/60 backdrop-blur-sm border-white/20">
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Describe Your Topic</Label>
                <Input
                  placeholder="e.g., Visiting a doctor, Renting an apartment, Job interview..."
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  className="border-gray-200"
                />
              </div>
            </Card>
          </motion.div>
        )}

        <Button
          size="lg"
          onClick={handleStart}
          disabled={!canStart}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
        >
          <Play className="w-5 h-5 mr-2" />
          Start Dialogue
        </Button>
      </motion.div>
    </div>
  );
}