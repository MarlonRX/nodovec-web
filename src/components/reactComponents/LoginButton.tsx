import { User, LogOut, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { translate } from "../../i18n";
import { authStore, type AuthUser } from "../../store/auth";
import { logoutUser } from "../../services/userServices";
import { toast } from "sonner";
import { MyButton } from "../ui/my-button";
import { ThemeSwitcher } from "./ThemeSwitcher";

export function LoginButton() {
    const [loginText, setLoginText] = useState("Log in");
    const [authenticatedUser, setAuthenticatedUser] = useState<AuthUser | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const buttonRef = useRef<HTMLButtonElement | null>(null);
    const [modalPos, setModalPos] = useState<{ top: number; left: number } | null>(null);

    const computeModalPosition = () => {
        const btn = buttonRef.current;
        if (!btn) return;
        const rect = btn.getBoundingClientRect();
        const width = 288; // matches w-72
        const top = Math.min(rect.bottom + 8, window.innerHeight - 8);
        let left = rect.right - width;
        if (left < 8) left = 8;
        setModalPos({ top, left });
    };

    useEffect(() => {
        if (!isModalOpen) return;
        computeModalPosition();
        const onChange = () => computeModalPosition();
        window.addEventListener("resize", onChange);
        window.addEventListener("scroll", onChange, true);
        return () => {
            window.removeEventListener("resize", onChange);
            window.removeEventListener("scroll", onChange, true);
        };
    }, [isModalOpen]);

    useEffect(() => {
        // Cargar la traducción inicial
        setLoginText(translate("navbar.login"));

        // Obtener usuario actual del store
        setAuthenticatedUser(authStore.getUser());

        // Suscribirse a cambios del store
        const unsubscribe = authStore.subscribe((state) => {
            setAuthenticatedUser(state.user);
        });

        // Escuchar cambios de idioma
        const handleLanguageChange = () => {
            setLoginText(translate("navbar.login"));
        };

        window.addEventListener("languageChanged", handleLanguageChange);

        return () => {
            window.removeEventListener("languageChanged", handleLanguageChange);
            unsubscribe();
        };
    }, []);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            const result = await logoutUser();
            if (result.response) {
                authStore.logout();
                toast.success(result.message || "Logged out successfully");
                setIsModalOpen(false);
                setTimeout(() => {
                    window.location.href = "/login";
                }, 500);
            } else {
                toast.error(result.message || "Logout failed");
                authStore.logout();
            }
        } catch (error) {
            console.error("Logout error:", error);
            toast.error("An error occurred while logging out");
            authStore.logout();
        } finally {
            setIsLoggingOut(false);
        }
    };

    // FRAGMENTO 1: Sin usuario autenticado - Redirige a login
    if (authenticatedUser === null) {
        return (
            <div className="flex items-center space-x-3">
                <a
                    href="/login"
                    className="flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200 shadow-md hover:shadow-lg font-medium text-sm focus:outline-none"
                    style={{
                        background: 'var(--accent-primary)',
                        color: 'var(--text-inverted)',
                        border: "none",
                    }}
                    aria-label="Login"
                >
                    <div
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{
                            backgroundColor: "rgba(255, 255, 255, 0.2)",
                        }}
                    >
                        <User size={20} />
                    </div>
                    <span className="text-sm font-medium">{loginText}</span>
                </a>
            </div>
        );
    }

    // FRAGMENTO 2: Con usuario autenticado - Avatar, nombre y logout
    return (
        <div className="relative">
            {/* Botón que abre el modal */}
            <button
                ref={buttonRef}
                onClick={() => {
                    const willOpen = !isModalOpen;
                    setIsModalOpen(willOpen);
                    if (willOpen) computeModalPosition();
                }}
                className="inline-flex items-center justify-center p-1.5 rounded-full transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none"
                style={{
                    background: 'transparent',
                    color: 'var(--text-inverted)',
                }}
                aria-label="User menu"
            >
                {authenticatedUser.avatar ? (
                    <img
                        src={authenticatedUser.avatar}
                        alt={`${authenticatedUser.firstname} ${authenticatedUser.lastname}`}
                        className="w-8 h-8 rounded-full object-cover ring-2 ring-offset-1 ring-(--accent-primary)"
                    />
                ) : (
                    <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 border-(--border-primary)"
                        style={{
                            backgroundColor: "rgba(255, 255, 255, 0.06)",
                        }}
                    >
                        {authenticatedUser.firstname[0]}{authenticatedUser.lastname[0]}
                    </div>
                )}
            </button>

            {isModalOpen && typeof document !== 'undefined' && modalPos && createPortal(
                <>
                    <div
                        className="fixed inset-0"
                        style={{ zIndex: 99990 }}
                        onClick={() => setIsModalOpen(false)}
                    />

                    <div
                        style={{
                            position: 'fixed',
                            top: modalPos.top,
                            left: modalPos.left,
                            width: 288,
                            zIndex: 99999,
                            background: 'var(--bg-surface)',
                            borderColor: 'var(--border-primary)'
                        }}
                        className="rounded-xl shadow-2xl border p-6 space-y-4"
                    >
                        {/* Avatar grande */}
                        <div className="flex justify-center mb-4">
                            {authenticatedUser.avatar ? (
                                <img src={authenticatedUser.avatar} alt="Avatar" className="w-16 h-16 rounded-full object-cover" />
                            ) : (
                                <div
                                    className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl"
                                    style={{
                                        background: 'var(--accent-primary)',
                                    }}
                                >
                                    {authenticatedUser.firstname[0]}{authenticatedUser.lastname[0]}
                                </div>
                            )}
                        </div>

                        {/* Nombre del usuario */}
                        <div className="text-center">
                            <p className="font-bold" style={{ color: 'var(--text-primary)' }}>
                                {authenticatedUser.firstname} {authenticatedUser.lastname}
                            </p>
                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{authenticatedUser.email}</p>
                        </div>

                        {/* Botón de Logout */}
                        <MyButton
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            variant="default"
                            className="w-full"
                        >
                            <LogOut size={18} />
                            <span>{isLoggingOut ? "Logging out..." : "Log Out"}</span>
                        </MyButton>
                    </div>
                </>,
                document.body
            )}
        </div>
    );
}
