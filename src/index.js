const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

/**

 { 
	id: 'uuid', // precisa ser um uuid
	name: 'Danilo Vieira', 
	username: 'danilo', 
	todos: []
}

 */

const users = [];

function userExists(username) {
  return !!users.find((user) => user.username === username);
}

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  if (!userExists(username)) {
    return response.status(404).json({ error: "User not found" });
  }

  return next();
}

function checksNotExistsUserAccount(request, response, next) {
  const { username } = request.body;

  if (userExists(username)) {
    return response.status(400).json({ error: "User already exists" });
  }

  return next();
}

app.post("/users", checksNotExistsUserAccount, (request, response) => {
  const { name, username } = request.body;

  users.push({
    id: uuidv4(),
    name,
    username,
    todos: [],
  });

  return response.status(201).json(users[users.length - 1]);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const user = users.find((user) => user.username === username);

  return response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  user.todos.push({
    id: uuidv4(), // precisa ser um uuid
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  });

  return response.status(201).json(user.todos[user.todos.length - 1]);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { title, deadline } = request.body;
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);
  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: "Todo not found" });
  }

  todo.title = title;
  todo.deadline = new Date(deadline);

  response.json(todo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);
  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: "Todo not found" });
  }

  todo.done = true;

  return response.json(todo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { username } = request.headers;
  const user = users.find((user) => user.username === username);
  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: "Todo not found" });
  }

  user.todos = user.todos.filter((todo) => todo.id !== id);

  return response.status(204).json(todo);
});

module.exports = app;
