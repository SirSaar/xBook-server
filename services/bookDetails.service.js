import * as googleBooks from './googleBooks.serivce';

export const getBook = (id) => {
    return googleBooks.getBookById(id);
}

export const searchBook = (bookName) => {
    return googleBooks.searchBook(bookName);
}

export const populateBook = async (book) => {
    const data = await getBook(book.id);
    return {...book, data };
}

export const populateUserBooks = async (user) => {
    user.books = await Promise.all(user.books.map(populateBook) );
    return user;
}

export const populateUsersBooks = async (users) => {
    const newUsers = await Promise.all(users.map( populateUserBooks ));
    return newUsers;
}

export const populateRequest = async (request) => {
    const data = await getBook(request.book);
    return {...request,book: data};
}

export const populateRequests = async (requests) => {
    return await Promise.all(
        requests.map(populateRequest)
    );
}