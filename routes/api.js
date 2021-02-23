/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";

// Connection
const mongoose = require("mongoose");
const db = mongoose.connect(process.env.DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const { Schema } = mongoose;

// Model for books with comments
const bookSchema = new Schema({
  title: { type: String, required: true },
  comments: [String],
});
const BookModel = mongoose.model("book", bookSchema);

module.exports = function (app) {
  app
    .route("/api/books")
    .get(function (req, res) {
      BookModel.find({}, (err, data) => {
        if (err) {
          res.json("error finding books");
        } else if (!data) {
          res.json([]);
        } else {
          const allBooks = data.map((book) => {
            return {
              _id: book._id,
              title: book.title,
              commentcount: book.comments.length,
            };
          });
          res.json(allBooks);
        }
      });
    })

    .post(function (req, res) {
      let title = req.body.title;
      if (!title || title == "") {
        res.json("missing required field title");
      } else {
        const bookData = new BookModel({ title, comments: [] });
        bookData.save((err, data) => {
          if (err || !data) {
            res.json("error saving the book");
          } else {
            res.json({ _id: data._id, title: data.title });
          }
        });
      }
    })

    .delete(function (req, res) {
      BookModel.remove({}, (err) => {
        if (err) {
          res.json("error deleting books");
        } else {
          res.json("complete delete successful");
        }
      });
    });

  app
    .route("/api/books/:id")
    .get(function (req, res) {
      let bookid = req.params.id;
      if (!bookid || bookid == "") {
        res.json("missing required book id");
      } else {
        BookModel.findById(bookid, (err, data) => {
          if (err || !data) {
            res.json("no book exists");
          } else {
            res.json({
              _id: data._id,
              title: data.title,
              comments: data.comments,
            });
          }
        });
      }
    })

    .post(function (req, res) {
      let bookid = req.params.id;
      let comment = req.body.comment;
      if (!comment || comment == "") {
        res.json("missing required field comment");
      } else {
        BookModel.findByIdAndUpdate(
          bookid,
          { $push: { comments: comment } },
          { new: true },
          (err, data) => {
            if (err || !data) {
              res.json("no book exists");
            } else {
              res.json({
                _id: data._id,
                title: data.title,
                comments: data.comments,
              });
            }
          }
        );
      }
    })

    .delete(function (req, res) {
      let bookid = req.params.id;
      BookModel.findByIdAndDelete(bookid, (err, data) => {
        if (err || !data) {
          res.json("no book exists");
        } else {
          res.json("delete successful");
        }
      });
    });
};
