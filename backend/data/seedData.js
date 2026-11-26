const bcrypt = require('bcryptjs');

// Hash helper for DOB password
const hashPassword = (pwd) => bcrypt.hashSync(pwd, 10);

const ADMIN_USERNAME = (process.env.ADMIN_USERNAME || 'library.incharge@msrit.edu').trim().toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'LibIncharge@2026';

const initialUsers = [
  {
    _id: 'usr_admin_00',
    name: 'Library Incharge',
    username: ADMIN_USERNAME,
    email: ADMIN_USERNAME,
    usn: '',
    role: 'admin',
    dob: '',
    password: hashPassword(ADMIN_PASSWORD),
    department: 'Central Library Administration',
    semester: 'Admin',
    phone: '+91 80 2360 0822',
    isDemo: false,
    createdAt: new Date('2026-08-01T08:00:00Z').toISOString()
  },
  {
    _id: 'usr_ashwath_01',
    name: 'Ashwath G Hegde',
    email: '1ms25ci404@msrit.edu',
    usn: '1MS25CI404',
    role: 'student',
    dob: '14-07-2004',
    password: hashPassword('14-07-2004'),
    department: 'Computer Science & Engineering',
    semester: '5th Sem',
    phone: '+91 98451 22345',
    isDemo: true,
    createdAt: new Date('2026-08-10T09:00:00Z').toISOString()
  },
  {
    _id: 'usr_maulik_02',
    name: 'Maulik Tondwal',
    email: '1ms24ci070@msrit.edu',
    usn: '1MS24CI070',
    role: 'student',
    dob: '20-11-2003',
    password: hashPassword('20-11-2003'),
    department: 'Computer Science & Engineering',
    semester: '4th Sem',
    phone: '+91 98860 33456',
    isDemo: true,
    createdAt: new Date('2026-08-11T10:30:00Z').toISOString()
  },
  {
    _id: 'usr_priya_03',
    name: 'Priya Sharma',
    email: '1ms24ci085@msrit.edu',
    usn: '1MS24CI085',
    role: 'student',
    dob: '05-03-2004',
    password: hashPassword('05-03-2004'),
    department: 'Information Science & Engineering',
    semester: '4th Sem',
    phone: '+91 94480 77890',
    isDemo: true,
    createdAt: new Date('2026-08-12T11:00:00Z').toISOString()
  },
  {
    _id: 'usr_rohan_04',
    name: 'Rohan Deshmukh',
    email: '1ms23ci042@msrit.edu',
    usn: '1MS23CI042',
    role: 'student',
    dob: '12-09-2002',
    password: hashPassword('12-09-2002'),
    department: 'Computer Science & Engineering',
    semester: '6th Sem',
    phone: '+91 97410 99123',
    isDemo: true,
    createdAt: new Date('2026-08-01T08:00:00Z').toISOString()
  }
];

