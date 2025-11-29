// Fake data for the application - replaces backend API calls

// Generate unique IDs
let idCounter = 1000;
const generateId = () => `fake-${idCounter++}`;

// Fake Users
export const fakeUsers = [
  {
    _id: "user-1",
    id: "user-1",
    name: "admin",
    email: "admin@example.com", // kept for compatibility
    role: "admin",
    password: "admin" // Login with name: 'admin', password: 'admin'
  },
  {
    _id: "user-2",
    id: "user-2",
    name: "user",
    email: "user@example.com", // kept for compatibility
    role: "user",
    password: "user" // Login with name: 'user', password: 'user'
  },
  {
    _id: "user-3",
    id: "user-3",
    name: "John Doe",
    email: "john@example.com",
    role: "user",
    password: "user123"
  }
];

// Fake Clients
export const fakeClients = [
  { _id: "client-1", name: "Client A", contact: "contact-a@example.com", phone: "123-456-7890" },
  { _id: "client-2", name: "Client B", contact: "contact-b@example.com", phone: "234-567-8901" },
  { _id: "client-3", name: "Client C", contact: "contact-c@example.com", phone: "345-678-9012" },
  { _id: "client-4", name: "Client D", contact: "contact-d@example.com", phone: "456-789-0123" },
  { _id: "client-5", name: "Client E", contact: "contact-e@example.com", phone: "567-890-1234" }
];

// Fake Etriers (Stirrups)
export const fakeEtriers = [
  { _id: "etrier-1", carModel: "PEUGEOT 208", code: "ETA-001", description: "Standard stirrup type A" },
  { _id: "etrier-2", carModel: "RENAULT CLIO", code: "ETB-002", description: "Standard stirrup type B" },
  { _id: "etrier-3", carModel: "CITROEN C3", code: "ETC-003", description: "Heavy duty stirrup type C" },
  { _id: "etrier-4", carModel: "VOLKSWAGEN GOLF", code: "ETD-004", description: "Light duty stirrup type D" },
  { _id: "etrier-5", carModel: "FORD FOCUS", code: "ETE-005", description: "Special stirrup type E" }
];

// Fake Pieces
export const fakePieces = [
  { _id: "piece-1", name: "Piece A", code: "PA-001", category: "Category 1", stock: 100 },
  { _id: "piece-2", name: "Piece B", code: "PB-002", category: "Category 1", stock: 75 },
  { _id: "piece-3", name: "Piece C", code: "PC-003", category: "Category 2", stock: 50 },
  { _id: "piece-4", name: "Piece D", code: "PD-004", category: "Category 2", stock: 120 },
  { _id: "piece-5", name: "Piece E", code: "PE-005", category: "Category 3", stock: 90 },
  { _id: "piece-6", name: "Piece F", code: "PF-006", category: "Category 3", stock: 60 },
  { _id: "piece-7", name: "Piece G", code: "PG-007", category: "Category 1", stock: 45 },
  { _id: "piece-8", name: "Piece H", code: "PH-008", category: "Category 2", stock: 80 }
];

