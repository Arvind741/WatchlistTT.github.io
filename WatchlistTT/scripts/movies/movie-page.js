const API_KEY = config.API_KEY;
const spinner = document.querySelector(".spinner");
const container = document.querySelector(".container");
spinner.style.display = "none";
container.style.display = "none";
function getMovie() {
  spinner.style.display = "block";
  setTimeout(() => {
    spinner.style.display = "none";
    container.style.display = "block";
  }, 1000);

  let movieId = sessionStorage.getItem("movieId");

  const movieInfo = axios.get(
    "https://api.themoviedb.org/3/movie/" +
      movieId +
      "?api_key=" +
      API_KEY +
      "&language=en-US"
  );
  const movieCast = axios.get(
    "https://api.themoviedb.org/3/movie/" +
      movieId +
      "/credits?api_key=" +
      API_KEY
  );
  Promise.all([movieInfo, movieCast])
    .then(([movieInfoResponse, movieCastResponse]) => {
      const movie = movieInfoResponse.data;
      const cast = movieCastResponse.data.cast;
      const genres = movieInfoResponse.data.genres;
      cast.length = 5;
      popularity = movieInfoResponse.data.popularity;
      popularity = Math.floor(popularity);
      let revenue = movieInfoResponse.data.revenue;
      revenue = new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: "USD",
      }).format(revenue);

      let output = `
			<div class="moviePage">
			<div class="poster"><img src="http://image.tmdb.org/t/p/w300/${movie.poster_path}"></div>
			<div class="info">
				<h2>${movie.title}</h2>
				<ul>
					<li><strong>Cast:</strong> `;
      for (let i = 0; i < cast.length; i++) {
        if (i != cast.length - 1) {
          output += `${cast[i].name}, `;
        } else {
          output += `${cast[i].name}.`;
        }
      }
      output += `</li>
					<li><strong>Genres:</strong> `;
      for (let i = 0; i < genres.length; i++) {
        if (i != genres.length - 1) {
          output += `${genres[i].name}, `;
        } else {
          output += `${genres[i].name}.`;
        }
      }
      output += `</li>
					<li><strong>Tagline:</strong> ${movie.tagline} </li>
					<li><strong>Release Date:</strong> ${movie.release_date}</li>
					<li><strong>Runtime:</strong> ${movie.runtime} (min)</li>
					<li><strong>Rating:</strong> ${movie.vote_average} / 10 <span id="smallText">(${movie.vote_count} votes)</span></li>
					<li><strong>Revenue:</strong> ${revenue}</li>
					<li><strong>Status:</strong> ${movie.status}</li>
					<li><strong>Production companies:</strong> ${movie.production_companies[0].name}</li>
				</ul>
				<div class="buttons">
					<a href="https://www.imdb.com/title/${movie.imdb_id}" target="_blank"> IMDB Link </a>
					<a id="addToWatchList" onclick="addToList('${movie.id}')"> Add to watchlist </a>
					<a onclick="goBack()"> Go back </a>
				</div>
			</div>
		</div>
		<div class="plot">
			<h3>Plot</h3>
			<p>${movie.overview}</p>
		</div>`;
      const info = document.getElementById("movie");
      info.innerHTML = output;
    })
    .catch((err) => {
      let output = "";
      output += `<h1 id="errorTitle">SORRY !</h1>
			<p id="errorText">We could not provide informations about this movie at this particular moment. Be sure to come back again. Thank you for your understanding. </p>
			<div class="buttons errorBack">
				<a onclick="goBack()"> Go back </a>
			</div>`;
      let info = document.getElementById("movie");
      info.innerHTML = output;
      document.getElementById("rec_title").style.display = "none";
      document.querySelector(".page").style.display = "none";
      document.getElementById("recommended").style.display = "none";
      document.getElementById("trailer").style.display = "none";
      document.getElementById("trailer_title").style.display = "none";
      document.getElementById("rec_title").style.display = "none";
    });
  axios
    .get(
      "https://api.themoviedb.org/3/movie/" +
        movieId +
        "/videos?api_key=" +
        API_KEY +
        "&language=en-US"
    )
    .then((response) => {
      let trailer = response.data.results;
      let min = 0;
      let max = trailer.length - 1;
      min = Math.ceil(min);
      max = Math.floor(max);
      let trailerNumber = Math.floor(Math.random() * (max - min + 1)) + min;

      let output = `
					<div class="video">
					<iframe width="620" height="400" src="https://www.youtube.com/embed/${trailer[trailerNumber].key}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
					</div>`;
      let video = document.getElementById("trailer");
      video.innerHTML = output;
    })

    .catch((err) => {
      let trailerOutput = document.getElementById("trailer");
      document.getElementById("trailer_title").style.display = "none";
      trailerOutput.innerHTML = `<div class="trailer_error">
					<h3>We are sorry! </h3>
					<br>
					<p>No video available at this moment. Try reloading the page.</p>
				 </div>`;
    });
  axios
    .get(
      "https://api.themoviedb.org/3/movie/" +
        movieId +
        "/recommendations?api_key=" +
        API_KEY +
        "&language=en-US&page=1"
    )
    .then((response) => {
      const movie = response.data.results;
      movie.length = 4;
      let output = "";
      for (let i = 0; i < movie.length; i++) {
        output += `
					<div class="card">
						<div class="overlay">
						<div class="movie">
							<h2>${movie[i].title}</h2>
								<p id="p_rating"><strong>Rating:</strong> <span>${movie[i].vote_average} / 10  <i class="material-icons star">star_rate</i></span> </p>
								<p><strong>Release date:</strong> <span>${movie[i].release_date} <i class="material-icons date">date_range</i> </span></p>
								<a onclick="movieSelected('${movie[i].id}')" href="#">Details</a>
						</div>
						</div>
						<div class="card_img">
							<img src="http://image.tmdb.org/t/p/w400/${movie[i].poster_path}" onerror="this.onerror=null;this.src='../images/imageNotFound.png';">
						</div>
					</div>
					`;
      }
      let recommended = document.getElementById("recommended");
      recommended.innerHTML = output;
      document.getElementById("prev").style.display = "none";
    })
    .catch((err) => {
      let recommended = document.getElementById("recommended");
      document.getElementById("rec_title").style.display = "none";
      document.querySelector(".page").style.display = "none";
      recommended.innerHTML = `<div class="recommendations_error">
					<h3>We are sorry! </h3>
					<br>
					<p>No recommendations are available at this moment. Please check later.</p>
				 </div>`;
    });
}

