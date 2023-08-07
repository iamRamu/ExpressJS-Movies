const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");
let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Start at http://localhost:3000/");
    });
  } catch (error) {
    console.log(`DB Error ${error.message}`);
  }
};
initializeDbAndServer();

const convertMovieDbObjectToResponseObject = (db) => {
  return {
    movieId: db.movie_id,
    directorId: db.director_id,
    movieName: db.movie_name,
    leadActor: db.lead_actor,
  };
};

const convertDirectorObjectToResponseObject = (db) => {
  return {
    directorId: db.director_id,
    directorName: db.director_name,
  };
};

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT
       movie_name
    FROM 
       movie;
    `;
  const moviesArray = await db.all(getMoviesQuery);
  response.send(
    moviesArray.map((eachMovie) => ({
      movieName: eachMovie.movie_name,
    }))
  );
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT
       *
    FROM
      movie
    WHERE
      movie_id = ${movieId};
    `;
  const movie = await db.get(getMovieQuery);
  response.send(convertMovieDbObjectToResponseObject(movie));
});

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const postMovieQuery = `
    INSERT INTO
       movie (director_id, movie_name, lead_actor)
    VALUES
      (${directorId}, '${movieName}', '${leadActor}');
    `;

  await db.run(postMovieQuery);
  response.send("Movie Successfully Added");
});

app.put("/movies/:movieId/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const { movieId } = request.params;
  const updateMovieQuery = `
    UPDATE
       movie
    SET 
       director_id = ${directorId},
       movie_name = '${movieName}',
       lead_actor = '${leadActor}'
    WHERE
       movie_id = ${movieId};
    `;

  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE FROM
       movie
    WHERE
       movie_id = ${movieId};
    `;

  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
    SELECT 
      *
    FROM
      director;
    `;

  const directorsArray = await db.all(getDirectorsQuery);
  response.send(
    directorsArray.map((eachDirector) =>
      convertDirectorObjectToResponseObject(eachDirector)
    )
  );
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMoviesQuery = `
    SELECT
       movie_name
    FROM
      movie
    WHERE 
      director_id = '${directorId}';
    `;
  const moviesArray = await db.all(getDirectorMoviesQuery);
  response.send(
    moviesArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});
module.exports = app;
