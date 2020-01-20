'use strict'
const User = require('../models/User');
const config = require('../config/query');

module.exports = class userService {
    
    /*
        in a user view: should show all books
    */
    static getById(id) {
        return User.findById(
            id,
        )
        .select('-facebook')
        .exec();
    }

    /*
        in a global view: should show only available books
    */
    static getMany(
        excludeId = null,
        includeIDs = [],
        page = 0,
        sortOrder = '-',
        sortBy = 'recieved',
    ) {
        const filter = {'books.available': { $eq: true}, '_id': { $ne: excludeId }, 'facebook.id': {$in: includeIDs}};
        const perPage = config.pagination.resultsPerPage;
        return User
            .find(filter)
            .select('-facebook')
            .sort(sortOrder + sortBy)
            .skip(perPage * page)
            .limit(perPage)
            .exec();
    }

    static async addBook(userId, book) {
        const userDoc = await User.findById(userId).exec();
        if(!userDoc) throw 'User not found!'
        if(userDoc.books.id(book)) throw 'You already have the book!';
        userDoc.books.push(book);
        await userDoc.save();
        return book;
    }

    static async findBookById(userId,bookId) {
        const userDoc = await User.findById(userId).exec();
        if(!userDoc) throw 'User not found!'

        const bookDoc = userDoc.books.id(bookId);
        return bookDoc;
    }

    static async updateBookById(userId, bookId, book){
        const userDoc = await User.findById(userId).exec();
        if(!userDoc) throw 'User not found!'

        const bookDoc = userDoc.books.id(bookId);
        bookDoc.set(book);
        await userDoc.save();
        return bookDoc;
    }

    static async deleteBookById(userId, bookId){
        const userDoc = await User.findById(userId).exec();
        if(!userDoc) throw 'User not found!'
        
        userDoc.books.id(bookId).remove();
        await userDoc.save();
        return null;
    }

    static async updateRating(requesting, receiving) {
        const requestingDoc = await User.findById(requesting).exec();
        if(!requestingDoc) throw 'User not found!';
        requestingDoc.recived++;
        await requestingDoc.save();

        const receivingDoc = await User.findById(receiving).exec();
        if(!receivingDoc) throw 'User not found!';
        receivingDoc.given++;
        await receivingDoc.save();
    }

    static updateById(id, user){
        return User.updateOne({_id:id},user).exec();
    }

}

