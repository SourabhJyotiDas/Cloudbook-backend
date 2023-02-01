const express = require("express");
const router = express.Router();
const Note = require("../Models/Notes");
const fetchuser = require("../middleware/fetchuser");
const { body, validationResult } = require("express-validator"); // express validator for valid name,email,password

// route1: get all notes using get "/api/notes/fetchallnotes"
router.get("/fetchallnotes", fetchuser, async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user.id });
        // console.log(note);
        res.json(notes);
    } catch (error) {
        console.log(error.message);
        res.status(500).send("internal server error");
    }
});

// route2: add a new notes using post "/api/notes/addnote"
router.post("/addnote",fetchuser,[
        body("title", "Enter you title").isLength({ min: 5 }),
        body("description", "description must be 5 character").isLength({ min: 5 }),
    ],
    async (req, res) => {
        //if there are errors, returns bad request and the errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const { title, description, tag } = req.body;

            const note = new Note({
                title,
                description,
                tag,
                user: req.user.id,
            });
            const saveNote = await note.save();
            res.json(saveNote);
        } catch (error) {
            console.log(error.message);
            res.status(500).send("internal server error");
        }
    }
);
///////////////////////////////////////////////////////////////////////////////////////////////////

// route3: update an existing notes using put "/api/notes/updatenote"
router.put("/updatenote/:id", fetchuser, async (req, res) => {
    try {
        const { title, description, tag } = req.body;
        const newNote = {};
        if (title) {
            newNote.title = title;
        }
        if (description) {
            newNote.description = description;
        }
        if (tag) {
            newNote.tag = tag;
        }
        // find the note to be update and update it

        let note = await Note.findById(req.params.id);
        if (!note) {
            return res.status(404).send("not found");
        }
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed");
        }
        note = await Note.findByIdAndUpdate(
            req.params.id,
            { $set: newNote },
            { new: true }
        );
        res.json({ note });
    } catch (error) {
        console.log(error.message);
        res.status(500).send("internal server error");
    }
});

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// route4: delete an existing notes using delete "/api/notes/deleteNote"
router.delete("/deletenote/:id", fetchuser, async (req, res) => {
    try {
        // find the note to be delete and delete it
        let note = await Note.findById(req.params.id);
        if (!note) {
            return res.status(404).send("not found");
        }

        // allow deletion only if user owns this note
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed");
        }

        note = await Note.findByIdAndDelete(req.params.id);
        res.json({ success: "Your note has been deleted", note: note });
    } catch (error) {
        console.log(error.message);
        res.status(500).send("internal server error");
    }
});
router.get("/fetchallusernotes", async (req, res) => {
    try {
        const notes = await Note.find();
        res.json(notes);
    } catch (error) {
        console.log(error.message);
        res.status(500).send("internal server error");
    }
});



module.exports = router;