const initialBooks = [
  // 1. CLRS
  {
    _id: 'book_clrs_101',
    title: 'Introduction to Algorithms (CLRS)',
    author: 'Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest',
    genre: 'Computer Science',
    subject: 'Design & Analysis of Algorithms',
    courseCode: '24CIE554',
    edition: '4th Edition (MIT Press)',
    isbn: '978-0262046305',
    condition: 'Good (Light Notes)',
    status: 'Available',
    currentOwner: 'usr_maulik_02',
    initialOwner: 'usr_rohan_04',
    description: 'Standard textbook for Design and Analysis of Algorithms. Contains highlighted notes on Dynamic Programming, Greedy Algorithms, and Graph Theory (BFS/DFS). Clean pages, no torn edges.',
    currentOwnerNotes: 'Used for CIE 1 and Semester Exam. Passing it forward for juniors tackling DAA!',
    exchangeType: 'Free Donation',
    coverImage: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&q=80&w=800',
    totalHops: 3,
    createdAt: new Date('2026-08-15T14:20:00Z').toISOString()
  },
  // 2. DBMS
  {
    _id: 'book_dbms_102',
    title: 'Database System Concepts',
    author: 'Abraham Silberschatz, Henry F. Korth, S. Sudarshan',
    genre: 'Computer Science',
    subject: 'Database Management Systems',
    courseCode: '24CIE552',
    edition: '7th Edition (McGraw Hill)',
    isbn: '978-0078022159',
    condition: 'Pristine / Like New',
    status: 'Available',
    currentOwner: 'usr_ashwath_01',
    initialOwner: 'usr_ashwath_01',
    description: 'Comprehensive guide covering Relational Calculus, SQL transactions, ACID properties, B+ Trees indexing, and normalization forms (1NF through BCNF). Highly recommended for Lab 5.',
    currentOwnerNotes: 'Mint condition with plastic binding. Ready for handover at Central Library 1st floor.',
    exchangeType: 'Exchange for Subject Book',
    coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800',
    totalHops: 1,
    createdAt: new Date('2026-09-02T16:45:00Z').toISOString()
  },
  // 3. Operating Systems
  {
    _id: 'book_os_103',
    title: 'Operating System Concepts (Dinosaur Book)',
    author: 'Abraham Silberschatz, Peter B. Galvin, Greg Gagne',
    genre: 'Computer Science',
    subject: 'Operating Systems & System Software',
    courseCode: '24CIE553',
    edition: '10th Edition (Wiley)',
    isbn: '978-1118063330',
    condition: 'Good (Light Notes)',
    status: 'Available',
    currentOwner: 'usr_priya_03',
    initialOwner: 'usr_rohan_04',
    description: 'Covers process scheduling, semaphore synchronization, banker algorithm for deadlock avoidance, virtual memory paging, and Linux kernel internals.',
    currentOwnerNotes: 'Has handy sticky notes on chapter 5 (CPU Scheduling) and chapter 7 (Deadlocks).',
    exchangeType: 'Free Donation',
    coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800',
    totalHops: 2,
    createdAt: new Date('2026-09-10T11:15:00Z').toISOString()
  },
  // 4. Computer Networks (Overdue 4 days with 2 students in FCFS Queue)
  {
    _id: 'book_net_104',
    title: 'Computer Networks - A Systems Approach',
    author: 'Larry L. Peterson, Bruce S. Davie',
    genre: 'Computer Science',
    subject: 'Computer Networks & Protocols',
    courseCode: '24CIE555',
    edition: '6th Edition',
    isbn: '978-0128182000',
    condition: 'Fair (Readable)',
    status: 'Claimed',
    currentOwner: 'usr_ashwath_01',
    initialOwner: 'usr_priya_03',
    claimedAt: new Date(Date.now() - 19 * 86400000).toISOString(),
    dueDate: new Date(Date.now() - 4 * 86400000).toISOString(),
    penaltyPaid: false,
    requestQueue: [
      { userId: 'usr_maulik_02', requestedAt: new Date(Date.now() - 3 * 86400000).toISOString() },
      { userId: 'usr_priya_03', requestedAt: new Date(Date.now() - 1 * 86400000).toISOString() }
    ],
    description: 'Complete syllabus guide for OSI Model, TCP/IP handshake, sliding window protocols, CIDR routing, and DNS architecture.',
    currentOwnerNotes: 'Currently claimed by Ashwath Hegde for upcoming Network Lab practicals.',
    exchangeType: 'Free Donation',
    coverImage: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=800',
    totalHops: 2,
    createdAt: new Date('2026-09-18T10:00:00Z').toISOString()
  },
  // 5. Higher Engineering Mathematics (Claimed 10 days ago, 5 days remaining, 1 in FCFS Queue)
  {
    _id: 'book_math_105',
    title: 'Higher Engineering Mathematics',
    author: 'Dr. B.S. Grewal',
    genre: 'Mathematics',
    subject: 'Engineering Mathematics III & IV',
    courseCode: '24MAT401',
    edition: '44th Edition',
    isbn: '978-8193328491',
    condition: 'Good (Light Notes)',
    status: 'Claimed',
    currentOwner: 'usr_maulik_02',
    initialOwner: 'usr_ashwath_01',
    claimedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    dueDate: new Date(Date.now() + 5 * 86400000).toISOString(),
    penaltyPaid: false,
    requestQueue: [
      { userId: 'usr_priya_03', requestedAt: new Date(Date.now() - 2 * 86400000).toISOString() }
    ],
    description: 'The definitive textbook for engineering mathematics: Laplace transforms, Fourier series, partial differential equations, and complex analysis. Solved question bank included.',
    currentOwnerNotes: 'Helped score an S grade in 3rd sem math. Great worked examples for exam prep.',
    exchangeType: 'Free Donation',
    coverImage: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=800',
    totalHops: 2,
    createdAt: new Date('2026-09-25T13:30:00Z').toISOString()
  },
  // 6. Theory of Computation
  {
    _id: 'book_toc_106',
    title: 'Introduction to Automata Theory, Languages, and Computation',
    author: 'John E. Hopcroft, Rajeev Motwani, Jeffrey D. Ullman',
    genre: 'Computer Science',
    subject: 'Theory of Computation & Automata',
    courseCode: '24CIE551',
    edition: '3rd Edition (Pearson)',
    isbn: '978-0321455369',
    condition: 'Good (Light Notes)',
    status: 'Available',
    currentOwner: 'usr_ashwath_01',
    initialOwner: 'usr_rohan_04',
    description: 'Classic text on Deterministic & Non-deterministic Finite Automata (DFA/NFA), Regular Expressions, Context-Free Grammars, Pushdown Automata, and Turing Machines.',
    currentOwnerNotes: 'Annotated solutions for Pumping Lemma proofs and CFG Chomsky Normal Form.',
    exchangeType: 'Free Donation',
    coverImage: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&q=80&w=800',
    totalHops: 2,
    createdAt: new Date('2026-09-28T09:15:00Z').toISOString()
  },
  // 7. Artificial Intelligence
  {
    _id: 'book_ai_107',
    title: 'Artificial Intelligence: A Modern Approach',
    author: 'Stuart Russell, Peter Norvig',
    genre: 'Computer Science',
    subject: 'Artificial Intelligence & Machine Learning',
    courseCode: '24AIML501',
    edition: '4th Global Edition',
    isbn: '978-0134610993',
    condition: 'Pristine / Like New',
    status: 'Available',
    currentOwner: 'usr_maulik_02',
    initialOwner: 'usr_maulik_02',
    description: 'The worldwide benchmark for AI: informed search (A* search, minimax), constraint satisfaction problems, probabilistic reasoning, and deep reinforcement learning.',
    currentOwnerNotes: 'Brand new edition used during CIE 2. Clean spine with zero markings.',
    exchangeType: 'Free Donation',
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800',
    totalHops: 1,
    createdAt: new Date('2026-10-01T11:00:00Z').toISOString()
  },
  // 8. Software Engineering
  {
    _id: 'book_se_108',
    title: "Software Engineering: A Practitioner's Approach",
    author: 'Roger S. Pressman, Bruce R. Maxim',
    genre: 'Computer Science',
    subject: 'Software Engineering & Agile Methodologies',
    courseCode: '24CIE556',
    edition: '9th Edition (McGraw Hill)',
    isbn: '978-1259872976',
    condition: 'Good (Light Notes)',
    status: 'Available',
    currentOwner: 'usr_priya_03',
    initialOwner: 'usr_rohan_04',
    description: 'Covers SDLC models, Scrum/Agile sprints, UML architectural design, software testing metrics, and CI/CD pipelines.',
    currentOwnerNotes: 'Contains helpful diagrams for SRS documentation and use-case modeling.',
    exchangeType: 'Exchange for Subject Book',
    coverImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800',
    totalHops: 2,
    createdAt: new Date('2026-10-04T14:30:00Z').toISOString()
  },
  // 9. Compiler Design
  {
    _id: 'book_compiler_109',
    title: 'Compilers: Principles, Techniques, and Tools (Dragon Book)',
    author: 'Alfred V. Aho, Monica S. Lam, Ravi Sethi, Jeffrey D. Ullman',
    genre: 'Computer Science',
    subject: 'Compiler Design & Lexical Analysis',
    courseCode: '24CIE601',
    edition: '2nd Edition (Pearson)',
    isbn: '978-0321486813',
    condition: 'Good (Light Notes)',
    status: 'Available',
    currentOwner: 'usr_rohan_04',
    initialOwner: 'usr_rohan_04',
    description: 'The legendary Dragon Book covering Lex/Yacc, LL(1) and LR(1) parsing tables, intermediate code representation, and loop optimization.',
    currentOwnerNotes: 'Essential guide for the 6th semester Compiler Lab project.',
    exchangeType: 'Free Donation',
    coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800',
    totalHops: 1,
    createdAt: new Date('2026-10-08T16:00:00Z').toISOString()
  },
  // 10. Cryptography
  {
    _id: 'book_crypto_110',
    title: 'Cryptography and Network Security: Principles and Practice',
    author: 'William Stallings',
    genre: 'Computer Science',
    subject: 'Cryptography & Cyber Security',
    courseCode: '24CIE602',
    edition: '8th Edition',
    isbn: '978-0135764039',
    condition: 'Pristine / Like New',
    status: 'Available',
    currentOwner: 'usr_ashwath_01',
    initialOwner: 'usr_ashwath_01',
    description: 'Standard textbook for AES, RSA, Diffie-Hellman key exchange, SHA-3 hashing, digital signatures, and TLS protocols.',
    currentOwnerNotes: 'Flawless copy with solved numerical problems on modular arithmetic and RSA.',
    exchangeType: 'Free Donation',
    coverImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800',
    totalHops: 1,
    createdAt: new Date('2026-10-10T12:00:00Z').toISOString()
  },
  // 11. Data Structures
  {
    _id: 'book_dsa_111',
    title: 'Data Structures and Algorithms in Java',
    author: 'Robert Lafore',
    genre: 'Computer Science',
    subject: 'Data Structures & Problem Solving',
    courseCode: '24CIE302',
    edition: '2nd Edition (Sams Publishing)',
    isbn: '978-0672324536',
    condition: 'Good (Light Notes)',
    status: 'Available',
    currentOwner: 'usr_maulik_02',
    initialOwner: 'usr_priya_03',
    description: 'Intuitive visual guide for arrays, linked lists, stacks, queues, binary search trees, red-black trees, and hash tables with Java implementations.',
    currentOwnerNotes: 'Fantastic beginner-friendly book that makes pointer concepts crystal clear.',
    exchangeType: 'Free Donation',
    coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800',
    totalHops: 2,
    createdAt: new Date('2026-10-12T10:45:00Z').toISOString()
  },
  // 12. Computer Organization & Architecture
  {
    _id: 'book_ca_112',
    title: 'Computer Organization and Architecture: Designing for Performance',
    author: 'William Stallings',
    genre: 'Computer Science',
    subject: 'Computer Architecture & Microprocessors',
    courseCode: '24CIE403',
    edition: '11th Edition',
    isbn: '978-0134772806',
    condition: 'Good (Light Notes)',
    status: 'Available',
    currentOwner: 'usr_priya_03',
    initialOwner: 'usr_rohan_04',
    description: 'Detailed coverage of pipelining hazards, cache memory mapping (direct, associative), RAID architecture, and RISC-V vs CISC instruction sets.',
    currentOwnerNotes: 'Highlighters on Cache hit/miss ratio calculation and Amdahl law questions.',
    exchangeType: 'Free Donation',
    coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800',
    totalHops: 2,
    createdAt: new Date('2026-10-15T15:20:00Z').toISOString()
  },
  // 13. Discrete Mathematics
  {
    _id: 'book_discrete_113',
    title: 'Discrete Mathematics and Its Applications',
    author: 'Kenneth H. Rosen',
    genre: 'Mathematics',
    subject: 'Discrete Mathematical Structures & Graph Theory',
    courseCode: '24MAT301',
    edition: '8th Edition (McGraw-Hill)',
    isbn: '978-1259676512',
    condition: 'Pristine / Like New',
    status: 'Available',
    currentOwner: 'usr_ashwath_01',
    initialOwner: 'usr_ashwath_01',
    description: 'Comprehensive resource on propositional logic, set theory, recurrence relations, Pigeonhole principle, and Euler/Hamiltonian graphs.',
    currentOwnerNotes: 'Pristine copy with all chapter summary sheets intact. Must-read for CSE 3rd sem.',
    exchangeType: 'Free Donation',
    coverImage: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=800',
    totalHops: 1,
    createdAt: new Date('2026-10-18T13:00:00Z').toISOString()
  },
  // 14. Digital Signal Processing
  {
    _id: 'book_dsp_114',
    title: 'Digital Signal Processing: Principles, Algorithms & Applications',
    author: 'John G. Proakis, Dimitris G. Manolakis',
    genre: 'Electronics',
    subject: 'Digital Signal Processing & Filter Design',
    courseCode: '24ECE402',
    edition: '4th Edition (Pearson)',
    isbn: '978-0131873742',
    condition: 'Good (Light Notes)',
    status: 'Available',
    currentOwner: 'usr_rohan_04',
    initialOwner: 'usr_rohan_04',
    description: 'Comprehensive coverage of discrete-time signals, Z-transforms, Discrete Fourier Transform (DFT), FFT algorithms, and IIR/FIR filter realization.',
    currentOwnerNotes: 'Complete worked solutions for Butterworth and Chebyshev filter design.',
    exchangeType: 'Exchange for Subject Book',
    coverImage: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800',
    totalHops: 1,
    createdAt: new Date('2026-10-20T11:30:00Z').toISOString()
  },
  // 15. CMOS VLSI Design
  {
    _id: 'book_vlsi_115',
    title: 'CMOS VLSI Design: A Circuits and Systems Perspective',
    author: 'Neil H.E. Weste, David Money Harris',
    genre: 'Electronics',
    subject: 'VLSI Design & Semiconductor Electronics',
    courseCode: '24ECE503',
    edition: '4th Edition (Addison-Wesley)',
    isbn: '978-0321547743',
    condition: 'Good (Light Notes)',
    status: 'Available',
    currentOwner: 'usr_priya_03',
    initialOwner: 'usr_ashwath_01',
    description: 'Covers MOSFET fabrication, CMOS inverter DC characteristics, dynamic logic circuits, memory arrays, and layout DRC rules.',
    currentOwnerNotes: 'Has notes on Euler path and stick diagram drawing conventions.',
    exchangeType: 'Free Donation',
    coverImage: 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=800',
    totalHops: 2,
    createdAt: new Date('2026-10-22T14:00:00Z').toISOString()
  },
  // 16. Cloud Computing
  {
    _id: 'book_cloud_116',
    title: 'Cloud Computing: Concepts, Technology & Architecture',
    author: 'Thomas Erl, Ricardo Puttini, Zaigham Mahmood',
    genre: 'Computer Science',
    subject: 'Cloud Computing & Distributed Systems',
    courseCode: '24CIE604',
    edition: '1st Edition (Prentice Hall)',
    isbn: '978-0133387520',
    condition: 'Pristine / Like New',
    status: 'Available',
    currentOwner: 'usr_maulik_02',
    initialOwner: 'usr_maulik_02',
    description: 'Covers IaaS/PaaS/SaaS delivery models, hypervisor virtualization, elastic scalability, microservices orchestration, and SLA metrics.',
    currentOwnerNotes: 'Very clean with sticky tags on AWS and containerization chapters.',
    exchangeType: 'Free Donation',
    coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800',
    totalHops: 1,
    createdAt: new Date('2026-10-25T09:30:00Z').toISOString()
  },
  // 17. Engineering Physics
  {
    _id: 'book_physics_117',
    title: 'Engineering Physics: Modern Physics & Optics',
    author: 'Dr. S.L. Gupta, Sanjeev Gupta',
    genre: 'Physics',
    subject: 'Engineering Physics & Quantum Mechanics',
    courseCode: '24PHY101',
    edition: '42nd Edition',
    isbn: '978-8189904258',
    condition: 'Good (Light Notes)',
    status: 'Available',
    currentOwner: 'usr_ashwath_01',
    initialOwner: 'usr_rohan_04',
    description: 'First-year core textbook: Quantum mechanics, de Broglie hypothesis, Lasers and Fiber Optics, Superconductivity, and Nanomaterials.',
    currentOwnerNotes: 'Passed down from senior Rohan Deshmukh. Helped score top marks in physics CIE.',
    exchangeType: 'Free Donation',
    coverImage: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&q=80&w=800',
    totalHops: 2,
    createdAt: new Date('2026-10-27T16:15:00Z').toISOString()
  },
  // 18. Microelectronic Circuits
  {
    _id: 'book_micro_118',
    title: 'Microelectronic Circuits: Theory and Applications',
    author: 'Adel S. Sedra, Kenneth C. Smith',
    genre: 'Electronics',
    subject: 'Analog Electronics & Circuit Analysis',
    courseCode: '24ECE301',
    edition: '7th Edition (Oxford University Press)',
    isbn: '978-0199339136',
    condition: 'Good (Light Notes)',
    status: 'Available',
    currentOwner: 'usr_rohan_04',
    initialOwner: 'usr_rohan_04',
    description: 'Gold-standard textbook for BJT and MOSFET amplifier biasing, small-signal models, frequency response, differential amplifiers, and operational amplifiers.',
    currentOwnerNotes: 'Solid textbook with clear op-amp circuit diagrams. Excellent for analog design.',
    exchangeType: 'Free Donation',
    coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800',
    totalHops: 1,
    createdAt: new Date('2026-10-29T10:00:00Z').toISOString()
  }
];

