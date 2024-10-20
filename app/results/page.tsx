"use client"
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

interface SearchResult {
  id: string;
  title?: string;
  content?: string;
}

const ResultsPage = () => {
  const searchParams = useSearchParams();
  const results = searchParams.get('results'); 
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    if (results) {
      try {
        setSearchResults(JSON.parse(results));
      } catch (error) {
        console.error('Error parsing search results:', error);
      }
    }
  }, [results]);

  return (
    <div>
      <h1>Search Results</h1>
      {searchResults.length > 0 ? (
        <ul>
          {searchResults.map((result) => (
            <li key={result.id}>
              <h2>{result.title || 'Untitled'}</h2>
              <p>{result.content || 'No content available.'}</p> 
            </li>
          ))}
        </ul>
      ) : (
        <p>No results found.</p>
      )}
    </div>
  );
};

export default ResultsPage;
