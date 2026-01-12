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
  const timeoutId = setTimeout(() => controller.abort(), 120000); // 120 second timeout for GitHub Pages
  
  // Try to detect if we're on GitHub Pages (check for github.io in URL)
  const isGitHubPages = window.location.hostname.includes('github.io');
  const jsonPath = isGitHubPages ? "./movies.json" : "movies.json";
  
  fetch(jsonPath, { signal: controller.signal })
    .then(res => {
      clearTimeout(timeoutId);
      console.log("Response status:", res.status, res.statusText);
      console.log("Fetching from:", jsonPath);
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error(`File not found (404). Make sure movies.json is committed to your repository and pushed to GitHub.`);
        }
        throw new Error(`HTTP error! status: ${res.status} ${res.statusText}`);
      }
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
          result.innerHTML = "❌ Request timed out. The movies file is large (2.8MB). GitHub Pages may be slow. Try refreshing the page.";
        } else if (error.message.includes('404')) {
          result.innerHTML = `❌ ${error.message}<br><br>To fix on GitHub Pages:<br>1. Make sure movies.json is in your repository<br>2. Commit and push: git add movies.json && git commit -m "Add movies.json" && git push<br>3. Wait a few minutes for GitHub Pages to update`;
        } else {
          result.innerHTML = `❌ Error loading movies: ${error.message}<br><br>Check browser console (F12) for details.<br>If on GitHub Pages, the file might be too large or not committed.`;
        }
      }
    });
});
