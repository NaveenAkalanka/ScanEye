import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import scanEyeLogo from "../assets/ScanEye.svg";

function Navigation() {
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const isActive = (path) => location.pathname === path;

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
    };

    return (
        <nav className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)] sticky top-0 z-50 backdrop-blur-lg bg-opacity-95">
            <div className="container mx-auto px-4 sm:px-6 py-4">
                <div className="flex justify-between items-center">
                    {/* Logo and Title */}
                    <Link to="/" className="flex items-center space-x-3" onClick={closeMobileMenu}>
                        <div className="w-14 h-14 flex items-center justify-center p-1">
                            <img src={scanEyeLogo} alt="ScanEye Logo" className="w-full h-full" />
                        </div>
                        <span className="text-3xl font-bold text-white">ScanEye</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex space-x-8">
                        <Link
                            to="/"
                            className={`nav-link px-4 py-2 border rounded-md text-lg transition-all duration-200 ${isActive('/') ? 'border-[var(--accent-primary)] text-white bg-[var(--bg-tertiary)]' : 'border-transparent text-white hover:border-[var(--accent-primary)]'}`}
                        >
                            Dashboard
                        </Link>
                        <Link
                            to="/scan"
                            className={`nav-link px-4 py-2 border rounded-md text-lg transition-all duration-200 ${isActive('/scan') ? 'border-[var(--accent-primary)] text-white bg-[var(--bg-tertiary)]' : 'border-transparent text-white hover:border-[var(--accent-primary)]'}`}
                        >
                            Scan Network
                        </Link>
                        <Link
                            to="/settings"
                            className={`nav-link px-4 py-2 border rounded-md text-lg transition-all duration-200 ${isActive('/settings') ? 'border-[var(--accent-primary)] text-white bg-[var(--bg-tertiary)]' : 'border-transparent text-white hover:border-[var(--accent-primary)]'}`}
                        >
                            API Settings
                        </Link>
                    </div>

                    {/* Mobile Hamburger Button */}
                    <button
                        onClick={toggleMobileMenu}
                        className="md:hidden text-white p-2 rounded-md hover:bg-[var(--bg-tertiary)] transition-colors"
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        )}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden mt-4 pb-4 space-y-2 animate-fade-in">
                        <Link
                            to="/"
                            onClick={closeMobileMenu}
                            className={`block px-4 py-3 border rounded-md text-lg transition-all duration-200 ${isActive('/') ? 'border-[var(--accent-primary)] text-white bg-[var(--bg-tertiary)]' : 'border-transparent text-white hover:border-[var(--accent-primary)] hover:bg-[var(--bg-tertiary)]'}`}
                        >
                            Dashboard
                        </Link>
                        <Link
                            to="/scan"
                            onClick={closeMobileMenu}
                            className={`block px-4 py-3 border rounded-md text-lg transition-all duration-200 ${isActive('/scan') ? 'border-[var(--accent-primary)] text-white bg-[var(--bg-tertiary)]' : 'border-transparent text-white hover:border-[var(--accent-primary)] hover:bg-[var(--bg-tertiary)]'}`}
                        >
                            Scan Network
                        </Link>
                        <Link
                            to="/settings"
                            onClick={closeMobileMenu}
                            className={`block px-4 py-3 border rounded-md text-lg transition-all duration-200 ${isActive('/settings') ? 'border-[var(--accent-primary)] text-white bg-[var(--bg-tertiary)]' : 'border-transparent text-white hover:border-[var(--accent-primary)] hover:bg-[var(--bg-tertiary)]'}`}
                        >
                            API Settings
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
}

export default Navigation;
