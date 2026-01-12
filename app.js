let movies = [];
let moviesLoaded = false;

function filterMovies() {
  if (!moviesLoaded || movies.length === 0) {
    console.log("Movies not loaded yet or empty");
    return [];
  }
  
  const time = document.getElementById("time").value;
  const energy = document.getElementById("energy").value;
  const mood = document.getElementById("mood").value;

  const filtered = movies.filter(m =>
    m.time_bucket === time &&
    m.energy === energy &&
    m.mood === mood
  );
  
  console.log(`Filtering: time=${time}, energy=${energy}, mood=${mood}`);
  console.log(`Found ${filtered.length} matches`);
  
  return filtered;
}

function pickMovie(list) {
    if (list.length === 0) return null;
    const idx = Math.floor(Math.random() * list.length);
    return list[idx];
}

// Wait for DOM to be ready
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded, fetching movies.json...");
  
  // Set up button click handler
  const spinButton = document.getElementById("spin");
  if (spinButton) {
    spinButton.onclick = () => {
      if (!moviesLoaded) {
        document.getElementById("result").innerHTML = "⏳ Loading movies...";
        return;
      }
      
      const candidates = filterMovies();
      const movie = pickMovie(candidates);
    
      const result = document.getElementById("result");
    
      if (!movie) {
        result.innerHTML = "😢 No matches — try loosening constraints!";
        return;
      }
    
      result.innerHTML = `
        <h2>${movie.title}</h2>
        <p><strong>${movie.runtime} min</strong> · ⭐ ${movie.vote_average}</p>
        <p>${movie.overview}</p>
      `;
    };
  }
  
  // Load movies with timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
  
  fetch("movies.json", { signal: controller.signal })
    .then(res => {
      clearTimeout(timeoutId);
      console.log("Response status:", res.status, res.statusText);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status} ${res.statusText}`);
      console.log("Starting to parse JSON (this may take a moment for large files)...");
      const result = document.getElementById("result");
      if (result) {
        result.innerHTML = "⏳ Parsing movie data...";
      }
      return res.json();
    })
    .then(data => {
      movies = data;
      moviesLoaded = true;
      console.log(`Successfully loaded ${movies.length} movies`);
      if (spinButton) {
        spinButton.disabled = false;
        spinButton.textContent = "🎡 Spin the Wheel";
      }
      const result = document.getElementById("result");
      if (result) {
        result.innerHTML = "";
      }
    })
    .catch(error => {
      clearTimeout(timeoutId);
      console.error("Error loading movies:", error);
      const result = document.getElementById("result");
      if (result) {
        if (error.name === 'AbortError') {
          result.innerHTML = "❌ Request timed out. The movies file is very large (7.4MB). Please wait and try refreshing the page.";
        } else {
          result.innerHTML = `❌ Error loading movies: ${error.message}. <br>Make sure you're accessing via http://localhost:8000 (not file://). <br>Check browser console (F12) for details.`;
        }
      }
    });
});
