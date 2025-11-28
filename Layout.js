import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { BookOpen, LayoutDashboard, BarChart3, Sparkles, Search, Settings, MessageCircle, GraduationCap } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const navigationItems = [
  {
    title: "Home",
    url: createPageUrl("Home"),
    icon: LayoutDashboard,
  },
  {
    title: "Learn Words",
    url: createPageUrl("LearnWords"),
    icon: BookOpen,
  },
  {
    title: "Learn Grammar",
    url: createPageUrl("GrammarPractice"),
    icon: GraduationCap,
  },
  {
    title: "Dialogue Practice",
    url: createPageUrl("DialoguePractice"),
    icon: MessageCircle,
  },
  {
    title: "Word Research",
    url: createPageUrl("WordResearch"),
    icon: Search,
  },
  {
    title: "Statistics",
    url: createPageUrl("Statistics"),
    icon: BarChart3,
  },
  {
    title: "Settings",
    url: createPageUrl("Settings"),
    icon: Settings,
  },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();

  // Initialize theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  return (
    <SidebarProvider>
      <style>{`
        :root {
          --bg: #F5F5F7;
          --surface: #E8EDF9;
          --accent-1: #2563EB;
          --accent-2: #7C3AED;
          --text: #000000;
          --muted: #374151;
          --border: #E6E9F2;
          --on-accent: #FFFFFF;
        }
        [data-theme="dark"] {
          --bg: #0F1724;
          --surface: #1F2937;
          --accent-1: #60A5FA;
          --accent-2: #A78BFA;
          --text: #FFFFFF;
          --muted: #9CA3AF;
          --border: #374151;
          --on-accent: #0F1724;
        }
        html, body {
          background-color: var(--bg);
          color: var(--text);
          transition: background-color 180ms ease, color 180ms ease;
        }
        [data-theme="dark"] .text-gray-900 { color: var(--text); }
        [data-theme="dark"] .text-gray-700,
        [data-theme="dark"] .text-gray-600,
        [data-theme="dark"] .text-gray-500 { color: var(--muted); }
        [data-theme="dark"] .bg-white,
        [data-theme="dark"] .bg-gray-50,
        [data-theme="dark"] .bg-gray-100 { background-color: var(--surface); }
        [data-theme="dark"] .border-gray-100,
        [data-theme="dark"] .border-gray-200 { border-color: var(--border); }
        [data-theme="dark"] .bg-white\\/50,
        [data-theme="dark"] .bg-white\\/60,
        [data-theme="dark"] .bg-white\\/70,
        [data-theme="dark"] .bg-white\\/80 { background-color: var(--surface); }
        [data-theme="dark"] input,
        [data-theme="dark"] textarea,
        [data-theme="dark"] select { background-color: var(--surface); color: var(--text); border-color: var(--border); }
        [data-theme="dark"] .bg-blue-50 { background-color: rgba(96, 165, 250, 0.15); }
        [data-theme="dark"] .bg-green-50 { background-color: rgba(34, 197, 94, 0.15); }
        [data-theme="dark"] .bg-purple-50 { background-color: rgba(167, 139, 250, 0.15); }
        [data-theme="dark"] .bg-red-50 { background-color: rgba(248, 113, 113, 0.15); }
        [data-theme="dark"] .bg-orange-50 { background-color: rgba(251, 146, 60, 0.15); }
        [data-theme="dark"] [data-radix-popper-content-wrapper] > div { background-color: var(--surface) !important; border-color: var(--border) !important; }
        [data-theme="dark"] [data-sidebar] { background-color: #1F2937 !important; }
        [data-theme="dark"] aside { background-color: #1F2937 !important; }
      `}</style>
      <div className="min-h-screen flex w-full" style={{ backgroundColor: 'var(--bg)' }}>
        <Sidebar className="border-r" style={{ borderColor: 'var(--border)', backgroundColor: 'color-mix(in srgb, var(--surface) 70%, transparent)' }}>
          <SidebarHeader className="border-b p-6" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Talk Free
                </h2>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>Learn Languages</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-3">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-2">
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`rounded-xl transition-all duration-300 ${
                          location.pathname === item.url 
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/30' 
                            : ''
                        }`}
                        style={location.pathname !== item.url ? { color: 'var(--text)' } : {}}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="border-b px-6 py-4 md:hidden" style={{ backgroundColor: 'color-mix(in srgb, var(--surface) 70%, transparent)', borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-4">
              <SidebarTrigger className="p-2 rounded-lg transition-colors" style={{ color: 'var(--text)' }} />
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" style={{ color: 'var(--accent-2)' }} />
                <h1 className="text-lg font-bold" style={{ color: 'var(--text)' }}>Talk Free</h1>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}