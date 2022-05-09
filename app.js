const express = require("express");

const path = require("path");

const { open } = require("sqlite");

const sqlite3 = require("sqlite3");

const app = express();

app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,

      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);

    process.exit(1);
  }
};

initializeDBAndServer();

const convertDBObjectToResponseObject = (dbObject) => {
  return {
    PlayerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
  SELECT 
  * 
  FROM 
  cricket_team`;

  const playersArray = await db.all(getPlayersQuery);

  const newArray = playersArray.map((eachPlayer) =>
    convertDBObjectToResponseObject(eachPlayer)
  );

  response.send(newArray);
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const postPlayerQuery = `select * from cricket_team where player_id=${playerId};`;

  const player = await db.get(postPlayerQuery);
  response.send(convertDBObjectToResponseObject(player));
});

app.post("/players/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const postPlayerQuery = `
  insert 
  into cricket_team (playerName,jerseyNumber,role)
  VALUES ('${playerName}',${jerseyNumber},'${role}');`;

  const payer = await db.run(postPlayerQuery);
  response.send("payer added to team");
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const { playerId } = request.params;
  const updatePlayerQuery = `
  update 
  cricket_team set
  player_name='${playerName}',
  jersey_number=${jerseyNumber},
  role='${role}')
  where 
  player_id=${playerId};`;

  await db.run(updatePlayerQuery);
  response.send("Payer Details Updated");
});

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePayerQuery = `
    delete from cricket_team
    where
    player-id=${playerId};`;
  await db.run(deletePayerQuery);
  response.send("Payer Removed");
});
module.exports = app;
