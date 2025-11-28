import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Plus, BookOpen, TrendingUp, Target, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import DeckCard from "../components/decks/DeckCard";
import WelcomeHero from "../components/decks/WelcomeHero";
import StatsOverview from "../components/decks/StatsOverview";

export default function Decks() {
  const queryClient = useQueryClient();

  const { data: decks, isLoading } = useQuery({
    queryKey: ['decks'],
    queryFn: () => base44.entities.Deck.list("-created_date"),
    initialData: [],
  });

  const { data: flashcards } = useQuery({
    queryKey: ['all-flashcards'],
    queryFn: () => base44.entities.Flashcard.list(),
    initialData: [],
  });

  const deleteDeckMutation = useMutation({
    mutationFn: async (deckId) => {
      // Delete all flashcards in the deck first
      const deckCards = flashcards.filter(card => card.deck_id === deckId);
      await Promise.all(deckCards.map(card => base44.entities.Flashcard.delete(card.id)));
      // Then delete the deck
      await base44.entities.Deck.delete(deckId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decks'] });
      queryClient.invalidateQueries({ queryKey: ['all-flashcards'] });
    },
  });

  const handleDeleteDeck = (deckId) => {
    if (window.confirm("Are you sure you want to delete this deck? All cards will be removed.")) {
      deleteDeckMutation.mutate(deckId);
    }
  };

  const totalCards = flashcards.length;
  const cardsToReview = flashcards.filter(card => {
    if (!card.next_review_date) return true;
    return new Date(card.next_review_date) <= new Date();
  }).length;
  const masteredCards = flashcards.filter(card => card.difficulty === "mastered").length;

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <WelcomeHero />
        
        <StatsOverview 
          totalCards={totalCards}
          cardsToReview={cardsToReview}
          masteredCards={masteredCards}
          decksCount={decks.length}
        />

        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Your Study Decks</h2>
            <p className="text-gray-500 mt-1">Organize your learning by topic</p>
          </div>
          <Link to={createPageUrl("CreateDeck")}>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/30">
              <Plus className="w-5 h-5 mr-2" />
              New Deck
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-white/50 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : decks.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 bg-white/50 backdrop-blur-sm rounded-3xl border border-white/20"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
              <BookOpen className="w-10 h-10 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Start Your Learning Journey</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Create your first deck to begin studying with our smart spaced repetition system
            </p>
            <Link to={createPageUrl("CreateDeck")}>
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Plus className="w-5 h-5 mr-2" />
                Create First Deck
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {decks.map((deck) => {
                const deckCards = flashcards.filter(card => card.deck_id === deck.id);
                const dueCards = deckCards.filter(card => {
                  if (!card.next_review_date) return true;
                  return new Date(card.next_review_date) <= new Date();
                }).length;

                return (
                  <DeckCard
                    key={deck.id}
                    deck={deck}
                    cardCount={deckCards.length}
                    dueCount={dueCards}
                    onDelete={() => handleDeleteDeck(deck.id)}
                  />
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}