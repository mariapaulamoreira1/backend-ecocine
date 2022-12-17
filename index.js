const express = require("express");
const { Client } = require("pg");
const cors = require("cors");
const bodyparser = require("body-parser");
const config = require("./config");

const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyparser.json());

var conString = config.urlConnection;
var client = new Client(conString);
client.connect(function (err) {
  if (err) {
    return console.error("Não foi possível conectar ao banco.", err);
  }
  client.query("SELECT NOW()", function (err, result) {
    if (err) {
      return console.error("Erro ao executar a query.", err);
    }
    console.log(result.rows[0]);
  });
});

app.get("/", (req, res) => {
  console.log("Response ok.");
  res.send("Ok – Servidor disponível.");
});

app.get("/elementos", (req, res) => {
  try {
    client.query("SELECT * FROM Elementos", function (err, result) {
      if (err) {
        return console.error("Erro ao executar a qry de SELECT", err);
      }
      res.send(result.rows);
      //console.log("Chamou get elementos");
    });
  } catch (error) {
    console.log(error);
  }
});

app.get("/elementos/:id", (req, res) => {
  try {
    console.log("Chamou /:id " + req.params.id);
    client.query(
      "SELECT * FROM Elementos WHERE id = $1",
      [req.params.id],
      function (err, result) {
        if (err) {
          return console.error("Erro ao executar a qry de SELECT id", err);
        }
        res.send(result.rows);
        //console.log(result);
      }
    );
  } catch (error) {
    console.log(error);
  }
});

app.delete("/elementos/:id", (req, res) => {
  try {
    console.log("Chamou delete /:id " + req.params.id);
    const id = req.params.id;
    client.query(
      "DELETE FROM Elementos WHERE id = $1",
      [id],
      function (err, result) {
        if (err) {
          return console.error("Erro ao executar a qry de DELETE", err);
        } else {
          if (result.rowCount == 0) {
            res.status(400).json({ info: "Registro não encontrado." });
          } else {
            res.status(200).json({ info: `Registro excluído. Código: ${id}` });
          }
        }
        console.log(result);
      }
    );
  } catch (error) {
    console.log(error);
  }
});

app.post("/elementos", (req, res) => {
  try {
    console.log("Chamou post", req.body);
    const { nome, formato } = req.body;
    client.query(
      "INSERT INTO Elementos (nome, formato) VALUES ($1, $2) RETURNING * ",
      [nome, formato],
      (err, result) => {
        if (err) {
          return console.error("Erro ao executar a qry de INSERT", err);
        }
        const { id } = result.rows[0];
        res.setHeader("id", `${id}`);
        res.status(201).json(result.rows[0]);
        console.log(result);
      }
    );
  } catch (erro) {
    console.error(erro);
  }
});

app.put("/elementos/:id", (req, res) => {
  try {
    console.log("Chamou update", req.body);
    const id = req.params.id;
    const { nome, formato } = req.body;
    client.query(
      "UPDATE Elementos SET nome=$1, formato=$2 WHERE id =$3 ",
      [nome, formato, id],
      function (err, result) {
        if (err) {
          return console.error("Erro ao executar a qry de UPDATE", err);
        } else {
          res.setHeader("id", id);
          res.status(202).json({ id: id });
          console.log(result);
        }
      }
    );
  } catch (erro) {
    console.error(erro);
  }
});

//***** Tem que ficar no final*****/
app.listen(config.port, () =>
  console.log("Servidor funcionando na porta " + config.port)
);

module.exports = app; 