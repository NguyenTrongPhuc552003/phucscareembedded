import React from 'react';
import { useLocation } from '@docusaurus/router';
import { useDocusaurusContext } from '@docusaurus/useDocusaurusContext';
import { useAlternatePageUtils } from '@docusaurus/theme-common/internal';
import { translate } from '@docusaurus/Translate';

const LanguageSelector = () => {
    const { i18n } = useDocusaurusContext();
    const { pathname } = useLocation();
    const { createUrl } = useAlternatePageUtils();

    const currentLocale = i18n.currentLocale;
    const locales = i18n.locales;

    const getLanguageLabel = (locale) => {
        const labels = {
            en: 'English',
            vi: 'Tiếng Việt',
            'zh-Hans': '简体中文',
            es: 'Español',
            fr: 'Français',
            de: 'Deutsch',
            ja: '日本語',
            ko: '한국어',
        };
        return labels[locale] || locale;
    };

    const getLanguageFlag = (locale) => {
        const flags = {
            en: '🇺🇸',
            vi: '🇻🇳',
            'zh-Hans': '🇨🇳',
            es: '🇪🇸',
            fr: '🇫🇷',
            de: '🇩🇪',
            ja: '🇯🇵',
            ko: '🇰🇷',
        };
        return flags[locale] || '🌐';
    };

    return (
        <div className="navbar__item navbar__item--localeDropdown">
            <div className="dropdown dropdown--hoverable dropdown--right">
                <button
                    className="navbar__link dropdown__toggle"
                    aria-expanded="false"
                    aria-haspopup="true"
                    role="button"
                    tabIndex={0}
                >
                    <span className="navbar__link-text">
                        {getLanguageFlag(currentLocale)} {getLanguageLabel(currentLocale)}
                    </span>
                    <span className="dropdown__arrow" />
                </button>
                <ul className="dropdown__menu">
                    {locales.map((locale) => (
                        <li key={locale}>
                            <a
                                className="dropdown__link"
                                href={createUrl({ locale, pathname })}
                                onClick={(e) => {
                                    e.preventDefault();
                                    window.location.href = createUrl({ locale, pathname });
                                }}
                            >
                                <span className="dropdown__link-text">
                                    {getLanguageFlag(locale)} {getLanguageLabel(locale)}
                                </span>
                            </a>
                        </li>
                    ))}
                    <li className="dropdown__separator" />
                    <li>
                        <a
                            className="dropdown__link"
                            href="https://github.com/nguyentrongphuc552003/phucscareembedded"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <span className="dropdown__link-text">
                                🌐 Help us translate
                            </span>
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default LanguageSelector;
