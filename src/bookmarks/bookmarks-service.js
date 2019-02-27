require('dotenv').config()
const knex = require('knex')





const BookmarksService = {

    getBookmarkList(knex){
        return knex.select('*').from('bookmarks');
    },

    insertBookmark(knex, newItem){
        return knex
                .insert(newItem)
                .into('bookmarks')
                .returning('*')
                .then(rows =>{
                    return rows[0];
                })
    },

    deleteBookmark(knex, id){
        return knex
                .where({id})
                .delete()
    },

    updateBookmark(knex, id, newItemFields){
        return knex
                .where({id})
                .update(newItemFields)
    },

    getById(knex, id){
        return knex
                .select('*')
                .from('bookmarks')
                .where({id})
                .first()
    }


    
};

module.exports = BookmarksService;
