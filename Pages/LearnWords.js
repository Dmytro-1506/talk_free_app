import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { BookOpen, Eye, Brain, Filter, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import WordListCard from "../components/words/WordListCard";

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];
const TOPICS = [
  "Basic Vocabulary", "Food & Drinks", "Travel", "Family", "Work & Business",
  "Health", "Shopping", "Weather", "Hobbies", "Technology"
];

const STANDARD_WORD_LISTS = [
  { id: "basic-a1", title: "Basic Words", topic: "Basic Vocabulary", level: "A1", wordCount: 25 },
  { id: "food-a1", title: "Food Essentials", topic: "Food & Drinks", level: "A1", wordCount: 20 },
  { id: "family-a1", title: "Family Members", topic: "Family", level: "A1", wordCount: 20 },
  { id: "travel-a2", title: "Travel Basics", topic: "Travel", level: "A2", wordCount: 25 },
  { id: "shopping-a2", title: "Shopping Words", topic: "Shopping", level: "A2", wordCount: 22 },
  { id: "work-b1", title: "Office Vocabulary", topic: "Work & Business", level: "B1", wordCount: 25 },
  { id: "health-b1", title: "Health & Body", topic: "Health", level: "B1", wordCount: 24 },
  { id: "tech-b2", title: "Technology Terms", topic: "Technology", level: "B2", wordCount: 25 },
  { id: "business-b2", title: "Business Language", topic: "Work & Business", level: "B2", wordCount: 25 },
  { id: "advanced-c1", title: "Advanced Vocabulary", topic: "Basic Vocabulary", level: "C1", wordCount: 25 }
];

export default function LearnWords() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedTopic, setSelectedTopic] = useState("all");
  const [targetLanguage, setTargetLanguage] = useState("Spanish");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: wordLists, isLoading } = useQuery({
    queryKey: ['word-lists'],
    queryFn: () => base44.entities.WordList.list(),
    initialData: [],
  });

  const { data: userProgress } = useQuery({
    queryKey: ['user-word-progress'],
    queryFn: () => base44.entities.UserWordProgress.list(),
    initialData: [],
  });

  const generateListMutation = useMutation({
    mutationFn: async (listTemplate) => {
      setIsGenerating(true);
      const nativeLang = user?.native_language || "English";
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a word list for learning ${targetLanguage}.
Topic: ${listTemplate.topic}
Level: ${listTemplate.level} (CEFR)
Number of words: ${listTemplate.wordCount}

For each word provide:
1. The word in ${targetLanguage}
2. Translation in ${nativeLang}
3. A relevant image search term (in English) that would work well with Unsplash

Format as JSON array of objects with: word, translation, image_term`,
        response_json_schema: {
          type: "object",
          properties: {
            words: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  word: { type: "string" },
                  translation: { type: "string" },
                  image_term: { type: "string" }
                }
              }
            }
          }
        }
      });

      // Add image URLs
      const wordsWithImages = response.words.map(w => ({
        ...w,
        image_url: `https://source.unsplash.com/400x300/?${encodeURIComponent(w.image_term)}`
      }));

      const created = await base44.entities.WordList.create({
        title: listTemplate.title,
        topic: listTemplate.topic,
        level: listTemplate.level,
        language: targetLanguage,
        words: wordsWithImages,
        is_standard: true
      });

      return created;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['word-lists'] });
      setIsGenerating(false);
    },
    onError: () => {
      setIsGenerating(false);
    }
  });

  // Check which standard lists exist for current language
  const existingListIds = wordLists
    .filter(l => l.language === targetLanguage)
    .map(l => `${l.topic.toLowerCase().replace(/\s+/g, '-')}-${l.level.toLowerCase()}`);

  const availableLists = STANDARD_WORD_LISTS.filter(
    template => !existingListIds.includes(template.id.split('-').slice(0, -1).join('-') + '-' + template.level.toLowerCase())
  );

  const filteredLists = wordLists.filter(list => {
    if (list.language !== targetLanguage) return false;
    if (selectedLevel !== "all" && list.level !== selectedLevel) return false;
    if (selectedTopic !== "all" && list.topic !== selectedTopic) return false;
    return true;
  });

  const levelColors = {
    A1: "bg-green-100 text-green-700",
    A2: "bg-blue-100 text-blue-700",
    B1: "bg-purple-100 text-purple-700",
    B2: "bg-orange-100 text-orange-700",
    C1: "bg-red-100 text-red-700",
    C2: "bg-gray-100 text-gray-700"
  };

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-purple-600" />
              Learn Words
            </h1>
            <p className="text-gray-500 mt-1">Master vocabulary with visual flashcards</p>
          </div>

          <div className="flex items-center gap-3">
            <Select value={targetLanguage} onValueChange={setTargetLanguage}>
              <SelectTrigger className="w-36 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["Spanish", "French", "German", "Italian", "Portuguese", "Russian", "Japanese", "Korean", "Chinese"].map(lang => (
                  <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Link to={createPageUrl("CreateDeck")}>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                <Plus className="w-5 h-5 mr-2" />
                Custom Deck
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-white/60 backdrop-blur-sm border-white/20">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filter:</span>
              </div>
              
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger className="w-32 bg-white">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {LEVELS.map(level => (
                    <SelectItem key={level} value={level}>{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                <SelectTrigger className="w-44 bg-white">
                  <SelectValue placeholder="Topic" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Topics</SelectItem>
                  {TOPICS.map(topic => (
                    <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Available Standard Lists to Generate */}
        {availableLists.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Available Word Lists</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {availableLists.slice(0, 5).map(template => (
                <motion.div
                  key={template.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    onClick={() => !isGenerating && generateListMutation.mutate(template)}
                    className={`cursor-pointer bg-white/60 backdrop-blur-sm border-dashed border-2 border-gray-300 hover:border-purple-400 transition-all ${
                      isGenerating ? 'opacity-50 pointer-events-none' : ''
                    }`}
                  >
                    <CardContent className="p-4 text-center">
                      <Badge className={`${levelColors[template.level]} mb-2`}>{template.level}</Badge>
                      <p className="font-medium text-gray-900 text-sm">{template.title}</p>
                      <p className="text-xs text-gray-500">{template.wordCount} words</p>
                      {isGenerating && generateListMutation.variables?.id === template.id && (
                        <Loader2 className="w-4 h-4 animate-spin mx-auto mt-2 text-purple-600" />
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Existing Word Lists */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-white/50 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredLists.length === 0 ? (
          <Card className="bg-white/60 backdrop-blur-sm border-white/20 p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Word Lists Yet</h3>
            <p className="text-gray-500 mb-6">Click on an available list above to generate it</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLists.map(list => (
              <WordListCard
                key={list.id}
                list={list}
                progress={userProgress.filter(p => p.word_list_id === list.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}