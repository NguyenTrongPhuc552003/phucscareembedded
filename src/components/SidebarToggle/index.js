import React, { useState, useEffect } from 'react';
import { useLocation } from '@docusaurus/router';
import { useDocSidebar } from '@docusaurus/theme-common/internal';
import { useThemeConfig } from '@docusaurus/theme-common';
import { useColorScheme } from '@docusaurus/theme-common';

const SidebarToggle = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const location = useLocation();
    const sidebar = useDocSidebar();
    const { colorScheme } = useColorScheme();

    useEffect(() => {
        // Check if sidebar should be collapsed based on screen size
        const handleResize = () => {
            if (window.innerWidth < 996) {
                setIsCollapsed(true);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
        // You can add more logic here to actually collapse the sidebar
        const sidebarElement = document.querySelector('.theme-doc-sidebar-container');
        if (sidebarElement) {
            if (isCollapsed) {
                sidebarElement.style.display = 'block';
                sidebarElement.style.transform = 'translateX(0)';
            } else {
                sidebarElement.style.display = 'none';
                sidebarElement.style.transform = 'translateX(-100%)';
            }
        }
    };

    if (!sidebar) return null;

    return (
        <button
            className="navbar__toggle sidebar-toggle"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
            title="Toggle sidebar"
            style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.5rem',
                borderRadius: '4px',
                color: 'var(--ifm-color-emphasis-600)',
                transition: 'color var(--ifm-transition-fast) ease',
            }}
            onMouseEnter={(e) => {
                e.target.style.color = 'var(--ifm-color-primary)';
            }}
            onMouseLeave={(e) => {
                e.target.style.color = 'var(--ifm-color-emphasis-600)';
            }}
        >
            <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                {isCollapsed ? (
                    <path d="M3 6h18M3 12h18M3 18h18" />
                ) : (
                    <path d="M3 6h18M3 12h18M3 18h18" />
                )}
            </svg>
        </button>
    );
};

export default SidebarToggle;
