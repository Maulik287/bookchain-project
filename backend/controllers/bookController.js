const store = require('../data/storage');

// @desc Get all books with filters
// @route GET /api/books
const getBooks = (req, res) => {
  try {
    const { search, genre, condition, status } = req.query;
    const books = store.getAllBooks({ search, genre, condition, status });

    return res.json({
      success: true,
      count: books.length,
      data: books
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch book catalog: ' + err.message
    });
  }
};

// @desc Get single book by ID
// @route GET /api/books/:id
const getBookById = (req, res) => {
  try {
    const book = store.getBookById(req.params.id);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    return res.json({
      success: true,
      data: book
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch book details: ' + err.message
    });
  }
};

// @desc Create a new book listing
// @route POST /api/books
const createBook = (req, res) => {
  try {
    const {
      title,
      author,
      genre,
      subject,
      courseCode,
      edition,
      isbn,
      condition,
      description,
      currentOwnerNotes,
      exchangeType,
      coverImage
    } = req.body;

    if (!title || !author) {
      return res.status(400).json({
        success: false,
        message: 'Book title and author are required.'
      });
    }

    const newBook = store.createBook({
      title: title.trim(),
      author: author.trim(),
      genre: genre || 'Computer Science',
      subject: subject || 'Core Engineering',
      courseCode: courseCode || '24CIE554',
      edition: edition || 'Latest Edition',
      isbn: isbn || 'N/A',
      condition: condition || 'Good (Light Notes)',
      description: description || '',
      currentOwnerNotes: currentOwnerNotes || '',
      exchangeType: exchangeType || 'Free Donation',
      coverImage: coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800'
    }, req.user._id);

    return res.status(201).json({
      success: true,
      message: 'Book listed successfully on the exchange chain!',
      data: newBook
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to list book: ' + err.message
    });
  }
};

// @desc Update book listing
// @route PUT /api/books/:id
const updateBook = (req, res) => {
  try {
    const updated = store.updateBook(req.params.id, req.body, req.user._id);
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    return res.json({
      success: true,
      message: 'Book listing updated successfully.',
      data: updated
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc Delete book listing
// @route DELETE /api/books/:id
const deleteBook = (req, res) => {
  try {
    const success = store.deleteBook(req.params.id, req.user._id);
    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    return res.json({
      success: true,
      message: 'Book listing deleted successfully.'
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

module.exports = {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook
};
