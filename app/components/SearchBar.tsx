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
    <form onSubmit={handleSearch} className="mt-4 flex w-full">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
        aria-label="Search"
        required
        className="w-full rounded border bg-white p-2 text-black"
        // Change back to bg-[#99ffd3] when ready
      />
      <button
        type="submit"
        className="ml-2 w-auto rounded bg-[#d1ff00] p-2 text-black hover:bg-emerald-500 hover:text-white focus:ring-2 focus:ring-[#d1ff00] focus:outline-none"
        // change button back to bg-emerald-500 when ready, and text white
      >
        Search
      </button>
    </form>
  );
};

export default SearchBar;
