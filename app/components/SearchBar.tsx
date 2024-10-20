// components/SearchBar.tsx
import { useState, FormEvent } from 'react';

interface SearchBarProps {
    onSearch: (query: string) => void; 
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
    const [query, setQuery] = useState<string>('');

    const handleSearch = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSearch(query); 
    };

    return (
        <form onSubmit={handleSearch} className="flex mt-4 w-full">
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
                aria-label="Search"
                required
                className="border rounded p-2 w-full text-black" 
            />
            <button type="submit" className="ml-2 p-2 bg-emerald-500 text-white rounded w-auto">
                Search
            </button>
        </form>
    );
};

export default SearchBar;
