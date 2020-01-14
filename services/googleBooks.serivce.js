/*
    take only the needed info from api
*/
const cleanseBook = (book) => {
    const newBook={};
    newBook.id=book.id;
    newBook.title=book.volumeInfo.title;
    // newBook.thumbnail=book.volumeInfo.imageLinks && book.volumeInfo.imageLinks.smallThumbnail
    newBook.thumbnail= `https://books.google.com/books/content?id=${book.id}&printsec=frontcover&img=1&zoom=1&h=160&stbn=1&key=${APIKey}`
    newBook.author=book.volumeInfo.authors && book.volumeInfo.authors.join(', ');
    newBook.more=book.volumeInfo.infoLink;
    return newBook;
}

export const searchBook = async (bookName) => {
    try {
        maxResults = 4;
        const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${bookName}&maxResults=${maxResults}&key=${APIKey}`);
        const resJson = await res.json();
        if(!resJson.totalItems) return [];
        const books = resJson.items;
        const formattedBooks = books.map(cleanseBook);
        return formattedBooks;
    } catch(error) {
        console.log('httpError: ',error);
    }

}

export const getBookById = async (id) => {
    try {
        const res = await fetch(`https://www.googleapis.com/books/v1/volumes/${id}?key=${APIKey}`);
        const book = await res.json();
        const formattedBook = cleanseBook(book);
        return formattedBook;
    } catch(error) {
        console.log('httpError: ',error);
    }
}

const APIKey = process.env.GOOGLE_API_KEY;