// Fake Receptions
export const fakeReceptions = [
  {
    _id: "reception-1",
    client: { _id: "client-1", name: "Client A" },
    user: { _id: "user-2", name: "user", id: "user-2" },
    etrier: { _id: "etrier-1", carModel: "PEUGEOT 208" },
    date: new Date("2024-01-15").toISOString(),
    etat: "recus",
    position: "avant gauche",
    observation: "Vérification standard",
    receptionNumber: "REC-2024-001",
    delivered: "no",
    isReturned: false,
    extra: {
      serialNumber: "SN-2024-001",
      notes: "Standard reception",
      pieces: [
        { pieceId: "piece-1", quantity: 5 },
        { pieceId: "piece-2", quantity: 3 }
      ]
    }
  },
  {
    _id: "reception-2",
    client: { _id: "client-2", name: "Client B" },
    user: { _id: "user-2", name: "user", id: "user-2" },
    etrier: { _id: "etrier-2", carModel: "RENAULT CLIO" },
    date: new Date("2024-01-20").toISOString(),
    etat: "en cours",
    position: "avant droit",
    observation: "Commande urgente",
    receptionNumber: "REC-2024-002",
    delivered: "no",
    isReturned: false,
    extra: {
      serialNumber: "SN-2024-002",
      notes: "Urgent order",
      pieces: [
        { pieceId: "piece-3", quantity: 10 },
        { pieceId: "piece-4", quantity: 8 }
      ]
    }
  },
  {
    _id: "reception-3",
    client: { _id: "client-3", name: "Client C" },
    user: { _id: "user-3", name: "John Doe", id: "user-3" },
    etrier: { _id: "etrier-3", carModel: "CITROEN C3" },
    date: new Date("2024-02-01").toISOString(),
    etat: "finit",
    position: "arrière gauche",
    observation: "Terminé et livré",
    receptionNumber: "REC-2024-003",
    delivered: "yes",
    isReturned: false,
    extra: {
      serialNumber: "SN-2024-003",
      notes: "Completed and delivered",
      pieces: [
        { pieceId: "piece-5", quantity: 15 },
        { pieceId: "piece-6", quantity: 12 }
      ]
    }
  },
  {
    _id: "reception-4",
    client: { _id: "client-1", name: "Client A" },
    user: { _id: "user-2", name: "user", id: "user-2" },
    etrier: { _id: "etrier-4", carModel: "VOLKSWAGEN GOLF" },
    date: new Date("2024-02-10").toISOString(),
    etat: "en cours",
    position: "arrière droit",
    observation: "En cours de traitement",
    receptionNumber: "REC-2024-004",
    delivered: "no",
    isReturned: false,
    extra: {
      serialNumber: "SN-2024-004",
      notes: "In progress",
      pieces: [
        { pieceId: "piece-7", quantity: 7 },
        { pieceId: "piece-8", quantity: 4 }
      ]
    }
  },
  {
    _id: "reception-5",
    client: { _id: "client-4", name: "Client D" },
    user: { _id: "user-3", name: "John Doe", id: "user-3" },
    etrier: { _id: "etrier-5", carModel: "FORD FOCUS" },
    date: new Date("2024-02-15").toISOString(),
    etat: "finit",
    position: "avant gauche",
    observation: "Prêt pour livraison",
    receptionNumber: "REC-2024-005",
    delivered: "no",
    isReturned: false,
    extra: {
      serialNumber: "SN-2024-005",
      notes: "Ready for delivery",
      pieces: [
        { pieceId: "piece-1", quantity: 20 },
        { pieceId: "piece-3", quantity: 15 }
      ]
    }
  }
];

// In-memory storage (simulates database)
// Helper functions for localStorage
const STORAGE_KEYS = {
  users: 'fakeData_users',
  clients: 'fakeData_clients',
  etriers: 'fakeData_etriers',
  pieces: 'fakeData_pieces',
  receptions: 'fakeData_receptions'
};

// Load data from localStorage or use defaults
const loadFromStorage = (key, defaultData) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS[key]);
    return stored ? JSON.parse(stored) : defaultData;
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return defaultData;
  }
};

// Save data to localStorage
const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

// Initialize data from localStorage or defaults
let users = loadFromStorage('users', [...fakeUsers]);
let clients = loadFromStorage('clients', [...fakeClients]);
let etriers = loadFromStorage('etriers', [...fakeEtriers]);
let pieces = loadFromStorage('pieces', [...fakePieces]);
let receptions = loadFromStorage('receptions', [...fakeReceptions]);

// Helper function to simulate async delay
const delay = (ms = 100) => new Promise(resolve => setTimeout(resolve, ms));

// Generate a fake JWT token (valid format but not cryptographically secure)
const generateFakeJWT = (user) => {
  const header = { alg: "HS256", typ: "JWT" };
  const payload = {
    id: user._id,
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24 hours
  };

  // Base64 encode (fake JWT format)
  const base64Header = btoa(JSON.stringify(header));
  const base64Payload = btoa(JSON.stringify(payload));
  const signature = btoa(`fake-signature-${user._id}`);

  return `${base64Header}.${base64Payload}.${signature}`;
};

