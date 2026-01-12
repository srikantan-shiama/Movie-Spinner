let movies = [];

fetch("movies.json")
  .then(res => res.json())
  .then(data => movies = data);

function filterMovies() {
  const time = document.getElementById("time").value;
  const energy = document.getElementById("energy").value;
  const mood = document.getElementById("mood").value;

  return movies.filter(m =>
    m.time_bucket === time &&
    m.energy === energy &&
    m.mood === mood
  );
}
function pickMovie(list) {
    if (list.length === 0) return null;
    const idx = Math.floor(Math.random() * list.length);
    return list[idx];
}
document.getElementById("spin").onclick = () => {
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