function goBack() {
  window.close();
}
function movieSelected(id) {
  sessionStorage.setItem("movieId", id);
  location.replace("movie-page.html");
  return false;
}
let pageNum = 1;
const prev = document.getElementById("prev");
prev.addEventListener("click", () => {
  pageNum--;
  recommendedPage(pageNum);
});
const next = document.getElementById("next");
next.addEventListener("click", () => {
  pageNum++;
  recommendedPage(pageNum);
});
function recommendedPage(pageNum) {
  let movieId = sessionStorage.getItem("movieId");
  axios
    .get(
      "https://api.themoviedb.org/3/movie/" +
        movieId +
        "/recommendations?api_key=" +
        API_KEY +
        "&language=en-US&page=" +
        pageNum
    )
    .then((response) => {
      let movie = response.data.results;
      movie.length = 4;
      let output = "";
      for (let i = 0; i < movie.length; i++) {
        output += `<div class="card">
					<div class="overlay">
					<div class="movie">
						<h2>${movie[i].title}</h2>
						<p id="p_rating"><strong>Rating:</strong> <span>${movie[i].vote_average} / 10  <i class="material-icons star">star_rate</i></span> </p>
						<p><strong>Release date:</strong> <span>${movie[i].release_date} <i class="material-icons date">date_range</i> </span></p>
						<a onclick="movieSelected('${movie[i].id}')" href="#">Details</a>
					 </div>
					</div>
					<div class="card_img">
						<img src="http://image.tmdb.org/t/p/w300/${movie[i].poster_path}" onerror="this.onerror=null;this.src='../images/imageNotFound.png';">
					</div>
					</div>`;
      }
      let recommended = document.getElementById("recommended");
      recommended.innerHTML = output;
      let totalPages = response.data.total_pages;

      if (pageNum >= 2) {
        document.getElementById("prev").style.display = "flex";
      }

      if (pageNum === totalPages) {
        document.getElementById("next").style.display = "none";
      } else if (pageNum === 1) {
        document.getElementById("prev").style.display = "none";
        document.getElementById("next").style.display = "flex";
      }
    })
    .catch((err) => {
      console.log(err);
    });
}
function addToList(id) {
  let storedId = JSON.parse(localStorage.getItem("movies")) || [];
  if (storedId.indexOf(id) === -1) {
    storedId.push(id);
    localStorage.setItem("movies", JSON.stringify(storedId));
    const added = document.getElementById("added");
    added.innerHTML = "Added to Watchlist!";
    added.classList.add("added");
    setTimeout(() => {
      added.classList.remove("added");
    }, 1500);
  } else {
    const alreadyStored = document.getElementById("alreadyStored");
    alreadyStored.innerHTML = "Already in Watchlist!";
    alreadyStored.classList.add("alreadyStored");
    setTimeout(() => {
      alreadyStored.classList.remove("alreadyStored");
    }, 1500);
  }
}
