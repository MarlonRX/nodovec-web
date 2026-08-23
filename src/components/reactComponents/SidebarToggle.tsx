import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";

export function SidebarToggle() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const stored = localStorage.getItem("sidebarOpen");
        if (stored !== null) {
            setIsOpen(stored === "true");
        }
    }, []);

    useEffect(() => {
        const sidebar = document.getElementById("sidebar");
        if (!sidebar) return;

        if (isOpen) {
            sidebar.classList.add("open");
            sidebar.classList.remove("collapsed");
            localStorage.setItem("sidebarOpen", "true");
        } else {
            sidebar.classList.add("collapsed");
            sidebar.classList.remove("open");
            localStorage.setItem("sidebarOpen", "false");
        }
    }, [isOpen]);

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    return (
        <button
            onClick={toggleSidebar}
            className="w-full h-full flex items-center justify-center transition-colors duration-200 focus:outline-none rounded-none"
            style={{
                color: "var(--accent-primary)",
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = `rgba(var(--accent-primary-rgb), 0.15)`;
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
            }}
            aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
            aria-expanded={isOpen}
            title={isOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
            {isOpen ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
        </button>
    );
}
