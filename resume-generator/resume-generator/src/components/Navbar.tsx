'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [lastScroll, setLastScroll] = useState(0);
    const [isNavHidden, setIsNavHidden] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => {
            const currentScroll = window.pageYOffset;
            
            if (currentScroll <= 0) {
                setIsNavHidden(false);
                return;
            }
            
            if (currentScroll > lastScroll && !isNavHidden) {
                setIsNavHidden(true);
            } else if (currentScroll < lastScroll && isNavHidden) {
                setIsNavHidden(false);
            }
            
            setLastScroll(currentScroll);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScroll, isNavHidden]);

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
        document.documentElement.classList.toggle('dark');
    };

    const navLinks = [
        { href: '/', label: 'Home', icon: 'fa-home' },
        { href: '/templates', label: 'Templates', icon: 'fa-th-large' },
        { href: '/examples', label: 'Examples', icon: 'fa-book' },
        { href: '/tips', label: 'Tips', icon: 'fa-lightbulb' },
    ];

    return (
        <nav className={`fixed top-4 left-1/2 transform -translate-x-1/2 w-[95%] max-w-6xl mx-auto bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-lg z-50 transition-all duration-300 hover:shadow-xl ${isNavHidden ? '-translate-y-full' : ''}`}>
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <Link href="/" className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 transition-colors">
                        <i className="fas fa-file-alt text-2xl"></i>
                        <span className="font-semibold text-xl">Resume Generator</span>
                    </Link>

                    <button 
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="lg:hidden text-gray-600 hover:text-gray-900 focus:outline-none"
                    >
                        <i className="fas fa-bars text-xl"></i>
                    </button>

                    <div className="hidden lg:flex items-center space-x-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                                    pathname === link.href
                                        ? 'text-purple-600 bg-purple-50 dark:bg-purple-900/20'
                                        : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50 dark:text-gray-300 dark:hover:bg-purple-900/20'
                                }`}
                            >
                                <i className={`fas ${link.icon}`}></i>
                                <span>{link.label}</span>
                            </Link>
                        ))}
                        <button
                            onClick={toggleDarkMode}
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'} text-gray-600 dark:text-gray-300`}></i>
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                <div className={`lg:hidden ${isMobileMenuOpen ? 'block' : 'hidden'} pb-4`}>
                    <div className="flex flex-col space-y-4">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                                    pathname === link.href
                                        ? 'text-purple-600 bg-purple-50 dark:bg-purple-900/20'
                                        : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50 dark:text-gray-300 dark:hover:bg-purple-900/20'
                                }`}
                            >
                                <i className={`fas ${link.icon}`}></i>
                                <span>{link.label}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </nav>
    );
} 