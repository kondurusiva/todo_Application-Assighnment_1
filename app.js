const express = require("express");
const addDays = require("date-fns/addDays");
const app = express();
const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const format = require("date-fns/format");
const isMatch = require("date-fns/isMatch");
const isValid = require("date-fns/isValid");

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

const outputQuery = (eachItem) => {
  return {
    id: eachItem.id,
    todo: eachItem.todo,
    priority: eachItem.priority,
    category: eachItem.category,
    status: eachItem.status,
    dueDate: eachItem.dueDate,
  };
};

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
  const { date } = request.query;
  console.log(isMatch(date, "yyyy-MM-dd"));

  if (isMatch(date, "yyyy-MM-dd")) {
    const newDate = format(new Date(date), "yyyy-MM-dd");
    console.log(newDate);

    const dateQuery = `
  SELECT
    *
  FROM
    todo
  WHERE
    due_date=${newDate};`;
    const dateBased = await db.all(dateQuery);
    response.send(dateBased);
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }
});

//API-4
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;

  const postMethod = `
    INSERT INTO todo(id,todo,priority,status,category,dueDate)
    VALUES (${id},${todo},${priority},${status},${category},${dueDate});`;

  await db.run(postMethod);
  response.send("Todo Successfully Added");
});

//API-5
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { status, priority, todo, category, dueDate } = requist.body;

  const putMethod = `
    UPDATE todo
    SET id=${todoId},
        status=${status},
        priority=${priority},
        todo=${todo},
        category=${category},
        dueDate=${dueDate}
    WHERE id=${todoId};`;
  await db.run(putMethod);
  response.send("Status Updated");
});

//API-6
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;

  const deleteQuery = `
    DELETE FROM todo WHERE id=${todoId};`;
  await db.run(deleteQuery);
  response.send("Todo Deleted");
});
module.exports = app;
