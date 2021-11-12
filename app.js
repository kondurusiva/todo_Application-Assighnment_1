const express = require("express");
const addDays = require("date-fns/addDays");
const app = express();
const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

const dbPath = path.join(__dirname, "todoApplication.db");
app.use(express.json());

let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error :${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const hasCategoryAndStatus = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.status !== undefined
  );
};

const hasCategoryAndPriority = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.priority !== undefined
  );
};

const hasCategory = (requestQuery) => {
  return requestQuery.category !== undefined;
};

const hasStatusAndPriorityProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};

const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

app.get("/todos/", async (request, response) => {
  const { status, priority, search_q = "", category, dueDate } = request.query;

  let getsQuery = "";
  let data = null;
  switch (true) {
    case hasCategoryAndStatus(request.query):
      getsQuery = `
        SELECT
            *
        FROM
            todo
        WHERE
            category='${category}' AND status='${status}';`;
      break;
    case hasCategoryAndPriority(request.query):
      getsQuery = `
        SELECT
            *
        FROM
            todo
        WHERE
            category='${category}' AND priority='${priority}';`;
      break;
    case hasCategory(request.query):
      getsQuery = `
        SELECT
            *
        FROM
            todo
        WHERE
            category='${category}';`;
      break;
    case hasStatusAndPriorityProperties(request.query):
      getsQuery = `
        SELECT 
            * 
        FROM 
            todo 
        WHERE 
            status='${status}' AND priority='${priority}' AND todo LIKE '%${search_q}%';`;
      break;
    case hasPriorityProperty(request.query):
      getsQuery = `
        SELECT 
            *
        FROM 
            todo
        WHERE
            priority='${priority}' AND todo LIKE '%${search_q}%';`;
      break;
    case hasStatusProperty(request.query):
      getsQuery = `
        SELECT 
            *
        FROM 
            todo
        WHERE
            todo LIKE '%${search_q}%' AND status='${status}';`;
      break;
    default:
      getsQuery = `
            SELECT
                *
            FROM
                todo
            WHERE
                todo LIKE '%${search_q}%';`;
  }
  data = await db.all(getsQuery);
  response.send(data);
});

//API-2
app.get(`/todos/:todoId/`, async (request, response) => {
  const { todoId } = request.params;
  const idQuery = `
  SELECT
    *
  FROM
    todo
  WHERE
    id=${todoId};`;
  const idBased = await db.get(idQuery);
  response.send(idBased);
});

//API-3
app.get("/agenda/", async (request, response) => {
  const date = format(new Date(2021, 1, 21), "yyyy-MM-dd");
  const dateQuery = `
  SELECT
    *
  FROM
    todo
  WHERE
    due_date=${date};`;
  const dateBased = await db.get(dateQuery);
  response.send(dateBased);
});

module.exports = app;
