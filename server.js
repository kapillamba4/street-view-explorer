const express = require('express');
const path = require('path');
const app = express();
const port = 4200;

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));
let places = [];

app.get('/getPlaces', (req, res) => {
    res.send(places);
});

app.post('/set_route', (req, res) => {
    places = JSON.parse(req.body.data);
    res.send({
        success: true,
    });
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
});