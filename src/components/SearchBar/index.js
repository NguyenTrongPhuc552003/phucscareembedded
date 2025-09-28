import React from 'react';
import { DocSearch } from '@docsearch/react';
import '@docsearch/css';

const SearchBar = () => {
    return (
        <DocSearch
            appId="YOUR_APP_ID"
            apiKey="YOUR_SEARCH_API_KEY"
            indexName="phucscareembedded"
            placeholder="Search documentation..."
            translations={{
                button: {
                    buttonText: 'Search',
                    buttonAriaLabel: 'Search',
                },
                modal: {
                    searchBox: {
                        resetButtonTitle: 'Clear the query',
                        resetButtonAriaLabel: 'Clear the query',
                        cancelButtonText: 'Cancel',
                        cancelButtonAriaLabel: 'Cancel',
                    },
                    startScreen: {
                        recentSearchesTitle: 'Recent',
                        noRecentSearchesText: 'No recent searches',
                        saveRecentSearchButtonTitle: 'Save this search',
                        removeRecentSearchButtonTitle: 'Remove this search from history',
                        favoriteSearchesTitle: 'Favorite',
                        removeFavoriteSearchButtonTitle: 'Remove this search from favorites',
                    },
                    errorScreen: {
                        titleText: 'Unable to fetch results',
                        helpText: 'You might want to check your network connection.',
                    },
                    footer: {
                        selectText: 'to select',
                        navigateText: 'to navigate',
                        closeText: 'to close',
                        searchByText: 'search by',
                    },
                    noResultsScreen: {
                        noResultsText: 'No results for',
                        suggestedQueryText: 'Try searching for',
                        reportMissingResultsText: 'Believe this query should return results?',
                        reportMissingResultsLinkText: 'Let us know.',
                    },
                },
            }}
        />
    );
};

export default SearchBar;
