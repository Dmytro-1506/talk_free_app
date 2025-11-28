import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Save, Plus, Trash2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import FlashcardEditor from "../components/deck/FlashcardEditor";

const CATEGORIES = [
  { value: "language", label: "Language", color: "blue" },
  { value: "science", label: "Science", color: "green" },
  { value: "history", label: "History", color: "yellow" },
  { value: "math", label: "Mathematics", color: "purple" },
  { value: "technology", label: "Technology", color: "cyan" },
  { value: "business", label: "Business", color: "orange" },
  { value: "medicine", label: "Medicine", color: "red" },
  { value: "art", label: "Art", color: "pink" },
  { value: "other", label: "Other", color: "gray" }
];

export default function CreateDeck() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const deckId = searchParams.get("deck");

  const [deckData, setDeckData] = useState({
    name: "",
    description: "",
    category: "other",
    color: "blue",
    target_language: "Spanish"
  });

  const [cards, setCards] = useState([
    { front: "", back: "", tempId: Date.now() }
  ]);

  const { data: existingDeck } = useQuery({
    queryKey: ['deck', deckId],
    queryFn: () => base44.entities.Deck.filter({ id: deckId }),
    enabled: !!deckId,
  });

  const { data: existingCards } = useQuery({
    queryKey: ['deck-cards', deckId],
    queryFn: () => base44.entities.Flashcard.filter({ deck_id: deckId }),
    enabled: !!deckId,
    initialData: [],
  });

  useEffect(() => {
    if (existingDeck && existingDeck.length > 0) {
      const deck = existingDeck[0];
      setDeckData({
        name: deck.name,
        description: deck.description || "",
        category: deck.category,
        color: deck.color,
        target_language: deck.target_language || "Spanish"
      });
    }
  }, [existingDeck]);

  useEffect(() => {
    if (existingCards && existingCards.length > 0) {
      setCards(existingCards.map(card => ({
        ...card,
        tempId: card.id
      })));
    }
  }, [existingCards]);

  const saveDeckMutation = useMutation({
    mutationFn: async () => {
      let savedDeckId = deckId;

      if (deckId) {
        await base44.entities.Deck.update(deckId, {
          ...deckData,
          total_cards: cards.length
        });
      } else {
        const newDeck = await base44.entities.Deck.create({
          ...deckData,
          total_cards: cards.length
        });
        savedDeckId = newDeck.id;
      }

      const validCards = cards.filter(card => card.front.trim() && card.back.trim());

      if (deckId) {
        const existingCardIds = existingCards.map(c => c.id);
        const currentCardIds = validCards.filter(c => c.id).map(c => c.id);
        const cardsToDelete = existingCardIds.filter(id => !currentCardIds.includes(id));
        
        await Promise.all(cardsToDelete.map(id => base44.entities.Flashcard.delete(id)));
      }

      for (const card of validCards) {
        if (card.id) {
          await base44.entities.Flashcard.update(card.id, {
            front: card.front,
            back: card.back,
            deck_id: savedDeckId
          });
        } else {
          await base44.entities.Flashcard.create({
            deck_id: savedDeckId,
            front: card.front,
            back: card.back,
            next_review_date: new Date().toISOString()
          });
        }
      }

      return savedDeckId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decks'] });
      queryClient.invalidateQueries({ queryKey: ['all-flashcards'] });
      navigate(createPageUrl("Decks"));
    },
  });

  const addCard = () => {
    setCards([...cards, { front: "", back: "", tempId: Date.now() }]);
  };

  const updateCard = (index, field, value) => {
    const newCards = [...cards];
    newCards[index] = { ...newCards[index], [field]: value };
    setCards(newCards);
  };

  const deleteCard = (index) => {
    setCards(cards.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!deckData.name.trim()) {
      alert("Please enter a deck name");
      return;
    }

    const validCards = cards.filter(card => card.front.trim() && card.back.trim());
    if (validCards.length === 0) {
      alert("Please add at least one card");
      return;
    }

    saveDeckMutation.mutate();
  };

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate(createPageUrl("Decks"))}
              className="rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {deckId ? "Edit Deck" : "Create New Deck"}
              </h1>
              <p className="text-gray-500 mt-1">Build your personalized study collection</p>
            </div>
          </div>
          <Button 
            onClick={handleSave}
            disabled={saveDeckMutation.isPending}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
          >
            <Save className="w-5 h-5 mr-2" />
            {saveDeckMutation.isPending ? "Saving..." : "Save Deck"}
          </Button>
        </div>

        <Card className="p-8 bg-white/50 backdrop-blur-sm border-white/20 shadow-xl">
          <div className="space-y-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-700 font-medium">Deck Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Spanish Vocabulary"
                    value={deckData.name}
                    onChange={(e) => setDeckData({ ...deckData, name: e.target.value })}
                    className="border-gray-200 focus:border-purple-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-gray-700 font-medium">Category</Label>
                  <Select
                    value={deckData.category}
                    onValueChange={(value) => {
                      const category = CATEGORIES.find(c => c.value === value);
                      setDeckData({ ...deckData, category: value, color: category?.color || "blue" });
                    }}
                  >
                    <SelectTrigger className="border-gray-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="target_language" className="text-gray-700 font-medium">Learning Language *</Label>
                <Select
                  value={deckData.target_language}
                  onValueChange={(value) => setDeckData({ ...deckData, target_language: value })}
                >
                  <SelectTrigger className="border-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Spanish">Spanish</SelectItem>
                    <SelectItem value="French">French</SelectItem>
                    <SelectItem value="German">German</SelectItem>
                    <SelectItem value="Italian">Italian</SelectItem>
                    <SelectItem value="Portuguese">Portuguese</SelectItem>
                    <SelectItem value="Russian">Russian</SelectItem>
                    <SelectItem value="Chinese">Chinese</SelectItem>
                    <SelectItem value="Japanese">Japanese</SelectItem>
                    <SelectItem value="Korean">Korean</SelectItem>
                    <SelectItem value="Arabic">Arabic</SelectItem>
                    <SelectItem value="Hindi">Hindi</SelectItem>
                    <SelectItem value="Dutch">Dutch</SelectItem>
                    <SelectItem value="Polish">Polish</SelectItem>
                    <SelectItem value="Turkish">Turkish</SelectItem>
                    <SelectItem value="Swedish">Swedish</SelectItem>
                    <SelectItem value="Czech">Czech</SelectItem>
                    <SelectItem value="Greek">Greek</SelectItem>
                    <SelectItem value="Hebrew">Hebrew</SelectItem>
                    <SelectItem value="Thai">Thai</SelectItem>
                    <SelectItem value="Vietnamese">Vietnamese</SelectItem>
                    <SelectItem value="English">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-gray-700 font-medium">Description</Label>
              <Textarea
                id="description"
                placeholder="What will you learn from this deck?"
                value={deckData.description}
                onChange={(e) => setDeckData({ ...deckData, description: e.target.value })}
                className="border-gray-200 focus:border-purple-400 h-24"
              />
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Flashcards</h2>
              <p className="text-gray-500 mt-1">{cards.length} card{cards.length !== 1 ? 's' : ''} in this deck</p>
            </div>
            <Button
              onClick={addCard}
              variant="outline"
              className="border-purple-200 hover:bg-purple-50"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Card
            </Button>
          </div>

          <div className="space-y-4">
            {cards.map((card, index) => (
              <FlashcardEditor
                key={card.tempId}
                card={card}
                index={index}
                onUpdate={updateCard}
                onDelete={() => deleteCard(index)}
                canDelete={cards.length > 1}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}