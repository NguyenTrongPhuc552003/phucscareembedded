import React from 'react';
import { useColorScheme } from '@docusaurus/theme-common';
import { ColorModeToggle } from '@docusaurus/theme-common';

const CustomColorModeToggle = () => {
    const { colorScheme, setColorScheme } = useColorScheme();

    return (
        <ColorModeToggle
            className="navbar__toggle"
            checked={colorScheme === 'dark'}
            onChange={(checked) => setColorScheme(checked ? 'dark' : 'light')}
        />
    );
};

export default CustomColorModeToggle;
