import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "@/components/ui/theme-provider";

export default function ThemeModeSwitcher() {
  const { theme, setTheme } = useTheme();

  const themes = [
    {
      value: "light",
      label: "Sáng",
      icon: Sun,
    },
    {
      value: "dark",
      label: "Tối",
      icon: Moon,
    },
    {
      value: "system",
      label: "Hệ thống",
      icon: Monitor,
    },
  ];

  const currentTheme = themes.find((t) => t.value === theme) || themes[2];
  const CurrentIcon = currentTheme.icon;

  return (
    <div className="flex items-center gap-2 w-full">
      <CurrentIcon className="h-4 w-4" />
      <span className="flex-1">Chủ đề</span>
      <div className="flex items-center gap-1">
        {themes.map((themeOption) => {
          const Icon = themeOption.icon;
          return (
            <button
              key={themeOption.value}
              onClick={() => setTheme(themeOption.value as any)}
              className={`
                p-1.5 rounded-md transition-colors hover:bg-accent
                ${
                  theme === themeOption.value
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }
              `}
              title={themeOption.label}
            >
              <Icon className="h-3.5 w-3.5" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
