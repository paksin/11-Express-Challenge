const express = require('express');
const path = require('path');
const fs = require('fs');

const PORT = process.env.PORT || 3001;

const app = express();

function randID() {
    const num = Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    return num;
}

// Middleware for parsing JSON and urlencoded from data
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

app.use(express.static('public'));

// GET route for notes page
app.get('/notes', (req, res) =>
    res.sendFile(path.join(__dirname, '/public/notes.html'))
);

// GET route for API
app.get('/api/notes', (req, res) => {
    res.sendFile(path.join(__dirname, '/db/db.json'));
});

app.post('/api/notes', (req, res) => {
    console.info(`${req.method} request received to add a note`);
    const {
        title,
        text
    } = req.body;
    if (title && text) {
        const newNote = {
            title,
            text,
            id: randID(),
        };
        fs.readFile('./db/db.json', 'utf8', (err, data) => {
            if (err) {
                console.error(err);
            } else {
                const parsedNotes = JSON.parse(data);
                parsedNotes.push(newNote);
                fs.writeFile(
                    './db/db.json',
                    JSON.stringify(parsedNotes, null, 4),
                    (writeErr) =>
                    writeErr ?
                    console.error(writeErr) :
                    console.info('Successfully updated notes!'));
            }
        });
        const response = {
            status: 'success',
            body: newNote,
        };
        console.log(response);
        res.status(201).json(response);
    } else {
        res.status(500).json('Error in posting note');
    }
});

// GET route for index page
app.get('*', (req, res) =>
    res.sendFile(path.join(__dirname, '/public/index.html'))
);

app.delete('/api/notes/:id', (req, res) => {
    console.info(`${req.method} request received to remove a note`);
    const noteId = req.params.id;
    fs.readFile('./db/db.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
        } else {
            const parsedNotes = JSON.parse(data);
            for (let i = 0; i < parsedNotes.length; i++) {
                if(parsedNotes[i].id == noteId){
                    parsedNotes.splice(i, 1);
                    break;
                }
            }
            fs.writeFile(
                './db/db.json',
                JSON.stringify(parsedNotes, null, 4),
                (writeErr) =>
                writeErr ?
                console.error(writeErr) :
                console.info('Successfully updated notes!'));
        }
    });
    const response = {
        status: 'success',
    };
    console.log(response);
    res.status(201).json(response);
})

app.listen(PORT, () =>
    console.log(`App listening at http://localhost:${PORT} 🚀`)
);