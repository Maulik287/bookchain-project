const fs = require('fs');
const path = require('path');
const { initialUsers, initialBooks, initialHistories } = require('./seedData');

const DATA_FILE = path.join(__dirname, 'store.json');
const HOLD_LIMIT_DAYS = 15;
const PENALTY_PER_DAY = 5;

class DataStore {
  constructor() {
    this.data = {
      users: [],
      books: [],
      histories: [],
      payments: []
    };
    this.init();
  }

  init() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        if (!Array.isArray(this.data.users)) {
          this.data.users = [...initialUsers];
        } else {
          // Keep registered student accounts separate, but ensure initial demo profiles + admin are loaded
          const nonDemoUsers = this.data.users.filter(
            u => !initialUsers.some(init => init._id === u._id || (init.email && u.email && init.email.toLowerCase() === u.email.toLowerCase()))
          );
          this.data.users = [...initialUsers, ...nonDemoUsers];
        }
        if (!Array.isArray(this.data.payments)) {
          this.data.payments = [];
        }
        // Backfill claimedAt / requestQueue on seeded claimed books if missing
        let migrated = false;
        this.data.books.forEach(b => {
          if (!Array.isArray(b.requestQueue)) {
            const seedMatch = initialBooks.find(ib => ib._id === b._id);
            b.requestQueue = seedMatch && Array.isArray(seedMatch.requestQueue) ? [...seedMatch.requestQueue] : [];
            migrated = true;
          }
          if (b.status === 'Claimed' && !b.claimedAt) {
            const seedMatch = initialBooks.find(ib => ib._id === b._id);
            b.claimedAt = (seedMatch && seedMatch.claimedAt) || new Date(Date.now() - 19 * 86400000).toISOString();
            b.dueDate = new Date(new Date(b.claimedAt).getTime() + HOLD_LIMIT_DAYS * 86400000).toISOString();
            b.penaltyPaid = false;
            migrated = true;
          }
          // Ensure book_math_105 is also demonstrated as Claimed with queue on first migration
          if (b._id === 'book_math_105' && b.status === 'Available' && (!b.requestQueue || b.requestQueue.length === 0) && !this.data._v2Migrated) {
            const seedMatch = initialBooks.find(ib => ib._id === 'book_math_105');
            if (seedMatch) {
              b.status = seedMatch.status;
              b.claimedAt = seedMatch.claimedAt;
              b.dueDate = seedMatch.dueDate;
              b.penaltyPaid = false;
              b.requestQueue = [...seedMatch.requestQueue];
              migrated = true;
            }
          }
        });
        if (!this.data._v2Migrated) {
          this.data._v2Migrated = true;
          migrated = true;
        }
        if (migrated) this.save();
        console.log(`[Store] Loaded persistent data from ${DATA_FILE}`);
      } else {
        this.data = {
          users: [...initialUsers],
          books: [...initialBooks],
          histories: [...initialHistories],
          payments: [],
          _v2Migrated: true
        };
        this.save();
        console.log('[Store] Seeded fresh book exchange data store.');
      }
    } catch (err) {
      console.error('[Store] Error loading data, initializing seed:', err);
      this.data = {
        users: [...initialUsers],
        books: [...initialBooks],
        histories: [...initialHistories],
        payments: [],
        _v2Migrated: true
      };
    }
  }

  save() {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[Store] Failed to save data store:', err);
    }
  }

  // --- Users ---
  findUserByEmail(email) {
    if (!email) return null;
    const q = email.toLowerCase();
    return this.data.users.find(
      u => (u.email && u.email.toLowerCase() === q) || (u.username && u.username.toLowerCase() === q)
    );
  }

  findUserById(id) {
    return this.data.users.find(u => u._id === id);
  }

  findUserByUsn(usn) {
    if (!usn) return null;
    return this.data.users.find(u => u.usn && u.usn.toUpperCase() === usn.toUpperCase());
  }

  createUser(userData) {
    const newUser = {
      _id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      createdAt: new Date().toISOString(),
      isDemo: false, // Never save newly registered users as demo profiles
      role: 'student',
      ...userData
    };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  getDemoUsers() {
    // Strictly return only the 4 official demo student profiles (Ashwath, Maulik, Priya, Rohan)
    return initialUsers.filter(u => u.role !== 'admin').map(({ password, ...rest }) => rest);
  }

  getAllUsers() {
    return this.data.users.map(({ password, ...rest }) => rest);
  }

  // --- Books ---
  getAllBooks(filters = {}) {
    let result = [...this.data.books];

    if (filters.genre && filters.genre !== 'All') {
      result = result.filter(b => b.genre.toLowerCase() === filters.genre.toLowerCase());
    }

    if (filters.condition && filters.condition !== 'All') {
      result = result.filter(b => b.condition.toLowerCase().includes(filters.condition.toLowerCase()));
    }

    if (filters.status && filters.status !== 'All') {
      result = result.filter(b => b.status.toLowerCase() === filters.status.toLowerCase());
    }

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(b => 
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        (b.subject && b.subject.toLowerCase().includes(q)) ||
        (b.courseCode && b.courseCode.toLowerCase().includes(q))
      );
    }

    // Populate currentOwner & initialOwner info
    return result.map(book => this.populateBook(book));
  }

  getBookById(id) {
    const book = this.data.books.find(b => b._id === id);
    if (!book) return null;
    return this.populateBook(book);
  }

  computeBookLoanInfo(book) {
    if (book.status !== 'Claimed') {
      return {
        isClaimed: false,
        limitDays: HOLD_LIMIT_DAYS,
        penaltyRatePerDay: PENALTY_PER_DAY,
        claimedAt: null,
        dueDate: null,
        daysHeld: 0,
        daysRemaining: HOLD_LIMIT_DAYS,
        overdueDays: 0,
        rawPenaltyAmount: 0,
        penaltyAmount: 0,
        penaltyPaid: false,
        penaltyPaidAt: null,
        penaltyTxnId: null,
        isOverdue: false
      };
    }

    const claimedAt = book.claimedAt || book.createdAt || new Date().toISOString();
    const claimedMs = new Date(claimedAt).getTime();
    const dueMs = claimedMs + HOLD_LIMIT_DAYS * 86400000;
    const dueDate = book.dueDate || new Date(dueMs).toISOString();
    const daysHeld = Math.max(0, Math.floor((Date.now() - claimedMs) / 86400000));
    const daysRemaining = Math.max(0, HOLD_LIMIT_DAYS - daysHeld);
    const overdueDays = Math.max(0, daysHeld - HOLD_LIMIT_DAYS);
    const rawPenaltyAmount = overdueDays * PENALTY_PER_DAY;
    const penaltyPaid = !!book.penaltyPaid;
    const penaltyAmount = penaltyPaid ? 0 : rawPenaltyAmount;

    return {
      isClaimed: true,
      limitDays: HOLD_LIMIT_DAYS,
      penaltyRatePerDay: PENALTY_PER_DAY,
      claimedAt,
      dueDate,
      daysHeld,
      daysRemaining,
      overdueDays,
      rawPenaltyAmount,
      penaltyAmount,
      penaltyPaid,
      penaltyPaidAt: book.penaltyPaidAt || null,
      penaltyTxnId: book.penaltyTxnId || null,
      isOverdue: overdueDays > 0 && !penaltyPaid
    };
  }

  populateBook(book) {
    const currentOwner = this.findUserById(book.currentOwner);
    const initialOwner = this.findUserById(book.initialOwner);
    const rawQueue = Array.isArray(book.requestQueue) ? book.requestQueue : [];
    const populatedQueue = rawQueue.map((reqItem, index) => {
      const reqUser = this.findUserById(reqItem.userId);
      return {
        position: index + 1,
        userId: reqItem.userId,
        name: reqUser ? reqUser.name : 'Student Peer',
        email: reqUser ? reqUser.email : '',
        department: reqUser ? reqUser.department : '',
        requestedAt: reqItem.requestedAt
      };
    });

    return {
      ...book,
      loanInfo: this.computeBookLoanInfo(book),
      requestQueue: populatedQueue,
      currentOwner: currentOwner ? {
        _id: currentOwner._id,
        name: currentOwner.name,
        email: currentOwner.email,
        usn: currentOwner.usn,
        department: currentOwner.department,
        semester: currentOwner.semester,
        phone: currentOwner.phone
      } : { _id: book.currentOwner, name: 'Student Peer', email: '', usn: '' },
      initialOwner: initialOwner ? {
        _id: initialOwner._id,
        name: initialOwner.name,
        email: initialOwner.email,
        usn: initialOwner.usn
      } : null
    };
  }

  createBook(bookData, userId) {
    const newBook = {
      _id: 'book_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      currentOwner: userId,
      initialOwner: userId,
      status: 'Available',
      totalHops: 1,
      claimedAt: null,
      dueDate: null,
      penaltyPaid: false,
      requestQueue: [],
      createdAt: new Date().toISOString(),
      ...bookData
    };
    this.data.books.unshift(newBook);

    // Create initial genesis ownership history entry
    const genesisHistory = {
      _id: 'hist_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      book: newBook._id,
      previousOwner: null,
      newOwner: userId,
      transferDate: new Date().toISOString(),
      conditionAtTransfer: newBook.condition || 'Good',
      notes: newBook.currentOwnerNotes || 'Initial book listing registered on the exchange chain.',
      academicSemesterUsed: newBook.semesterUsed || 'Current Semester',
      studentFeedback: 'Initial owner listing book for exchange.',
      location: newBook.location || 'College Campus',
      transactionHash: 'CHAIN-GENESIS-' + Math.random().toString(36).substring(2, 8).toUpperCase()
    };
    this.data.histories.push(genesisHistory);

    this.save();
    return this.populateBook(newBook);
  }

  updateBook(id, updateData, userId) {
    const index = this.data.books.findIndex(b => b._id === id);
    if (index === -1) return null;

    const book = this.data.books[index];
    if (book.currentOwner !== userId) {
      throw new Error('Not authorized to edit this book listing.');
    }

    this.data.books[index] = {
      ...book,
      ...updateData,
      _id: book._id,
      currentOwner: book.currentOwner,
      initialOwner: book.initialOwner
    };
    this.save();
    return this.populateBook(this.data.books[index]);
  }

  deleteBook(id, userId) {
    const index = this.data.books.findIndex(b => b._id === id);
    if (index === -1) return false;

    if (this.data.books[index].currentOwner !== userId) {
      throw new Error('Not authorized to delete this book listing.');
    }

    this.data.books.splice(index, 1);
    this.save();
    return true;
  }

  // --- Claim & Ownership Chain Transfer Workflow ---
  claimBook(bookId, claimantUserId, claimDetails = {}) {
    const bookIndex = this.data.books.findIndex(b => b._id === bookId);
    if (bookIndex === -1) {
      throw new Error('Book not found in catalogue.');
    }

    const book = this.data.books[bookIndex];

    // Validation 1: Book must be available
    if (book.status !== 'Available') {
      throw new Error('This book is currently claimed or not available for exchange.');
    }

    // Validation 2: Claimant cannot be current owner
    if (book.currentOwner === claimantUserId) {
      throw new Error('You cannot claim a book you already currently own.');
    }

    const previousOwnerId = book.currentOwner;
    const nowIso = new Date().toISOString();
    const dueIso = new Date(Date.now() + HOLD_LIMIT_DAYS * 86400000).toISOString();

    // Update book status and new owner with 15-day time limit
    book.currentOwner = claimantUserId;
    book.status = 'Claimed';
    book.claimedAt = nowIso;
    book.dueDate = dueIso;
    book.penaltyPaid = false;
    book.penaltyPaidAt = null;
    book.penaltyTxnId = null;
    book.totalHops = (book.totalHops || 1) + 1;
    if (Array.isArray(book.requestQueue)) {
      book.requestQueue = book.requestQueue.filter(r => r.userId !== claimantUserId);
    } else {
      book.requestQueue = [];
    }
    if (claimDetails.currentCondition) {
      book.condition = claimDetails.currentCondition;
    }
    if (claimDetails.notes) {
      book.currentOwnerNotes = claimDetails.notes;
    }

    // Append history entry
    const newHistory = {
      _id: 'hist_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      book: bookId,
      previousOwner: previousOwnerId,
      newOwner: claimantUserId,
      transferDate: nowIso,
      conditionAtTransfer: claimDetails.currentCondition || book.condition,
      notes: claimDetails.notes || 'Successfully handed over to peer (15-day limit started).',
      academicSemesterUsed: claimDetails.academicSemesterUsed || 'Current Semester',
      studentFeedback: claimDetails.studentFeedback || 'Book claimed and handed over through college exchange chain.',
      location: claimDetails.location || 'Central Library / Campus Quadrangle',
      transactionHash: 'CHAIN-HOP-' + Math.random().toString(36).substring(2, 8).toUpperCase()
    };

    this.data.histories.push(newHistory);
    this.save();

    return {
      book: this.populateBook(book),
      historyRecord: this.populateHistory(newHistory)
    };
  }

  // --- FCFS Request Queue (Requested by person: Req 1, Req 2 - First Come First Serve) ---
  requestBook(bookId, userId) {
    const book = this.data.books.find(b => b._id === bookId);
    if (!book) throw new Error('Book not found in catalogue.');
    if (book.status === 'Available') {
      throw new Error('This book is currently Available — you can claim it directly without joining a queue.');
    }
    if (book.currentOwner === userId) {
      throw new Error('You already hold this book.');
    }
    if (!Array.isArray(book.requestQueue)) {
      book.requestQueue = [];
    }
    if (book.requestQueue.some(r => r.userId === userId)) {
      throw new Error('You are already in the First-Come-First-Serve request queue for this book.');
    }

    book.requestQueue.push({
      userId,
      requestedAt: new Date().toISOString()
    });
    this.save();
    return this.populateBook(book);
  }

  cancelBookRequest(bookId, userId) {
    const book = this.data.books.find(b => b._id === bookId);
    if (!book) throw new Error('Book not found in catalogue.');
    if (!Array.isArray(book.requestQueue)) {
      book.requestQueue = [];
    }
    book.requestQueue = book.requestQueue.filter(r => r.userId !== userId);
    this.save();
    return this.populateBook(book);
  }

  // --- Payment Gateway: Pay Overdue Penalty (₹5/day beyond 15-day limit) ---
  payBookPenalty(bookId, userId, paymentDetails = {}) {
    const book = this.data.books.find(b => b._id === bookId);
    if (!book) throw new Error('Book not found in catalogue.');

    const loanInfo = this.computeBookLoanInfo(book);
    if (!loanInfo.isOverdue || loanInfo.penaltyAmount <= 0) {
      throw new Error('No unpaid overdue penalty exists for this book.');
    }

    const user = this.findUserById(userId);
    const txnId = 'TXN_BC_' + Date.now().toString(36).toUpperCase() + '_' + Math.random().toString(36).substring(2, 6).toUpperCase();
    const nowIso = new Date().toISOString();

    const paymentRecord = {
      _id: 'pay_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      txnId,
      bookId: book._id,
      bookTitle: book.title,
      userId,
      userName: user ? user.name : 'Student Peer',
      userEmail: user ? user.email : '',
      overdueDays: loanInfo.overdueDays,
      ratePerDay: PENALTY_PER_DAY,
      amount: loanInfo.penaltyAmount,
      method: paymentDetails.method || 'UPI',
      paymentRef: paymentDetails.paymentRef || 'msrit@upi',
      status: 'SUCCESS',
      paidAt: nowIso
    };

    if (!Array.isArray(this.data.payments)) {
      this.data.payments = [];
    }
    this.data.payments.unshift(paymentRecord);

    book.penaltyPaid = true;
    book.penaltyPaidAt = nowIso;
    book.penaltyTxnId = txnId;
    this.save();

    return {
      payment: paymentRecord,
      book: this.populateBook(book)
    };
  }

  // Pass It On: Enforce penalty clearance, pass to Req #1 (FCFS) if queue exists, else loop back to Book DB
  relistBook(bookId, userId, relistDetails = {}) {
    const bookIndex = this.data.books.findIndex(b => b._id === bookId);
    if (bookIndex === -1) throw new Error('Book not found');

    const book = this.data.books[bookIndex];
    if (book.currentOwner !== userId) {
      throw new Error('Only the current holder can pass this book on.');
    }

    // Check 15-day time limit & ₹5/day penalty
    const loanInfo = this.computeBookLoanInfo(book);
    if (loanInfo.penaltyAmount > 0) {
      const err = new Error(`Overdue by ${loanInfo.overdueDays} day(s). Please clear your ₹${loanInfo.penaltyAmount} penalty (₹5/day) via the Payment Gateway before passing this book on.`);
      err.code = 'PENALTY_REQUIRED';
      err.penaltyAmount = loanInfo.penaltyAmount;
      err.overdueDays = loanInfo.overdueDays;
      throw err;
    }

    if (relistDetails.condition) book.condition = relistDetails.condition;
    if (relistDetails.notes) book.currentOwnerNotes = relistDetails.notes;

    // If FCFS Request Queue has waiting students -> automatically pass to Req 1 (First Come First Serve)
    if (Array.isArray(book.requestQueue) && book.requestQueue.length > 0) {
      const nextReq = book.requestQueue.shift();
      const nextUser = this.findUserById(nextReq.userId);
      const previousOwnerId = book.currentOwner;
      const nowIso = new Date().toISOString();
      const dueIso = new Date(Date.now() + HOLD_LIMIT_DAYS * 86400000).toISOString();

      book.currentOwner = nextReq.userId;
      book.status = 'Claimed';
      book.claimedAt = nowIso;
      book.dueDate = dueIso;
      book.penaltyPaid = false;
      book.penaltyPaidAt = null;
      book.penaltyTxnId = null;
      book.totalHops = (book.totalHops || 1) + 1;

      const newHistory = {
        _id: 'hist_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        book: bookId,
        previousOwner: previousOwnerId,
        newOwner: nextReq.userId,
        transferDate: nowIso,
        conditionAtTransfer: book.condition,
        notes: relistDetails.notes || `Passed on via FCFS Request Queue to ${nextUser ? nextUser.name : 'next student'}.`,
        academicSemesterUsed: 'Current Semester',
        studentFeedback: 'Automatic First-Come-First-Serve handoff on Pass It On.',
        location: 'Campus Exchange Point',
        transactionHash: 'CHAIN-FCFS-' + Math.random().toString(36).substring(2, 8).toUpperCase()
      };
      this.data.histories.push(newHistory);
      this.save();

      return {
        book: this.populateBook(book),
        passedToNext: true,
        nextOwner: nextUser ? { _id: nextUser._id, name: nextUser.name, email: nextUser.email } : null
      };
    }

    // Queue empty -> Loop back to Book DB as Available
    book.status = 'Available';
    book.claimedAt = null;
    book.dueDate = null;
    book.penaltyPaid = false;
    book.penaltyPaidAt = null;
    book.penaltyTxnId = null;

    this.save();
    return {
      book: this.populateBook(book),
      passedToNext: false,
      nextOwner: null
    };
  }

  // --- Admin Panel Operations ---
  getAdminOverview() {
    const books = this.data.books.map(b => this.populateBook(b));
    const users = this.getAllUsers();
    const payments = Array.isArray(this.data.payments) ? this.data.payments : [];

    const claimedBooks = books.filter(b => b.status === 'Claimed');
    const overdueBooks = books.filter(b => b.loanInfo && b.loanInfo.isOverdue);
    const totalPendingPenalties = overdueBooks.reduce((sum, b) => sum + (b.loanInfo?.penaltyAmount || 0), 0);
    const totalCollectedPenalties = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalQueuedRequests = books.reduce((sum, b) => sum + (b.requestQueue?.length || 0), 0);

    return {
      stats: {
        totalBooks: books.length,
        availableBooks: books.filter(b => b.status === 'Available').length,
        claimedBooks: claimedBooks.length,
        overdueBooks: overdueBooks.length,
        totalPendingPenalties,
        totalCollectedPenalties,
        totalQueuedRequests,
        totalUsers: users.filter(u => u.role !== 'admin').length,
        totalTransactions: payments.length
      },
      books,
      users,
      payments
    };
  }

  adminWaivePenalty(bookId) {
    const book = this.data.books.find(b => b._id === bookId);
    if (!book) throw new Error('Book not found');
    book.penaltyPaid = true;
    book.penaltyPaidAt = new Date().toISOString();
    book.penaltyTxnId = 'ADMIN-WAIVED';
    this.save();
    return this.populateBook(book);
  }

  adminForceRelist(bookId) {
    const book = this.data.books.find(b => b._id === bookId);
    if (!book) throw new Error('Book not found');
    book.status = 'Available';
    book.claimedAt = null;
    book.dueDate = null;
    book.penaltyPaid = false;
    book.penaltyPaidAt = null;
    book.penaltyTxnId = null;
    this.save();
    return this.populateBook(book);
  }

  adminSimulateOverdue(bookId, daysAgo = 19) {
    const book = this.data.books.find(b => b._id === bookId);
    if (!book) throw new Error('Book not found');
    const claimedMs = Date.now() - daysAgo * 86400000;
    book.status = 'Claimed';
    book.claimedAt = new Date(claimedMs).toISOString();
    book.dueDate = new Date(claimedMs + HOLD_LIMIT_DAYS * 86400000).toISOString();
    book.penaltyPaid = false;
    book.penaltyPaidAt = null;
    book.penaltyTxnId = null;
    this.save();
    return this.populateBook(book);
  }

  adminDeleteBook(bookId) {
    const idx = this.data.books.findIndex(b => b._id === bookId);
    if (idx === -1) return false;
    this.data.books.splice(idx, 1);
    this.save();
    return true;
  }

  // --- Book Journey & Ownership History ---
  getBookJourney(bookId) {
    const book = this.getBookById(bookId);
    if (!book) return null;

    const histories = this.data.histories
      .filter(h => h.book === bookId)
      .sort((a, b) => new Date(a.transferDate) - new Date(b.transferDate))
      .map(h => this.populateHistory(h));

    return {
      book,
      chainLength: histories.length,
      genesisDate: histories[0] ? histories[0].transferDate : book.createdAt,
      history: histories
    };
  }

  populateHistory(hist) {
    const prev = hist.previousOwner ? this.findUserById(hist.previousOwner) : null;
    const next = this.findUserById(hist.newOwner);

    return {
      ...hist,
      previousOwner: prev ? {
        _id: prev._id,
        name: prev.name,
        usn: prev.usn,
        department: prev.department
      } : null,
      newOwner: next ? {
        _id: next._id,
        name: next.name,
        usn: next.usn,
        department: next.department
      } : { _id: hist.newOwner, name: 'Student Peer', usn: 'STUDENT' }
    };
  }

  // --- User Dashboard Aggregations ---
  getUserDashboard(userId) {
    const user = this.findUserById(userId);
    if (!user) throw new Error('User not found');

    const { password, ...userSafe } = user;

    // Books currently owned
    const ownedBooks = this.data.books
      .filter(b => b.currentOwner === userId)
      .map(b => this.populateBook(b));

    // Books listed originally by user
    const listedBooks = this.data.books
      .filter(b => b.initialOwner === userId)
      .map(b => this.populateBook(b));

    // Books previously held and given away (previousOwner === userId)
    const passedHistories = this.data.histories.filter(h => h.previousOwner === userId);
    const givenAwayBookIds = [...new Set(passedHistories.map(h => h.book))];
    const givenAwayBooks = this.data.books
      .filter(b => givenAwayBookIds.includes(b._id) && b.currentOwner !== userId)
      .map(b => this.populateBook(b));

    // Full journey logs involving this user
    const userHistories = this.data.histories
      .filter(h => h.previousOwner === userId || h.newOwner === userId)
      .sort((a, b) => new Date(b.transferDate) - new Date(a.transferDate))
      .map(h => this.populateHistory(h));

    return {
      user: userSafe,
      stats: {
        totalOwned: ownedBooks.length,
        totalListed: listedBooks.length,
        totalGivenAway: givenAwayBooks.length,
        totalExchangesParticipated: userHistories.length
      },
      ownedBooks,
      listedBooks,
      givenAwayBooks,
      activityHistory: userHistories
    };
  }

  // Reset to initial seed (useful for testing or college demo)
  resetDemoData() {
    this.data = {
      users: [...initialUsers],
      books: [...initialBooks],
      histories: [...initialHistories]
    };
    this.save();
    return true;
  }
}

module.exports = new DataStore();
