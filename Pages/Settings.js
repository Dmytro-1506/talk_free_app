import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Settings as SettingsIcon, Globe, AlertCircle, CheckCircle, Loader2, Moon, Sun, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

const LANGUAGES = [
  "English",
  "Spanish",
  "French",
  "German",
  "Italian",
  "Portuguese",
  "Russian",
  "Chinese",
  "Japanese",
  "Korean",
  "Arabic",
  "Hindi",
  "Dutch",
  "Polish",
  "Turkish",
  "Swedish",
  "Czech",
  "Greek",
  "Hebrew",
  "Thai",
  "Vietnamese",
  "Indonesian",
  "Romanian",
  "Ukrainian",
  "Danish",
  "Finnish",
  "Norwegian"
];

export default function Settings() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [translationProgress, setTranslationProgress] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const currentTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    setDarkMode(currentTheme === 'dark');
  }, []);

  const toggleDarkMode = (enabled) => {
    setDarkMode(enabled);
    const theme = enabled ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  };

  const { data: flashcards } = useQuery({
    queryKey: ['all-flashcards'],
    queryFn: () => base44.entities.Flashcard.list(),
    initialData: [],
  });

  useEffect(() => {
    base44.auth.me().then(userData => {
      setUser(userData);
      setSelectedLanguage(userData.native_language || "English");
    }).catch(() => {});
  }, []);

  const updateLanguageMutation = useMutation({
    mutationFn: async (newLanguage) => {
      const oldLanguage = user.native_language || "English";
      
      // Update user's native language
      await base44.auth.updateMe({ native_language: newLanguage });

      // If there are flashcards and language actually changed, translate them
      if (flashcards.length > 0 && oldLanguage !== newLanguage) {
        setTranslationProgress({ current: 0, total: flashcards.length });

        // Process in batches for better performance
        const batchSize = 10;
        for (let i = 0; i < flashcards.length; i += batchSize) {
          const batch = flashcards.slice(i, i + batchSize);
          
          await Promise.all(batch.map(async (card) => {
            try {
              // Use AI to translate the back of the card to new language
              const prompt = `Translate the following text from ${oldLanguage} to ${newLanguage}. 
Only provide the direct translation, no explanations:

"${card.back}"`;

              const translation = await base44.integrations.Core.InvokeLLM({
                prompt,
                add_context_from_internet: false
              });

              // Update the card with new translation
              await base44.entities.Flashcard.update(card.id, {
                back: translation.trim()
              });

              setTranslationProgress(prev => ({
                ...prev,
                current: prev.current + 1
              }));
            } catch (error) {
              console.error(`Failed to translate card ${card.id}:`, error);
            }
          }));
        }

        setTranslationProgress(null);
      }

      return newLanguage;
    },
    onSuccess: (newLanguage) => {
      setUser(prev => ({ ...prev, native_language: newLanguage }));
      queryClient.invalidateQueries({ queryKey: ['all-flashcards'] });
    },
  });

  const handleSaveLanguage = () => {
    if (selectedLanguage === user?.native_language) {
      return;
    }

    const cardCount = flashcards.length;
    const message = cardCount > 0
      ? `Change your native language to ${selectedLanguage}? This will translate all ${cardCount} existing flashcards. This may take a few moments.`
      : `Change your native language to ${selectedLanguage}?`;

    if (window.confirm(message)) {
      updateLanguageMutation.mutate(selectedLanguage);
    }
  };

  const isTranslating = translationProgress !== null;
  const hasChanges = selectedLanguage !== user?.native_language;

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
            <SettingsIcon className="w-8 h-8 text-purple-600" />
            Settings
          </h1>
          <p className="text-gray-500 mt-1">Customize your learning experience</p>
        </div>

        {/* Theme Settings */}
        <Card className="bg-white/50 backdrop-blur-sm border-white/20 shadow-xl dark:bg-gray-800/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {darkMode ? <Moon className="w-5 h-5 text-purple-600" /> : <Sun className="w-5 h-5 text-yellow-600" />}
              Appearance
            </CardTitle>
            <CardDescription>Customize how the app looks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-gray-700 font-medium dark:text-gray-200">Dark Mode</Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">Switch between light and dark theme</p>
              </div>
              <Switch
                checked={darkMode}
                onCheckedChange={toggleDarkMode}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/50 backdrop-blur-sm border-white/20 shadow-xl dark:bg-gray-800/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-600" />
              Native Language
            </CardTitle>
            <CardDescription>
              Select your native language. All flashcard answers will be displayed in this language.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="language" className="text-gray-700 font-medium">
                  Your Native Language
                </Label>
                <Select 
                  value={selectedLanguage} 
                  onValueChange={setSelectedLanguage}
                  disabled={isTranslating}
                >
                  <SelectTrigger id="language" className="border-gray-200">
                    <SelectValue placeholder="Select your native language" />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map(lang => (
                      <SelectItem key={lang} value={lang}>
                        {lang}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {flashcards.length > 0 && hasChanges && !isTranslating && (
                <Alert className="bg-blue-50 border-blue-200">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    Changing your language will automatically translate all {flashcards.length} flashcard answers to {selectedLanguage}.
                  </AlertDescription>
                </Alert>
              )}

              {isTranslating && (
                <Alert className="bg-purple-50 border-purple-200">
                  <Loader2 className="h-4 w-4 text-purple-600 animate-spin" />
                  <AlertDescription className="text-purple-800">
                    <div className="space-y-2">
                      <p className="font-medium">Translating your flashcards...</p>
                      <p className="text-sm">
                        {translationProgress.current} of {translationProgress.total} cards completed
                      </p>
                      <Progress 
                        value={(translationProgress.current / translationProgress.total) * 100} 
                        className="h-2"
                      />
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {!isTranslating && !hasChanges && user && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Your native language is set to {user.native_language}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <Button
              onClick={handleSaveLanguage}
              disabled={!hasChanges || isTranslating || updateLanguageMutation.isPending}
              className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
              size="lg"
            >
              {isTranslating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Translating...
                </>
              ) : updateLanguageMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white/50 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {user && (
              <>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600">Email</span>
                  <span className="font-medium text-gray-900">{user.email}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600">Full Name</span>
                  <span className="font-medium text-gray-900">{user.full_name}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600">Role</span>
                  <span className="font-medium text-gray-900 capitalize">{user.role}</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-600">Current Language</span>
                  <span className="font-medium text-gray-900">{user.native_language || "English"}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Level Test */}
        <Card className="bg-white/50 backdrop-blur-sm border-white/20 dark:bg-gray-800/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-purple-600" />
              Language Level Test
            </CardTitle>
            <CardDescription>Discover your proficiency level in any language</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 mb-4 dark:text-gray-400">
              Take a comprehensive test with vocabulary, grammar, and sentence construction questions to determine your CEFR level (A1-C1).
            </p>
            <Link to={createPageUrl("LevelTest")}>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                <GraduationCap className="w-5 h-5 mr-2" />
                Take Level Test
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-white/50 backdrop-blur-sm border-white/20 border-red-100 dark:bg-gray-800/50">
          <CardHeader>
            <CardTitle className="text-red-600">Logout</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 mb-4 dark:text-gray-400">Sign out of your account</p>
            <Button
              variant="destructive"
              onClick={() => base44.auth.logout("/Landing")}
              className="bg-red-600 hover:bg-red-700"
            >
              Logout
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}