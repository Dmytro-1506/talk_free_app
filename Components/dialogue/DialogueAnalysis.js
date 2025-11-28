import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { X, Loader2, AlertCircle, Lightbulb, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DialogueAnalysis({ messages, language, nativeLanguage, onClose }) {
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    analyzeDialogue();
  }, []);

  const analyzeDialogue = async () => {
    const userMessages = messages.filter(m => m.role === "user").map(m => m.content);
    
    if (userMessages.length === 0) {
      setAnalysis({ error: "No messages to analyze yet. Keep practicing!" });
      setIsLoading(false);
      return;
    }

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a language teacher analyzing a student's ${language} conversation practice.

Here are the student's messages:
${userMessages.map((m, i) => `${i + 1}. "${m}"`).join("\n")}

Provide a detailed analysis with:
1. CORRECTIONS: List any grammar or vocabulary mistakes, with the correct version
2. SUGGESTED PHRASES: Provide 5-6 useful phrases the student could use in this type of conversation
3. OVERALL FEEDBACK: Brief encouraging feedback about their performance

Provide translations to ${nativeLanguage} for all corrections and suggestions.`,
      response_json_schema: {
        type: "object",
        properties: {
          corrections: {
            type: "array",
            items: {
              type: "object",
              properties: {
                original: { type: "string" },
                corrected: { type: "string" },
                explanation: { type: "string" }
              }
            }
          },
          suggested_phrases: {
            type: "array",
            items: {
              type: "object",
              properties: {
                phrase: { type: "string" },
                translation: { type: "string" },
                when_to_use: { type: "string" }
              }
            }
          },
          overall_feedback: { type: "string" }
        }
      }
    });

    setAnalysis(response);
    setIsLoading(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl max-h-[80vh]"
        >
          <Card className="bg-white overflow-hidden">
            <CardHeader className="border-b flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                Dialogue Analysis
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                <X className="w-5 h-5" />
              </Button>
            </CardHeader>

            <ScrollArea className="max-h-[60vh]">
              <CardContent className="p-6 space-y-6">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="w-10 h-10 text-purple-600 animate-spin mb-4" />
                    <p className="text-gray-500">Analyzing your conversation...</p>
                  </div>
                ) : analysis?.error ? (
                  <div className="text-center py-8 text-gray-500">
                    {analysis.error}
                  </div>
                ) : (
                  <>
                    {/* Overall Feedback */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                        <p className="text-green-800">{analysis.overall_feedback}</p>
                      </div>
                    </div>

                    {/* Corrections */}
                    {analysis.corrections?.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-orange-500" />
                          Corrections
                        </h3>
                        <div className="space-y-3">
                          {analysis.corrections.map((correction, index) => (
                            <div key={index} className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                              <div className="flex items-start gap-3">
                                <Badge className="bg-red-100 text-red-700 flex-shrink-0">Original</Badge>
                                <p className="text-gray-700 line-through">{correction.original}</p>
                              </div>
                              <div className="flex items-start gap-3 mt-2">
                                <Badge className="bg-green-100 text-green-700 flex-shrink-0">Correct</Badge>
                                <p className="text-gray-900 font-medium">{correction.corrected}</p>
                              </div>
                              <p className="text-sm text-gray-500 mt-2 pl-2 border-l-2 border-orange-200">
                                {correction.explanation}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {analysis.corrections?.length === 0 && (
                      <div className="bg-green-50 rounded-xl p-4 border border-green-100 text-center">
                        <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                        <p className="text-green-700 font-medium">Great job! No corrections needed.</p>
                      </div>
                    )}

                    {/* Suggested Phrases */}
                    {analysis.suggested_phrases?.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Lightbulb className="w-5 h-5 text-yellow-500" />
                          Useful Phrases for This Scenario
                        </h3>
                        <div className="space-y-3">
                          {analysis.suggested_phrases.map((phrase, index) => (
                            <div key={index} className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                              <p className="font-medium text-gray-900">{phrase.phrase}</p>
                              <p className="text-sm text-gray-600 mt-1">{phrase.translation}</p>
                              <p className="text-xs text-blue-600 mt-2">💡 {phrase.when_to_use}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </ScrollArea>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}