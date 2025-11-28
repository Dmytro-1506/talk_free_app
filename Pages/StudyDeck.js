import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, RotateCcw, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import StudyCard from "../components/study/StudyCard";
import DifficultyButtons from "../components/study/DifficultyButtons";
import SessionComplete from "../components/study/SessionComplete";

export default function StudyDeck() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const deckId = searchParams.get("deck");

  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [studiedCards, setStudiedCards] = useState(new Set());

  const { data: deck } = useQuery({
    queryKey: ['deck', deckId],
    queryFn: async () => {
      const decks = await base44.entities.Deck.filter({ id: deckId });
      return decks[0];
    },
    enabled: !!deckId,
  });

  const { data: flashcards, isLoading } = useQuery({
    queryKey: ['deck-flashcards', deckId],
    queryFn: () => base44.entities.Flashcard.filter({ deck_id: deckId }),
    enabled: !!deckId,
    initialData: [],
  });

  const cardsToStudy = flashcards.filter(card => {
    if (!card.next_review_date) return true;
    return new Date(card.next_review_date) <= new Date();
  });

  const updateCardMutation = useMutation({
    mutationFn: ({ cardId, quality }) => {
      const card = flashcards.find(c => c.id === cardId);
      const now = new Date();

      let newEaseFactor = card.ease_factor;
      let newInterval = card.interval;
      let newRepetitions = card.repetitions;
      let newDifficulty = card.difficulty;

      if (quality >= 3) {
        if (newRepetitions === 0) {
          newInterval = 1;
        } else if (newRepetitions === 1) {
          newInterval = 6;
        } else {
          newInterval = Math.round(newInterval * newEaseFactor);
        }
        newRepetitions += 1;

        newEaseFactor = Math.max(1.3, newEaseFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));

        if (newRepetitions >= 3) {
          newDifficulty = "review";
        } else {
          newDifficulty = "learning";
        }

        if (newRepetitions >= 5 && newInterval >= 21) {
          newDifficulty = "mastered";
        }
      } else {
        newRepetitions = 0;
        newInterval = 1;
        newDifficulty = "learning";
      }

      const nextReviewDate = new Date(now);
      nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

      return base44.entities.Flashcard.update(cardId, {
        ease_factor: newEaseFactor,
        interval: newInterval,
        repetitions: newRepetitions,
        difficulty: newDifficulty,
        next_review_date: nextReviewDate.toISOString(),
        last_reviewed: now.toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deck-flashcards', deckId] });
      queryClient.invalidateQueries({ queryKey: ['all-flashcards'] });
    },
  });

  const handleAnswer = async (quality) => {
    const currentCard = cardsToStudy[currentCardIndex];
    setStudiedCards(prev => new Set([...prev, currentCard.id]));
    
    await updateCardMutation.mutateAsync({ cardId: currentCard.id, quality });

    if (currentCardIndex < cardsToStudy.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
    } else {
      setSessionComplete(true);
    }
  };

  const handleRestart = () => {
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setSessionComplete(false);
    setStudiedCards(new Set());
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading your cards...</p>
        </div>
      </div>
    );
  }

  if (cardsToStudy.length === 0) {
    return (
      <div className="min-h-screen p-6 md:p-8">
        <div className="max-w-2xl mx-auto">
          <Button
            variant="outline"
            onClick={() => navigate(createPageUrl("Decks"))}
            className="mb-6 rounded-full"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Decks
          </Button>
          <div className="text-center py-16 bg-white/50 backdrop-blur-sm rounded-3xl">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">All Caught Up!</h2>
            <p className="text-gray-500 mb-6">
              No cards due for review. Come back later to continue learning.
            </p>
            <Button
              onClick={() => navigate(createPageUrl("Decks"))}
              className="bg-gradient-to-r from-blue-600 to-purple-600"
            >
              Back to Decks
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (sessionComplete) {
    return (
      <SessionComplete
        deck={deck}
        cardsStudied={studiedCards.size}
        onRestart={handleRestart}
        onBackToDeck={() => navigate(createPageUrl("Decks"))}
      />
    );
  }

  const currentCard = cardsToStudy[currentCardIndex];
  const progress = ((currentCardIndex + 1) / cardsToStudy.length) * 100;

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => navigate(createPageUrl("Decks"))}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Exit
          </Button>
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900">{deck?.name}</h2>
            <p className="text-sm text-gray-500">
              Card {currentCardIndex + 1} of {cardsToStudy.length}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleRestart}
            className="rounded-full"
          >
            <RotateCcw className="w-5 h-5" />
          </Button>
        </div>

        <Progress value={progress} className="h-2" />

        <StudyCard
          card={currentCard}
          isFlipped={isFlipped}
          onFlip={() => setIsFlipped(!isFlipped)}
          targetLanguage={deck?.target_language || "Spanish"}
        />

        {isFlipped && (
          <DifficultyButtons onAnswer={handleAnswer} />
        )}
      </div>
    </div>
  );
}