import { Home, Zap, BarChart3, LogOut, Settings, CreditCard } from "lucide-react";

interface SidebarIconsProps {
    icon: "home" | "transactions" | "cards" | "movement" | "logout" | "preferences";
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
        case "cards":
            return <CreditCard {...iconProps} />;
        case "movement":
            return <BarChart3 {...iconProps} />;
        case "logout":
            return <LogOut {...iconSize20} />;
        case "preferences":
            return <Settings {...iconProps} />;
        default:
            return <Home {...iconProps} />;
    }
}
