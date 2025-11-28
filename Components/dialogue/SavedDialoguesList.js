import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft, MessageCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function SavedDialoguesList({ sessions, onBack, onSelect, onDelete }) {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <Button variant="ghost" onClick={onBack} className="mb-6 gap-2">
        <ArrowLeft className="w-4 h-4" />
        Back
      </Button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Saved Dialogues</h2>
          <p className="text-gray-500">Continue a previous conversation</p>
        </div>

        <div className="space-y-3">
          {sessions.map((session, index) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="p-4 bg-white/60 backdrop-blur-sm border-white/20 hover:shadow-lg transition-all">
                <div className="flex items-center justify-between gap-4">
                  <div 
                    className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer"
                    onClick={() => onSelect(session)}
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 truncate">{session.topic_title}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <Badge variant="outline" className="text-purple-600 border-purple-200">
                          {session.language}
                        </Badge>
                        <span>•</span>
                        <span>{session.messages?.length || 0} messages</span>
                        <span>•</span>
                        <span>{format(new Date(session.created_date), "MMM d, h:mm a")}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => onSelect(session)}
                      className="bg-gradient-to-r from-blue-600 to-purple-600"
                    >
                      Continue
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onDelete(session.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}