// Fake API functions
export const fakeApi = {
  // Users
  users: {
    login: async (credentials) => {
      await delay();
      // Support login with either name or email
      const user = users.find(u =>
        (u.name === credentials.name || u.email === credentials.email || u.name === credentials.email) &&
        u.password === credentials.password
      );
      if (!user) {
        throw new Error("Invalid credentials");
      }
      const { password, ...userWithoutPassword } = user;
      return {
        token: generateFakeJWT(user),
        user: userWithoutPassword
      };
    },
    logout: async () => {
      await delay();
      return { success: true };
    },
    getAll: async () => {
      await delay();
      return users.map(({ password, ...user }) => user);
    },
    create: async (userData) => {
      await delay();
      const newUser = {
        _id: generateId(),
        id: generateId(),
        ...userData
      };
      users.push(newUser);
      saveToStorage('users', users);
      const { password, ...userWithoutPassword } = newUser;
      return userWithoutPassword;
    },
    delete: async (id) => {
      await delay();
      users = users.filter(u => u._id !== id && u.id !== id);
      saveToStorage('users', users);
      return { success: true };
    }
  },

  // Clients
  clients: {
    getAll: async () => {
      await delay();
      return [...clients];
    },
    create: async (clientData) => {
      await delay();
      const newClient = {
        _id: generateId(),
        ...clientData
      };
      clients.push(newClient);
      saveToStorage('clients', clients);
      return newClient;
    }
  },

  // Etriers
  etriers: {
    getAll: async () => {
      await delay();
      return [...etriers];
    },
    create: async (etrierData) => {
      await delay();
      const newEtrier = {
        _id: generateId(),
        ...etrierData
      };
      etriers.push(newEtrier);
      saveToStorage('etriers', etriers);
      return newEtrier;
    }
  },

  // Pieces
  pieces: {
    getAll: async () => {
      await delay();
      return [...pieces];
    },
    create: async (pieceData) => {
      await delay();
      const newPiece = {
        _id: generateId(),
        ...pieceData
      };
      pieces.push(newPiece);
      saveToStorage('pieces', pieces);
      return newPiece;
    }
  },

  // Receptions
  receptions: {
    getAll: async () => {
      await delay();
      return [...receptions];
    },
    getById: async (id) => {
      await delay();
      const reception = receptions.find(r => r._id === id);
      if (!reception) {
        throw new Error("Reception not found");
      }
      return reception;
    },
    create: async (receptionData) => {
      await delay();

      // Populate related entities from IDs
      const clientObj = clients.find(c => c._id === receptionData.client) || { _id: receptionData.client, name: "Unknown" };
      const etrierObj = etriers.find(e => e._id === receptionData.etrier) || { _id: receptionData.etrier, carModel: "Unknown" };
      const userObj = users.find(u => u.id === receptionData.user || u._id === receptionData.user) || { _id: receptionData.user, name: "Unknown" };

      // Generate reception number
      const receptionNumber = `REC-${new Date().getFullYear()}-${String(receptions.length + 1).padStart(3, '0')}`;

      const newReception = {
        _id: generateId(),
        date: new Date().toISOString(),
        etat: "en cours",
        delivered: "no",
        receptionNumber,
        extra: {},
        ...receptionData,
        // Overwrite IDs with full objects
        client: clientObj,
        etrier: etrierObj,
        user: userObj
      };
      receptions.push(newReception);
      saveToStorage('receptions', receptions);
      return newReception;
    },
    updateEtat: async (id, etat) => {
      await delay();
      const index = receptions.findIndex(r => r._id === id);
      if (index === -1) {
        throw new Error("Reception not found");
      }
      receptions[index] = { ...receptions[index], etat };
      saveToStorage('receptions', receptions);
      return receptions[index];
    },
    updateExtra: async (id, extraData) => {
      await delay();
      const index = receptions.findIndex(r => r._id === id);
      if (index === -1) {
        throw new Error("Reception not found");
      }
      receptions[index] = {
        ...receptions[index],
        extra: { ...receptions[index].extra, ...extraData }
      };
      saveToStorage('receptions', receptions);
      return receptions[index];
    },
    markDelivered: async (id) => {
      await delay();
      const index = receptions.findIndex(r => r._id === id);
      if (index === -1) {
        throw new Error("Reception not found");
      }
      receptions[index] = { ...receptions[index], delivered: "yes" };
      saveToStorage('receptions', receptions);
      return receptions[index];
    },
    requestReturn: async (id, reason) => {
      await delay();
      const index = receptions.findIndex(r => r._id === id);
      if (index === -1) throw new Error("Reception not found");
      receptions[index] = {
        ...receptions[index],
        isReturned: true,
        returnStatus: "pending",
        returnReason: reason
      };
      saveToStorage('receptions', receptions);
      return receptions[index];
    },
    approveReturn: async (id) => {
      await delay();
      const index = receptions.findIndex(r => r._id === id);
      if (index === -1) throw new Error("Reception not found");
      receptions[index] = {
        ...receptions[index],
        returnStatus: "approved",
        etat: "en cours" // Move back to in progress
      };
      saveToStorage('receptions', receptions);
      return receptions[index];
    },
    delete: async (id) => {
      await delay();
      receptions = receptions.filter(r => r._id !== id);
      saveToStorage('receptions', receptions);
      return { success: true };
    }
  }
};

// Utility function to reset all data to defaults (useful for testing)
export const resetData = () => {
  localStorage.removeItem(STORAGE_KEYS.users);
  localStorage.removeItem(STORAGE_KEYS.clients);
  localStorage.removeItem(STORAGE_KEYS.etriers);
  localStorage.removeItem(STORAGE_KEYS.pieces);
  localStorage.removeItem(STORAGE_KEYS.receptions);

  users = [...fakeUsers];
  clients = [...fakeClients];
  etriers = [...fakeEtriers];
  pieces = [...fakePieces];
  receptions = [...fakeReceptions];

  console.log('✅ Data reset to defaults');
};

export default fakeApi;
