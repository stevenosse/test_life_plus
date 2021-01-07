const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");

const app = express();
const path = require("path");
const fs = require("fs");

app.use(cors());
app.use(bodyParser.json());
app.use(fileUpload());

app.get("/", (req, res) => {
  res.json({
    message: "Welcome!",
  });
});

app.post("/import", async (req, res) => {
  if (req.files.length === 0)
    return res.json(
      {
        message: "Invalid file",
      },
      422
    );

  let gridSize = 0;
  let cellCoords = [];

  const file = req.files.data;
  const filePath = `${path.resolve()}/data/${file.name}`;

  req.files.data.mv(filePath);

  fs.readFile(filePath, "utf8", function (err, content) {
    if (err) {
      return console.log(err);
    }

    try {
      const parts = content.split("\n");
      if (content.length > 0) {
        gridSize = parseInt(parts[0]);
        cellCoords.push(...parts[1].split(";"));

        var gridData = new Array(gridSize).fill(false);
        for (let i = 0; i < gridData.length; i++) {
          gridData[i] = new Array(gridSize).fill(false);
        }

        for (let i = 0; i < gridSize; i++) {
          for (let j = 0; j < gridSize; j++) {
            gridData[i][j] = cellCoords.find((x) => x == `${i},${j}`)
              ? true
              : false;
          }
        }
      }
    } catch (e) {
      console.log(e);
    }

    res.json({ gridSize, gridData });
  });
});

app.post("/export", (req, res) => {
  if (!req.body.gridSize || !req.body.cellContent) {
    return res.json({
        message: "invalid data format",
      },
      422
    );
  }
  var content = `${req.body.gridSize}\n`;

  const cellContent = req.body.cellContent;
  content += cellContent;

  const filePath = `./data/culture.txt`;

  fs.writeFile(filePath, content, {}, function (err) {
    if (!err) {
      res.download(filePath);
    }
    console.log(err);
  });
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