const initialHistories = [
  // 1. CLRS Chain
  {
    _id: 'hist_01',
    book: 'book_clrs_101',
    previousOwner: null,
    newOwner: 'usr_rohan_04',
    transferDate: new Date('2025-08-10T10:00:00Z').toISOString(),
    conditionAtTransfer: 'Pristine / Like New',
    notes: 'Bought brand new from College Book House for 3rd semester DAA course.',
    academicSemesterUsed: '3rd Semester (2025)',
    studentFeedback: 'Best algorithmic resource. Solved Cormen exercise problems for Greedy approach.',
    location: 'Campus Bookstore',
    transactionHash: 'CHAIN-GENESIS-01'
  },
  {
    _id: 'hist_02',
    book: 'book_clrs_101',
    previousOwner: 'usr_rohan_04',
    newOwner: 'usr_priya_03',
    transferDate: new Date('2026-02-05T15:00:00Z').toISOString(),
    conditionAtTransfer: 'Good (Light Notes)',
    notes: 'Handed over outside Canteen. Pages in great condition, pencil annotations on heapsort.',
    academicSemesterUsed: '4th Semester (2026)',
    studentFeedback: 'Helped ace the lab internal evaluation on shortest path algorithms.',
    location: 'Student Activity Canteen',
    transactionHash: 'CHAIN-HOP-02A'
  },
  {
    _id: 'hist_03',
    book: 'book_clrs_101',
    previousOwner: 'usr_priya_03',
    newOwner: 'usr_maulik_02',
    transferDate: new Date('2026-08-15T14:20:00Z').toISOString(),
    conditionAtTransfer: 'Good (Light Notes)',
    notes: 'Exchanged at Central Library 2nd floor desk. Re-bound spine.',
    academicSemesterUsed: '4th Semester (2026)',
    studentFeedback: 'Extremely clean copy. Handled with care.',
    location: 'Central Library 2nd Floor',
    transactionHash: 'CHAIN-HOP-03B'
  },

  // 2. DBMS Chain
  {
    _id: 'hist_04',
    book: 'book_dbms_102',
    previousOwner: null,
    newOwner: 'usr_ashwath_01',
    transferDate: new Date('2026-09-02T16:45:00Z').toISOString(),
    conditionAtTransfer: 'Pristine / Like New',
    notes: 'Initial listing by Ashwath Hegde. Brand new condition with protective plastic cover.',
    academicSemesterUsed: '5th Semester (2026)',
    studentFeedback: 'Essential reference for Normalization and SQL indexing labs.',
    location: 'Department of CSE Room 304',
    transactionHash: 'CHAIN-GENESIS-02'
  },

  // 3. OS Chain
  {
    _id: 'hist_05',
    book: 'book_os_103',
    previousOwner: null,
    newOwner: 'usr_rohan_04',
    transferDate: new Date('2025-09-01T10:00:00Z').toISOString(),
    conditionAtTransfer: 'Pristine / Like New',
    notes: 'Purchased for OS course semester 4.',
    academicSemesterUsed: '4th Semester (2025)',
    studentFeedback: 'Very clear explanations of virtual memory and Peterson algorithm.',
    location: 'Main Gate',
    transactionHash: 'CHAIN-GENESIS-03'
  },
  {
    _id: 'hist_06',
    book: 'book_os_103',
    previousOwner: 'usr_rohan_04',
    newOwner: 'usr_priya_03',
    transferDate: new Date('2026-09-10T11:15:00Z').toISOString(),
    conditionAtTransfer: 'Good (Light Notes)',
    notes: 'Handover completed at Sports Complex gazebo.',
    academicSemesterUsed: '4th Semester (2026)',
    studentFeedback: 'Clean and well kept. Ready for next peer!',
    location: 'Sports Complex Gazebo',
    transactionHash: 'CHAIN-HOP-06C'
  },

  // 4. Networks Chain
  {
    _id: 'hist_07',
    book: 'book_net_104',
    previousOwner: null,
    newOwner: 'usr_priya_03',
    transferDate: new Date('2026-03-01T09:00:00Z').toISOString(),
    conditionAtTransfer: 'Good',
    notes: 'Original textbook acquired for Networking fundamentals.',
    academicSemesterUsed: '4th Semester',
    studentFeedback: 'Comprehensive coverage of socket programming.',
    location: 'IT Lab 2',
    transactionHash: 'CHAIN-GENESIS-04'
  },
  {
    _id: 'hist_08',
    book: 'book_net_104',
    previousOwner: 'usr_priya_03',
    newOwner: 'usr_ashwath_01',
    transferDate: new Date('2026-09-18T10:00:00Z').toISOString(),
    conditionAtTransfer: 'Fair (Readable)',
    notes: 'Transferred to Ashwath Hegde for final semester network protocols research.',
    academicSemesterUsed: '5th Semester',
    studentFeedback: 'Cover slightly soft, but all diagrams and tables are 100% crisp.',
    location: 'Department of CSE Seminar Hall',
    transactionHash: 'CHAIN-HOP-08D'
  },

  // 5. Math Chain
  {
    _id: 'hist_09',
    book: 'book_math_105',
    previousOwner: null,
    newOwner: 'usr_ashwath_01',
    transferDate: new Date('2025-08-20T10:00:00Z').toISOString(),
    conditionAtTransfer: 'Pristine',
    notes: 'Original copy used for 3rd semester engineering mathematics.',
    academicSemesterUsed: '3rd Semester',
    studentFeedback: 'Solved Fourier transformation equations accurately.',
    location: 'College Library',
    transactionHash: 'CHAIN-GENESIS-05'
  },
  {
    _id: 'hist_10',
    book: 'book_math_105',
    previousOwner: 'usr_ashwath_01',
    newOwner: 'usr_maulik_02',
    transferDate: new Date('2026-09-25T13:30:00Z').toISOString(),
    conditionAtTransfer: 'Good (Light Notes)',
    notes: 'Transferred directly to Maulik Tondwal for semester 4 math review.',
    academicSemesterUsed: '4th Semester',
    studentFeedback: 'Outstanding reference book with complete step-by-step proofs.',
    location: 'Civil Quadrangle Benches',
    transactionHash: 'CHAIN-HOP-10E'
  },

  // 6. TOC Chain
  {
    _id: 'hist_11',
    book: 'book_toc_106',
    previousOwner: null,
    newOwner: 'usr_rohan_04',
    transferDate: new Date('2025-08-15T11:00:00Z').toISOString(),
    conditionAtTransfer: 'Pristine',
    notes: 'Purchased for Theory of Computation.',
    academicSemesterUsed: '5th Semester (2025)',
    studentFeedback: 'Best reference for state transitions and automata diagrams.',
    location: 'Mechanical Block Reading Room',
    transactionHash: 'CHAIN-GENESIS-06'
  },
  {
    _id: 'hist_12',
    book: 'book_toc_106',
    previousOwner: 'usr_rohan_04',
    newOwner: 'usr_ashwath_01',
    transferDate: new Date('2026-09-28T09:15:00Z').toISOString(),
    conditionAtTransfer: 'Good (Light Notes)',
    notes: 'Passed to Ashwath Hegde for CIE 1 revision.',
    academicSemesterUsed: '5th Semester (2026)',
    studentFeedback: 'Pencil marks on pumping lemma chapters are very helpful.',
    location: 'Central Library Ground Floor',
    transactionHash: 'CHAIN-HOP-12F'
  },

  // 7. AI Chain
  {
    _id: 'hist_13',
    book: 'book_ai_107',
    previousOwner: null,
    newOwner: 'usr_maulik_02',
    transferDate: new Date('2026-10-01T11:00:00Z').toISOString(),
    conditionAtTransfer: 'Pristine / Like New',
    notes: 'Genesis listing by Maulik Tondwal for 24AIML501.',
    academicSemesterUsed: '5th Semester',
    studentFeedback: 'World-standard textbook on search algorithms and machine learning fundamentals.',
    location: 'CSE Innovation Lab',
    transactionHash: 'CHAIN-GENESIS-07'
  },

  // 8. Software Engineering Chain
  {
    _id: 'hist_14',
    book: 'book_se_108',
    previousOwner: null,
    newOwner: 'usr_rohan_04',
    transferDate: new Date('2025-09-12T10:00:00Z').toISOString(),
    conditionAtTransfer: 'Pristine',
    notes: 'Bought for Software Engineering sprint planning.',
    academicSemesterUsed: '5th Semester (2025)',
    studentFeedback: 'Great case studies on Scrum sprint cycles.',
    location: 'Architecture Quad',
    transactionHash: 'CHAIN-GENESIS-08'
  },
  {
    _id: 'hist_15',
    book: 'book_se_108',
    previousOwner: 'usr_rohan_04',
    newOwner: 'usr_priya_03',
    transferDate: new Date('2026-10-04T14:30:00Z').toISOString(),
    conditionAtTransfer: 'Good (Light Notes)',
    notes: 'Exchanged outside Canteen with Priya Sharma.',
    academicSemesterUsed: '4th Semester (2026)',
    studentFeedback: 'Clean copy, essential for software testing syllabus.',
    location: 'Student Canteen',
    transactionHash: 'CHAIN-HOP-15G'
  },

  // 9. Compiler Design Chain
  {
    _id: 'hist_16',
    book: 'book_compiler_109',
    previousOwner: null,
    newOwner: 'usr_rohan_04',
    transferDate: new Date('2026-10-08T16:00:00Z').toISOString(),
    conditionAtTransfer: 'Good (Light Notes)',
    notes: 'Original copy used for Compiler Lab course.',
    academicSemesterUsed: '6th Semester',
    studentFeedback: 'Legendary Dragon book with complete Lex & Yacc syntax parser guides.',
    location: 'CSE Seminar Hall 2',
    transactionHash: 'CHAIN-GENESIS-09'
  },

  // 10. Cryptography Chain
  {
    _id: 'hist_17',
    book: 'book_crypto_110',
    previousOwner: null,
    newOwner: 'usr_ashwath_01',
    transferDate: new Date('2026-10-10T12:00:00Z').toISOString(),
    conditionAtTransfer: 'Pristine / Like New',
    notes: 'Genesis listing by Ashwath Hegde for Network Security.',
    academicSemesterUsed: '5th Semester',
    studentFeedback: 'Pristine condition with all mathematical cryptography formulas intact.',
    location: 'Central Library 1st Floor',
    transactionHash: 'CHAIN-GENESIS-10'
  },

  // 11. Data Structures Chain
  {
    _id: 'hist_18',
    book: 'book_dsa_111',
    previousOwner: null,
    newOwner: 'usr_priya_03',
    transferDate: new Date('2025-08-10T09:00:00Z').toISOString(),
    conditionAtTransfer: 'Pristine',
    notes: 'Acquired for 3rd semester Data Structures in Java.',
    academicSemesterUsed: '3rd Semester',
    studentFeedback: 'Visual illustrations helped grasp AVL tree balance factors easily.',
    location: 'ISE Dept Notice Board',
    transactionHash: 'CHAIN-GENESIS-11'
  },
  {
    _id: 'hist_19',
    book: 'book_dsa_111',
    previousOwner: 'usr_priya_03',
    newOwner: 'usr_maulik_02',
    transferDate: new Date('2026-10-12T10:45:00Z').toISOString(),
    conditionAtTransfer: 'Good (Light Notes)',
    notes: 'Handed over at Civil Block Cafe to Maulik.',
    academicSemesterUsed: '4th Semester',
    studentFeedback: 'Clean and well-preserved. Great practical examples.',
    location: 'Civil Block Cafe',
    transactionHash: 'CHAIN-HOP-19H'
  },

  // 12. Computer Architecture Chain
  {
    _id: 'hist_20',
    book: 'book_ca_112',
    previousOwner: null,
    newOwner: 'usr_rohan_04',
    transferDate: new Date('2025-09-05T10:00:00Z').toISOString(),
    conditionAtTransfer: 'Pristine',
    notes: 'Bought for 4th sem Computer Architecture course.',
    academicSemesterUsed: '4th Semester (2025)',
    studentFeedback: 'Helped solve pipelining branch prediction numericals.',
    location: 'Campus Amphitheater',
    transactionHash: 'CHAIN-GENESIS-12'
  },
  {
    _id: 'hist_21',
    book: 'book_ca_112',
    previousOwner: 'usr_rohan_04',
    newOwner: 'usr_priya_03',
    transferDate: new Date('2026-10-15T15:20:00Z').toISOString(),
    conditionAtTransfer: 'Good (Light Notes)',
    notes: 'Handover at IT Lab foyer.',
    academicSemesterUsed: '4th Semester (2026)',
    studentFeedback: 'Essential guide for understanding cache hierarchy and bus protocols.',
    location: 'IT Lab Foyer',
    transactionHash: 'CHAIN-HOP-21I'
  },

  // 13. Discrete Math Chain
  {
    _id: 'hist_22',
    book: 'book_discrete_113',
    previousOwner: null,
    newOwner: 'usr_ashwath_01',
    transferDate: new Date('2026-10-18T13:00:00Z').toISOString(),
    conditionAtTransfer: 'Pristine / Like New',
    notes: 'Genesis listing by Ashwath Hegde.',
    academicSemesterUsed: '3rd Semester',
    studentFeedback: 'Comprehensive coverage of relations, graph theory, and group theory.',
    location: 'Math Department Foyer',
    transactionHash: 'CHAIN-GENESIS-13'
  },

  // 14. DSP Chain
  {
    _id: 'hist_23',
    book: 'book_dsp_114',
    previousOwner: null,
    newOwner: 'usr_rohan_04',
    transferDate: new Date('2026-10-20T11:30:00Z').toISOString(),
    conditionAtTransfer: 'Good (Light Notes)',
    notes: 'Genesis listing by Rohan Deshmukh for ECE signal processing.',
    academicSemesterUsed: '4th Semester',
    studentFeedback: 'Clear derivations for FFT algorithms and FIR filter design.',
    location: 'Electronics Block 2nd Floor',
    transactionHash: 'CHAIN-GENESIS-14'
  },

  // 15. VLSI Design Chain
  {
    _id: 'hist_24',
    book: 'book_vlsi_115',
    previousOwner: null,
    newOwner: 'usr_ashwath_01',
    transferDate: new Date('2025-08-15T10:00:00Z').toISOString(),
    conditionAtTransfer: 'Pristine',
    notes: 'Acquired for VLSI circuit fundamentals.',
    academicSemesterUsed: '4th Semester',
    studentFeedback: 'Detailed stick diagrams and layout rules.',
    location: 'VLSI Research Lab',
    transactionHash: 'CHAIN-GENESIS-15'
  },
  {
    _id: 'hist_25',
    book: 'book_vlsi_115',
    previousOwner: 'usr_ashwath_01',
    newOwner: 'usr_priya_03',
    transferDate: new Date('2026-10-22T14:00:00Z').toISOString(),
    conditionAtTransfer: 'Good (Light Notes)',
    notes: 'Passed forward to Priya Sharma.',
    academicSemesterUsed: '4th Semester',
    studentFeedback: 'Great textbook for stick diagrams and Euler path analysis.',
    location: 'Library Reference Section',
    transactionHash: 'CHAIN-HOP-25J'
  },

  // 16. Cloud Computing Chain
  {
    _id: 'hist_26',
    book: 'book_cloud_116',
    previousOwner: null,
    newOwner: 'usr_maulik_02',
    transferDate: new Date('2026-10-25T09:30:00Z').toISOString(),
    conditionAtTransfer: 'Pristine / Like New',
    notes: 'Genesis listing by Maulik Tondwal.',
    academicSemesterUsed: '5th Semester',
    studentFeedback: 'Modern reference for cloud service models, hypervisors, and container security.',
    location: 'CSE Innovation Center',
    transactionHash: 'CHAIN-GENESIS-16'
  },

  // 17. Engineering Physics Chain
  {
    _id: 'hist_27',
    book: 'book_physics_117',
    previousOwner: null,
    newOwner: 'usr_rohan_04',
    transferDate: new Date('2025-08-01T10:00:00Z').toISOString(),
    conditionAtTransfer: 'Pristine',
    notes: 'Purchased for 1st year engineering physics.',
    academicSemesterUsed: '1st Semester',
    studentFeedback: 'Solid explanations of quantum wave functions and lasers.',
    location: 'Physics Lab Ground Floor',
    transactionHash: 'CHAIN-GENESIS-17'
  },
  {
    _id: 'hist_28',
    book: 'book_physics_117',
    previousOwner: 'usr_rohan_04',
    newOwner: 'usr_ashwath_01',
    transferDate: new Date('2026-10-27T16:15:00Z').toISOString(),
    conditionAtTransfer: 'Good (Light Notes)',
    notes: 'Handed over to Ashwath Hegde for physics revision.',
    academicSemesterUsed: '1st Semester',
    studentFeedback: 'Helpful numerical problem bank for exam preparation.',
    location: 'Central Library Lawn',
    transactionHash: 'CHAIN-HOP-28K'
  },

  // 18. Microelectronic Circuits Chain
  {
    _id: 'hist_29',
    book: 'book_micro_118',
    previousOwner: null,
    newOwner: 'usr_rohan_04',
    transferDate: new Date('2026-10-29T10:00:00Z').toISOString(),
    conditionAtTransfer: 'Good (Light Notes)',
    notes: 'Genesis listing by Rohan Deshmukh for analog microelectronics.',
    academicSemesterUsed: '5th Semester',
    studentFeedback: 'Best reference textbook for BJT and MOSFET small-signal amplifiers.',
    location: 'Electronics Block Reading Room',
    transactionHash: 'CHAIN-GENESIS-18'
  }
];

module.exports = {
  initialUsers,
  initialBooks,
  initialHistories
};
