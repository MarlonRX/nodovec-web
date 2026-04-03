import { Menu, X } from 'lucide-react';
import { useState } from 'react';

interface MenuToggleProps {
    isSidebar?: boolean;
}

export function MenuToggle({ isSidebar = false }: MenuToggleProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handleClick = () => {
        setIsOpen(!isOpen);

        if (isSidebar) {
            const sidebar = document.getElementById("sidebar");
            if (sidebar) {
                sidebar.classList.toggle("hidden");
            }
        } else {
            const mobileMenu = document.getElementById("mobile-menu");
            if (mobileMenu) {
                mobileMenu.classList.toggle("hidden");
            }
        }
    };

    const buttonId = isSidebar ? "sidebar-toggle" : "mobile-menu-button";

    return (
        <button
            id={buttonId}
            onClick={handleClick}
            className="p-2 rounded-md transition-colors duration-200 focus:outline-none"
            style={{
                color: "var(--accent-primary)",
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(212, 175, 55, 0.1)";
                e.currentTarget.style.color = "var(--accent-hover)";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "var(--accent-primary)";
            }}
            aria-label={isSidebar ? "Toggle sidebar" : "Toggle mobile menu"}
            aria-expanded={isOpen}
        >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
    );
}
