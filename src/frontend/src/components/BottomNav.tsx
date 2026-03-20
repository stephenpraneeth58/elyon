import { BarChart2, Calendar, Home, Play } from "lucide-react";
import { motion } from "motion/react";

export type Tab = "home" | "calendar" | "focus" | "progress";

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const tabs: { id: Tab; icon: typeof Home; label: string }[] = [
  { id: "home", icon: Home, label: "Home" },
  { id: "calendar", icon: Calendar, label: "Calendar" },
  { id: "focus", icon: Play, label: "Focus" },
  { id: "progress", icon: BarChart2, label: "Progress" },
];

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-surface border-t border-border safe-bottom z-50"
      data-ocid="nav.panel"
    >
      <div className="flex items-center justify-around px-2 pt-2 pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              type="button"
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex flex-col items-center gap-0.5 px-4 py-2 relative"
              data-ocid={`nav.${tab.id}.link`}
              aria-label={tab.label}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gold rounded-full"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon
                size={22}
                className={isActive ? "text-gold" : "text-muted-foreground"}
                strokeWidth={isActive ? 2 : 1.5}
              />
              <span
                className={`text-[10px] font-medium ${
                  isActive ? "text-gold" : "text-muted-foreground"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
