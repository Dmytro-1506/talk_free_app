import React, { useState } from "react";
import { Plus, Check, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SpeakButton from "../shared/SpeakButton";

export default function WordResultCard({ title, icon: Icon, items, onAddToFlashcards, type, decks, onAddMultiple, targetLanguage }) {
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [selectedDeck, setSelectedDeck] = useState("");
  const [addedItems, setAddedItems] = useState(new Set());

  const toggleItem = (index) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedItems(newSelected);
  };

  const handleAddSelected = () => {
    if (selectedItems.size === 0) {
      alert("Please select at least one item");
      return;
    }
    if (!selectedDeck) {
      alert("Please select a deck");
      return;
    }

    const cards = Array.from(selectedItems).map(index => {
      const item = items[index];
      return {
        front: type === "word" ? item.word : item.phrase,
        back: item.translation
      };
    });

    onAddMultiple(cards, selectedDeck);
    setAddedItems(new Set([...addedItems, ...selectedItems]));
    setSelectedItems(new Set());
  };

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <Card className="bg-white/50 backdrop-blur-sm border-white/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Icon className="w-5 h-5 text-purple-600" />
            {title}
          </CardTitle>
          {selectedItems.size > 0 && (
            <div className="flex items-center gap-2">
              <Select value={selectedDeck} onValueChange={setSelectedDeck}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select deck" />
                </SelectTrigger>
                <SelectContent>
                  {decks.map(deck => (
                    <SelectItem key={deck.id} value={deck.id}>
                      {deck.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size="sm"
                onClick={handleAddSelected}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add ({selectedItems.size})
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map((item, index) => {
            const isSelected = selectedItems.has(index);
            const isAdded = addedItems.has(index);
            const displayText = type === "word" ? item.word : item.phrase;
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`group p-4 rounded-xl border-2 transition-all duration-300 ${
                  isSelected 
                    ? 'bg-purple-50 border-purple-300' 
                    : isAdded
                    ? 'bg-green-50 border-green-200'
                    : 'bg-white/60 border-gray-100 hover:border-purple-200 hover:bg-purple-50/50'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-gray-900 break-words flex-1">{displayText}</p>
                      <SpeakButton 
                        text={displayText} 
                        language={targetLanguage}
                        size="sm"
                        className="h-7 w-7 flex-shrink-0"
                      />
                    </div>
                    <p className="text-sm text-gray-600 break-words">{item.translation}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {isAdded ? (
                      <div className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                    ) : (
                      <>
                        <Button
                          size="icon"
                          variant={isSelected ? "default" : "outline"}
                          onClick={() => toggleItem(index)}
                          className={`rounded-full transition-all ${
                            isSelected 
                              ? 'bg-purple-600 hover:bg-purple-700' 
                              : 'hover:bg-purple-50 hover:border-purple-300'
                          }`}
                        >
                          {isSelected ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Plus className="w-4 h-4" />
                          )}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}