const express = require('express')
const uuid = require('uuid/v4')
const { isWebUri } = require('valid-url')
const logger = require('../logger')
const store = require('../store')
const BookmarksService = require('./bookmarks-service')

const bookmarksRouter = express.Router()
const bodyParser = express.json()

const newBookmark = bookmark => ({
    id: bookmark.id,
    title: bookmark.title,
    description: bookmark.description,
    url: bookmark.url,
    rating: Number(bookmark.rating)
})


bookmarksRouter
.route('/bookmarks')
.get((req, res, next) => {
    BookmarksService.getBookmarkList(req.app.get('db'))
      .then(bookmarks =>{
          res.json(bookmarks.map(newBookmark))
      })
      .catch(next)
})
.post(bodyParser, (req, res, next) => {
    for (const field of ['title', 'url', 'rating']) {
    if (!req.body[field]) {
        logger.error(`${field} is required`)
        return res.status(400).send(`'${field}' is required`)
    }
    }
    const { title, url, description, rating } = req.body

    if (!Number.isInteger(rating) || rating < 0 || rating > 5) {
    logger.error(`Invalid rating '${rating}' supplied`)
    return res.status(400).send(`'rating' must be a number between 0 and 5`)
    }

    if (!isWebUri(url)) {
    logger.error(`Invalid url '${url}' supplied`)
    return res.status(400).send(`'url' must be a valid URL`)
    }

    const bookmark = { title, url, description, rating }

    BookmarksService.insertBookmark(
        req.app.get('db'),
        bookmark)
        .then(bookmark => {
            logger.info(`Bookmark with id ${bookmark.id} created`)
            res
            .status(201)
            .location(`http://localhost:8000/bookmarks/${bookmark.id}`)
            .json(newBookmark(bookmark))
        })
        .catch(next)

})

bookmarksRouter
.route('/bookmarks/:bookmark_id')
.all((req, res, next) =>{
    const { bookmark_id } = req.params
    BookmarksService.getById(
            req.app.get('db'),
          bookmark_id
        )
              .then(bookmark => {
                if (!bookmark) {
                  return res.status(404).json({
                    error: { message: `Bookmark doesn't exist` }
                 })
               }
                res.bookmark = bookmark // save the article for the next middleware
                next() // don't forget to call next so the next middleware happens!
              })
             .catch(next)
})
.get((req, res) => {
    res.json(newBookmark(res.bookmark))
})
.delete((req, res, next) => {
    const { bookmark_id } = req.params
    
    BookmarksService.deleteBookmark(req.app.get('db'), bookmark_id)
      .then(oldBookmark =>{
          logger.info(`Bookmark with ${bookmark_id} deleted`)
          res.status(204).end()
      })
      .catch(next)
})

module.exports = bookmarksRouter 