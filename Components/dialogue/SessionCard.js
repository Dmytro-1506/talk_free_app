import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle, Trash2 } from "lucide-react";
import { format } from "date-fns";

export default function SessionCard({ session, onContinue, onDelete }) {
  const messageCount = session.messages?.length || 0;

  return (
    <motion.div whileHover={{ scale: 1.01 }}>
      <Card className="p-4 bg-white/60 backdrop-blur-sm border-white/20 hover:shadow-lg transition-all">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 truncate">{session.topic_title}</h4>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>{messageCount} messages</span>
                <span>•</span>
                <span>{format(new Date(session.created_date), "MMM d, h:mm a")}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-purple-600 border-purple-200">
              {session.language}
            </Badge>
            <Button size="sm" onClick={onContinue} className="bg-gradient-to-r from-blue-600 to-purple-600">
              Continue
            </Button>
            <Button size="icon" variant="ghost" onClick={onDelete} className="text-gray-400 hover:text-red-500">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}