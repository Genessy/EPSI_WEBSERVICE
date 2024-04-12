const express = require("express");
const postgres = require("postgres");
const z = require("zod");
var crypto = require("crypto");
var hash = crypto.createHash("sha512");

const app = express();
const port = 8000;
const sql = postgres({ db: "mydb", user: "user", password: "password" });

app.use(express.json());

// Schemas
const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  about: z.string(),
  price: z.number().positive(),
});

const CreateProductSchema = ProductSchema.omit({ id: true });

app.post("/products", async (req, res) => {
  const result = await CreateProductSchema.safeParse(req.body);

  // If Zod parsed successfully the request body
  if (result.success) {
    const { name, about, price } = result.data;

    const product = await sql`
    INSERT INTO products (name, about, price)
    VALUES (${name}, ${about}, ${price})
    RETURNING *
    `;

    res.send(product[0]);
  } else {
    res.status(400).send(result);
  }
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});

app.get("/products", async (req, res) => {
  const products = await sql`
      SELECT * FROM products
      `;

  res.send(products);
});

app.get("/products/:id", async (req, res) => {
  const product = await sql`
      SELECT * FROM products WHERE id=${req.params.id}
      `;

  if (product.length > 0) {
    res.send(product[0]);
  } else {
    res.status(404).send({ message: "Not found" });
  }
});

app.delete("/products/:id", async (req, res) => {
  const product = await sql`
      DELETE FROM products
      WHERE id=${req.params.id}
      RETURNING *
      `;

  if (product.length > 0) {
    res.send(product[0]);
  } else {
    res.status(404).send({ message: "Not found" });
  }
});

const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  password: z.string(),
});

const CreateUserSchema = UserSchema.omit({ id: true });

app.post("/users", async (req, res) => {
  const result = await CreateUserSchema.safeParse(req.body);
  if (result.success) {
    const { name, email, password } = result.data;
    data = hash.update(password, "utf-8");
    hash_password = data.digest("hex");
    const user = await sql`
      INSERT INTO users (name, email, password)
      VALUES (${name}, ${email}, ${hash_password})
      RETURNING name, email
      `;

    res.send(user[0]);
  } else {
    res.status(400).send(result);
  }
});

app.get("/users", async (req, res) => {
  const users = await sql`
        SELECT * FROM users
        `;
  res.send(users);
});

app.get("/users/:id", async (req, res) => {
  const user = await sql`
        SELECT * FROM users WHERE id=${req.params.id}
        `;

  if (user.length > 0) {
    res.send(user[0]);
  } else {
    res.status(404).send({ message: "Not found" });
  }
});

app.delete("/users/:id", async (req, res) => {
  const user = await sql`
        DELETE FROM users
        WHERE id=${req.params.id}
        RETURNING *
        `;

  if (user.length > 0) {
    res.send(user[0]);
  } else {
    res.status(404).send({ message: "Not found" });
  }
});

app.put("/users/:id", async (req, res) => {
  const result = await CreateUserSchema.safeParse(req.body);
  const { name, email, password } = result.data;
  data = hash.update(password, "utf-8");
  hash_password = data.digest("hex");
  const user = await sql`
        UPDATE users
        SET name = ${name} ,email = ${email},password = ${hash_password}
        WHERE id=${req.params.id}
        RETURNING *
        `;
  if (user.length > 0) {
    res.send(user[0]);
  } else {
    res.status(404).send({ message: "Not found" });
  }
});

app.get("/f2p-games", async (req, res) => {
  const response = await fetch("https://www.freetogame.com/api/games");
  const body = await response.json();
  res.send(body);
})

app.get("/rawg", async (req, res) => {
  const response = await fetch("https://api.rawg.io/api/games?key=f3d9b666c8824ab68ab7724ae2269a33");
  const body = await response.json();
  res.send(body);
})