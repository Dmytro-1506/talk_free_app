import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageCircle } from "lucide-react";
import StartOptions from "../components/dialogue/StartOptions";
import NewDialogueSetup from "../components/dialogue/NewDialogueSetup";
import SavedDialoguesList from "../components/dialogue/SavedDialoguesList";
import DialogueChat from "../components/dialogue/DialogueChat";

export default function DialoguePractice() {
  const queryClient = useQueryClient();
  const [view, setView] = useState("start"); // start, new, saved, chat
  const [currentSession, setCurrentSession] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: sessions } = useQuery({
    queryKey: ['dialogue-sessions'],
    queryFn: () => base44.entities.DialogueSession.list('-created_date', 50),
    initialData: [],
  });

  const createSessionMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.DialogueSession.create({
        topic_id: data.topicId,
        topic_title: data.topicTitle,
        language: data.language,
        prompt: data.prompt,
        messages: [],
        status: "active"
      });
    },
    onSuccess: (session, variables) => {
      queryClient.invalidateQueries({ queryKey: ['dialogue-sessions'] });
      setCurrentSession({
        ...session,
        prompt: variables.prompt
      });
      setView("chat");
    }
  });

  const updateSessionMutation = useMutation({
    mutationFn: async ({ id, messages }) => {
      await base44.entities.DialogueSession.update(id, { messages });
    }
  });

  const deleteSessionMutation = useMutation({
    mutationFn: (id) => base44.entities.DialogueSession.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dialogue-sessions'] });
    }
  });

  const handleStartNew = (config) => {
    createSessionMutation.mutate(config);
  };

  const handleContinueSession = (session) => {
    // Find the prompt from standard topics or use a generic one
    const standardPrompts = {
      "hotel": "You are a friendly hotel receptionist. Help the guest book a room, answer questions about amenities, prices, and services. Keep responses short and natural.",
      "coworkers": "You are a new coworker meeting someone for the first time at the office. Introduce yourself, ask about their role, and make friendly conversation. Keep responses short and natural.",
      "directions": "You are a helpful local person giving directions. Help the tourist find places like the train station, museum, restaurant, etc. Use landmarks and simple directions. Keep responses short.",
      "restaurant": "You are a waiter at a restaurant. Help the customer with the menu, take their order, and handle requests. Keep responses short and natural.",
      "shopping": "You are a store clerk helping a customer. Help them find products, discuss prices, sizes, and colors. Keep responses short and natural.",
      "airport": "You are an airport staff member. Help travelers with check-in, boarding passes, gate information, and general airport questions. Keep responses short."
    };

    const prompt = session.prompt || standardPrompts[session.topic_id] || 
      `You are role-playing a scenario about: "${session.topic_title}". Act naturally as an appropriate character for this scenario. Keep responses short and conversational.`;

    setCurrentSession({
      ...session,
      prompt
    });
    setView("chat");
  };

  const handleUpdateMessages = (messages) => {
    if (currentSession?.id) {
      updateSessionMutation.mutate({ id: currentSession.id, messages });
    }
  };

  const handleBackToStart = () => {
    setView("start");
    setCurrentSession(null);
  };

  if (view === "chat" && currentSession) {
    return (
      <DialogueChat
        session={currentSession}
        onBack={handleBackToStart}
        onUpdate={handleUpdateMessages}
        user={user}
      />
    );
  }

  if (view === "new") {
    return (
      <NewDialogueSetup
        onBack={() => setView("start")}
        onStart={handleStartNew}
      />
    );
  }

  if (view === "saved") {
    return (
      <SavedDialoguesList
        sessions={sessions}
        onBack={() => setView("start")}
        onSelect={handleContinueSession}
        onDelete={(id) => deleteSessionMutation.mutate(id)}
      />
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center justify-center gap-3">
            <MessageCircle className="w-8 h-8 text-purple-600" />
            Dialogue Practice
          </h1>
          <p className="text-gray-500 mt-2">Practice real conversations with AI using voice</p>
        </div>

        <StartOptions
          onNewDialogue={() => setView("new")}
          onContinue={() => setView("saved")}
          hasSavedDialogues={sessions.length > 0}
        />
      </div>
    </div>
  );
}