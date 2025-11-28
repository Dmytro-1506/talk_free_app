import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const LANGUAGES = [
  "Spanish", "French", "German", "Italian", "Portuguese", 
  "Russian", "Chinese", "Japanese", "Korean", "Arabic",
  "Dutch", "Polish", "Turkish", "Swedish", "Greek"
];

export default function LanguageSelector({ value, onChange }) {
  return (
    <div className="space-y-2">
      <Label className="text-gray-700 font-medium">Practice Language</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="border-gray-200 bg-white">
          <SelectValue placeholder="Select language" />
        </SelectTrigger>
        <SelectContent>
          {LANGUAGES.map(lang => (
            <SelectItem key={lang} value={lang}>{lang}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}