const express = require('express');
const app = express();
const port = 8080;

const cors = require('cors')
app.use(cors()); //habilitando cors na nossa aplicacao

app.use(express.static('src'));
app.listen(port, () => console.log(`Example app listening on port ${port}!`));