import { Home, Zap, BarChart3, LogOut, Settings, PiggyBank, Landmark } from "lucide-react";

interface SidebarIconsProps {
    icon: "home" | "transactions" | "financing" | "movement" | "logout" | "preferences" | "savings";
}

export function SidebarIcons({ icon }: SidebarIconsProps) {
    const iconProps = {
        size: 24,
        className: "group-hover:scale-110 transition-transform shrink-0",
    };

    const iconSize20 = {
        size: 20,
        className: "shrink-0",
    };

    switch (icon) {
        case "home":
            return <Home {...iconProps} />;
        case "transactions":
            return <Zap {...iconProps} />;
        case "financing":
            return <Landmark {...iconProps} />;
        case "movement":
            return <BarChart3 {...iconProps} />;
        case "logout":
            return <LogOut {...iconSize20} />;
        case "preferences":
            return <Settings {...iconProps} />;
        case "savings":
            return <PiggyBank {...iconProps} />;
        default:
            return <Home {...iconProps} />;
    }
}
