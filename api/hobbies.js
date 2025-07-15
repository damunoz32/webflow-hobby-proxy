<!-- Load React and ReactDOM from CDN -->
<script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
<!-- Load Babel for JSX transformation in the browser -->
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
<!-- Load Tailwind CSS CDN DIRECTLY IN EMBED -->
<script src="https://cdn.tailwindcss.com"></script>

<!-- The target element where your React app will mount -->
<div id="react-hobby-app-root"></div>

<!-- React App -->
<script type="text/babel">
// Main App component for the hobby showcase
const App = () => {
  const [hobbies, setHobbies] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('Cycling');

  
  const PROXY_API_URL = 'https://webflow-hobby-proxy.vercel.app/api/hobbies'; 

  // Fetch data from Webflow CMS when the component mounts
  React.useEffect(() => {
    const fetchHobbies = async () => {
      try {
        const response = await fetch(PROXY_API_URL, {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            'User-Agent': 'Webflow-React-App-Client/1.0',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Proxy error! Status: ${response.status}, Details: ${errorData.error || 'Unknown'}`);
        }

        const data = await response.json();

        const formattedHobbies = data.items.map(item => ({
          id: item._id,
          name: item.fieldData['hobby-name'],
          description: item.fieldData.description,
          imageUrl: item.fieldData.image?.url,
          category: item.fieldData.category,
          accomplishments: item.fieldData['key-accomplishments'],
        }));

        setHobbies(formattedHobbies);
      } catch (e) {
        console.error("Failed to fetch hobbies:", e);
        setError("Failed to load hobbies. Please check your browser's console for the raw data structure.");
      } finally {
        setLoading(false);
      }
    };
    fetchHobbies();
  }, []);

  // Filtered hobbies based on search term and category
  const filteredHobbies = hobbies.filter(hobby => {
    const matchesSearchTerm = searchTerm === '' ||
      hobby.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hobby.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'All' ||
      (hobby.category && hobby.category.toLowerCase() === selectedCategory.toLowerCase());

    return matchesSearchTerm && matchesCategory;
  });

  // Extract unique categories for filter buttons
  const categories = ['All', ...new Set(hobbies.map(hobby => hobby.category).filter(Boolean))];

  // Render loading, error, or hobby content
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 min-h-[300px] bg-[#3C4B3B] rounded-lg shadow-xl border border-[#748873]"> {/* Darker background, stronger shadow, border */}
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#D1A980]"></div> {/* Thicker spinner, accent color */}
        <p className="ml-4 text-lg text-[#F8F8F8] font-inter">Loading your adventures...</p> {/* Light text */}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 text-red-400 bg-[#3C4B3B] rounded-lg shadow-xl border border-[#748873]"> {/* Darker background, stronger shadow, border */}
        <p className="text-xl font-bold font-inter text-[#D1A980]">Error:</p> {/* Accent color for error title */}
        <p className="mt-2 font-inter text-[#F8F8F8]">{error}</p> {/* Light text */}
        <p className="mt-4 font-inter text-[#90A08F]">Please check your browser's console for more details.</p> {/* Muted light text */}
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 font-inter bg-[#3C4B3B] rounded-lg shadow-xl max-w-6xl mx-auto border border-[#748873]"> {/* Darker background, stronger shadow, border */}
      
    <h2 className="text-3xl font-bold text-[#D1A980] mb-6 text-center">Interactive Hobbies Search & Filter</h2>
      
      {/* Search and Filter Section */}
      <div className="mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <input
          type="text"
          placeholder="Search hobbies..."
          className="p-3 border border-[#748873] rounded-md shadow-inner focus:outline-none focus:ring-2 focus:ring-[#D1A980] w-full sm:w-1/2 md:w-1/3 bg-[#5A6B59] text-[#F8F8F8] placeholder-[#90A08F]" // Darker input bg, light text, muted placeholder
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {/* Category Filter Buttons */}
        <div className="flex flex-wrap gap-2 justify-center sm:justify-end w-full sm:w-auto">
          {categories.map(category => (
            <button
              key={category}
              className={`px-4 py-2 rounded-md font-medium transition-colors duration-200 shadow-sm ${
                selectedCategory === category
                  ? 'bg-[#D1A980] text-[#3C4B3B] border border-[#748873]' // Active: Accent bg, dark text, border
                  : 'bg-[#90A08F] text-[#3C4B3B] hover:bg-[#D1A980] hover:text-[#3C4B3B] border border-[#748873]' // Default: Lighter green bg, dark text, hover accent
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Hobby Cards Grid */}
      <div className="flex flex-col gap-6">
        {filteredHobbies.length > 0 ? (
          filteredHobbies.map((hobby) => (
            <div
              key={hobby.id}
              className="bg-[#5A6B59] rounded-lg shadow-lg overflow-hidden transform transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl border border-[#748873]" // Card bg, shadow, border
            >
              {hobby.imageUrl ? (
                <img
                  src={hobby.imageUrl}
                  alt={hobby.name}
                  className="w-full h-48 object-cover"
                  onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x400/748873/F8F8F8?text=Image+Not+Found"; }} // Placeholder with theme colors
                />
              ) : (
                <div className="w-full h-48 bg-[#90A08F] flex items-center justify-center text-[#3C4B3B] font-medium"> {/* Lighter green bg for no image, dark text */}
                  No Image Available
                </div>
              )}
              <div className="p-5">
                <h3 className="text-xl font-semibold text-[#D1A980] mb-2">{hobby.name}</h3> {/* Accent color for title */}
                {hobby.category && (
                  <span className="inline-block bg-[#748873] text-[#F8F8F8] text-xs font-medium px-2.5 py-0.5 rounded-full mb-3 shadow-sm"> {/* Medium green bg, light text, rounded, shadow */}
                    {hobby.category}
                  </span>
                )}
                {/* Dynamically inject Rich Text content */}
                <div
                  className="text-[#F8F8F8] text-sm leading-relaxed rich-text-content" // Light text
                  dangerouslySetInnerHTML={{ __html: hobby.description }}
                />
                {hobby.accomplishments && (
                  <div className="mt-4 pt-4 border-t border-[#748873] text-[#F8F8F8] text-sm"> {/* Border, light text */}
                    <h4 className="font-medium mb-1 text-[#D1A980]">Accomplishments:</h4> {/* Accent color for subtitle */}
                    <div dangerouslySetInnerHTML={{ __html: hobby.accomplishments }} />
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center p-8 text-[#F8F8F8] bg-[#5A6B59] rounded-lg shadow-lg border border-[#748873]"> {/* Light text, medium green bg, border */}
            No hobbies found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
};

// --- React App Mounting ---
const appRoot = document.getElementById('react-hobby-app-root');
const root = ReactDOM.createRoot(appRoot);
root.render(<App />);
</script>