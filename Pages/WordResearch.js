import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, Sparkles, BookOpen, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import WordResultCard from "../components/research/WordResultCard";
import AddToDeckDialog from "../components/research/AddToDeckDialog";

const LANGUAGES = [
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "ru", name: "Russian" },
  { code: "zh", name: "Chinese" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "ar", name: "Arabic" },
  { code: "hi", name: "Hindi" },
  { code: "other", name: "Other" }
];

export default function WordResearch() {
  const queryClient = useQueryClient();
  const [word, setWord] = useState("");
  const [language, setLanguage] = useState("es");
  const [customLanguage, setCustomLanguage] = useState("");
  const [results, setResults] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [user, setUser] = useState(null);

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: decks } = useQuery({
    queryKey: ['decks'],
    queryFn: () => base44.entities.Deck.list(),
    initialData: [],
  });

  const researchMutation = useMutation({
    mutationFn: async ({ word, targetLanguage, nativeLanguage }) => {
      const prompt = `You are a language learning expert. Analyze the word "${word}" in ${targetLanguage}.

Provide a comprehensive analysis with:

1. WORD TYPE: Identify if it's a verb, noun, adjective, or other
2. MEANING: Brief definition in ${nativeLanguage}
3. SIMILAR WORDS: List 5-7 related words (synonyms, related terms) with their ${nativeLanguage} translations
4. COMMON PHRASES: Provide 5-6 practical phrases or sentences using this word, with ${nativeLanguage} translations
5. GRAMMAR NOTES: Any important conjugation, gender, or usage notes
6. FREQUENCY: Is this a basic, intermediate, or advanced vocabulary word?

Format your response as a structured JSON object.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            word: { type: "string" },
            word_type: { type: "string" },
            meaning: { type: "string" },
            similar_words: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  word: { type: "string" },
                  translation: { type: "string" }
                }
              }
            },
            phrases: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  phrase: { type: "string" },
                  translation: { type: "string" }
                }
              }
            },
            grammar_notes: { type: "string" },
            frequency: { type: "string" }
          }
        }
      });

      return response;
    },
    onSuccess: (data) => {
      setResults(data);
    },
  });

  const addToDeckMutation = useMutation({
    mutationFn: async ({ deckId, cards }) => {
      const deck = decks.find(d => d.id === deckId);
      
      // Update deck's target language if not set
      if (deck && !deck.target_language) {
        const targetLang = language === "other" ? customLanguage : LANGUAGES.find(l => l.code === language)?.name;
        await base44.entities.Deck.update(deckId, {
          target_language: targetLang,
          total_cards: (deck.total_cards || 0) + cards.length
        });
      } else if (deck) {
        await base44.entities.Deck.update(deckId, {
          total_cards: (deck.total_cards || 0) + cards.length
        });
      }

      const createdCards = [];
      for (const card of cards) {
        const created = await base44.entities.Flashcard.create({
          deck_id: deckId,
          front: card.front,
          back: card.back,
          next_review_date: new Date().toISOString()
        });
        createdCards.push(created);
      }
      
      return createdCards;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decks'] });
      queryClient.invalidateQueries({ queryKey: ['all-flashcards'] });
      setShowAddDialog(false);
      setSelectedCard(null);
    },
  });

  const handleSearch = () => {
    if (!word.trim()) {
      alert("Please enter a word to research");
      return;
    }

    const targetLanguage = language === "other" ? customLanguage : LANGUAGES.find(l => l.code === language)?.name;
    
    if (!targetLanguage) {
      alert("Please specify the language");
      return;
    }

    const nativeLanguage = user?.native_language || "English";

    researchMutation.mutate({ word: word.trim(), targetLanguage, nativeLanguage });
  };

  const handleAddToFlashcards = (cardData) => {
    if (decks.length === 0) {
      alert("Please create a deck first before adding flashcards");
      return;
    }
    setSelectedCard(cardData);
    setShowAddDialog(true);
  };

  const handleConfirmAdd = (deckId) => {
    if (selectedCard) {
      addToDeckMutation.mutate({
        deckId,
        cards: [selectedCard]
      });
    }
  };

  const handleAddMultiple = (cards, deckId) => {
    addToDeckMutation.mutate({ deckId, cards });
  };

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
            <Search className="w-8 h-8 text-purple-600" />
            Word Research
          </h1>
          <p className="text-gray-500 mt-1">Discover similar words, phrases, and usage examples</p>
        </div>

        <Card className="bg-white/50 backdrop-blur-sm border-white/20 shadow-xl">
          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="word" className="text-gray-700 font-medium">Word to Research</Label>
                  <Input
                    id="word"
                    placeholder="Enter a word in your target language..."
                    value={word}
                    onChange={(e) => setWord(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="text-lg border-gray-200 focus:border-purple-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language" className="text-gray-700 font-medium">Language</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="border-gray-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map(lang => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {language === "other" && (
                <div className="space-y-2">
                  <Label htmlFor="customLanguage" className="text-gray-700 font-medium">
                    Specify Language
                  </Label>
                  <Input
                    id="customLanguage"
                    placeholder="e.g., Swedish, Turkish, etc."
                    value={customLanguage}
                    onChange={(e) => setCustomLanguage(e.target.value)}
                    className="border-gray-200"
                  />
                </div>
              )}

              <Button
                onClick={handleSearch}
                disabled={researchMutation.isPending}
                className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
                size="lg"
              >
                {researchMutation.isPending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Researching...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Research Word
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <AnimatePresence>
          {results && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-100">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-3xl text-gray-900 mb-2">{results.word}</CardTitle>
                      <div className="flex gap-2 flex-wrap">
                        <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                          {results.word_type}
                        </Badge>
                        <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                          {results.frequency} level
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-lg text-gray-700 mb-4">
                    <span className="font-semibold">Meaning:</span> {results.meaning}
                  </p>
                  {results.grammar_notes && (
                    <div className="bg-white/60 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">Grammar Notes:</span> {results.grammar_notes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <WordResultCard
                  title="Similar Words"
                  icon={BookOpen}
                  items={results.similar_words}
                  onAddToFlashcards={handleAddToFlashcards}
                  type="word"
                  decks={decks}
                  onAddMultiple={handleAddMultiple}
                  targetLanguage={language === "other" ? customLanguage : LANGUAGES.find(l => l.code === language)?.name}
                />

                <WordResultCard
                  title="Common Phrases"
                  icon={Sparkles}
                  items={results.phrases}
                  onAddToFlashcards={handleAddToFlashcards}
                  type="phrase"
                  decks={decks}
                  onAddMultiple={handleAddMultiple}
                  targetLanguage={language === "other" ? customLanguage : LANGUAGES.find(l => l.code === language)?.name}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {showAddDialog && (
          <AddToDeckDialog
            decks={decks}
            onSelect={handleConfirmAdd}
            onClose={() => {
              setShowAddDialog(false);
              setSelectedCard(null);
            }}
            isLoading={addToDeckMutation.isPending}
          />
        )}
      </div>
    </div>
  );
}