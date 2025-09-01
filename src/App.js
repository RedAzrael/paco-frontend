import React, { useState } from 'react';
import { Search, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import './App.css';

const SearchApp = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) {
      setError('Please enter a search query');
      return;
    }

    setLoading(true);
    setError('');
    setHasSearched(true);

    try {
      // Replace with your actual backend endpoint
      const response = await fetch(`http://localhost:3001/api/search?q=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResults(data.results || data || []);
    } catch (err) {
      setError(`Search failed: ${err.message}`);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDisplayAllRelics = async () => {
    setLoading(true);
    setError('');
    setHasSearched(true);
    setQuery(''); // Clear search query when displaying all

    try {
      const response = await fetch('http://localhost:3001/relics', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // Transform the relics data to match the expected format
      const transformedResults = data.map(relic => ({
        id: relic.id,
        title: relic.name,
        description: `Relic ID: ${relic.id}`
      }));
      setResults(transformedResults);
    } catch (err) {
      setError(`Failed to load relics: ${err.message}`);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setError('');
    setHasSearched(false);
  };

  return (
    <div className="app-container">
      <div className="main-content">
        {/* Header */}
        <div className="header">
          <h1 className="title">Search Application</h1>
          <p className="subtitle">Enter your query below to search the backend database</p>
        </div>

        {/* Search Form */}
        <div className="search-section">
          <div className="search-container">
            <div className="search-input-container">
              <Search className="search-icon" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Enter your search query..."
                className="search-input"
                disabled={loading}
              />
            </div>
            <button
              type="button"
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              className="search-button"
            >
              {loading ? (
                <Loader2 className="spinner" />
              ) : (
                'Search'
              )}
            </button>
            <button
              type="button"
              onClick={handleDisplayAllRelics}
              disabled={loading}
              className="display-all-button"
            >
              {loading ? (
                <Loader2 className="spinner" />
              ) : (
                'Display All Relics'
              )}
            </button>
            {hasSearched && (
              <button
                type="button"
                onClick={clearSearch}
                className="clear-button"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-container">
            <div className="error-message">
              <AlertCircle className="error-icon" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Results Section */}
        {hasSearched && !loading && !error && (
          <div className="results-container">
            <div className="results-header">
              <CheckCircle2 className="success-icon" />
              <h2 className="results-title">
                {query ? `Search Results (${results.length} found)` : `All Relics (${results.length} total)`}
              </h2>
            </div>

            {results.length === 0 ? (
              <div className="no-results">
                <Search className="no-results-icon" />
                <p className="no-results-text">
                  {query ? `No results found for "${query}"` : 'No relics found in database'}
                </p>
                <p className="no-results-subtext">
                  {query ? 'Try adjusting your search terms' : 'The database appears to be empty'}
                </p>
              </div>
            ) : (
              <div className="results-list">
                {results.map((result, index) => (
                  <div key={index} className="result-item">
                    {/* Adapt this structure based on your backend response format */}
                    {typeof result === 'string' ? (
                      <p className="result-text">{result}</p>
                    ) : typeof result === 'object' ? (
                      <div>
                        {result.title && (
                          <h3 className="result-title">{result.title}</h3>
                        )}
                        {result.description && (
                          <div className="result-description">
                            {result.description.split('\n').map((line, lineIndex) => {
                              if (line.startsWith('•')) {
                                // Format item lines with bullet points
                                const itemText = line.substring(1).trim(); // Remove bullet
                                const isRare = itemText.includes('(Rare)');
                                const isUncommon = itemText.includes('(Uncommon)');
                                const isCommon = itemText.includes('(Common)');
                                
                                return (
                                  <div key={lineIndex} className={`item-line ${isRare ? 'rare-item' : isUncommon ? 'uncommon-item' : isCommon ? 'common-item' : ''}`}>
                                    <span className="bullet">•</span>
                                    <span className="item-text">{itemText}</span>
                                  </div>
                                );
                              } else if (line.startsWith('Relic:')) {
                                // Format relic name lines
                                return (
                                  <div key={lineIndex} className="relic-name-line">
                                    <strong>{line}</strong>
                                  </div>
                                );
                              } else if (line === 'Items:' || line === 'Matched Items:') {
                                // Format section headers
                                return (
                                  <div key={lineIndex} className="section-header">
                                    <strong>{line}</strong>
                                  </div>
                                );
                              } else {
                                // Regular lines
                                return (
                                  <div key={lineIndex} className="description-line">
                                    {line}
                                  </div>
                                );
                              }
                            })}
                          </div>
                        )}
                        {result.url && (
                          <a 
                            href={result.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="result-link"
                          >
                            {result.url}
                          </a>
                        )}
                        {/* Display any other properties */}
                        {Object.entries(result)
                          .filter(([key]) => !['title', 'description', 'url'].includes(key))
                          .map(([key, value]) => (
                            <div key={key} className="result-property">
                              <span className="property-key">{key}: </span>
                              <span className="property-value">{String(value)}</span>
                            </div>
                          ))
                        }
                      </div>
                    ) : (
                      <pre className="result-json">
                        {JSON.stringify(result, null, 2)}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="loading-container">
            <Loader2 className="loading-spinner" />
            <p className="loading-text">Searching...</p>
          </div>
        )}

        {/* API Info */}
        {/*<div className="api-info">
          <p className="api-endpoint">
            <strong>Backend Endpoints:</strong><br />
            Search: <code>http://localhost:3001/api/search?q=YOUR_QUERY</code><br />
            All Relics: <code>http://localhost:3001/relics</code>
          </p>
          <p className="api-note">Make sure your backend server is running and CORS is properly configured.</p>
        </div>*/}
      </div>
    </div>
  );
};

export default SearchApp;