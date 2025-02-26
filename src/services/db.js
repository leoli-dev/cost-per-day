const DB_NAME = 'CostPerDayDB';
const DB_VERSION = 1;
const ITEMS_STORE_NAME = 'items';
const SETTINGS_STORE_NAME = 'settings';

// 默认设置
const DEFAULT_SETTINGS = {
  language: 'en',
  currency: '$'
};

export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // 创建 items 表
      if (!db.objectStoreNames.contains(ITEMS_STORE_NAME)) {
        const store = db.createObjectStore(ITEMS_STORE_NAME, { 
          keyPath: 'id',
          autoIncrement: true 
        });
        // 创建索引
        store.createIndex('name', 'name', { unique: false });
        store.createIndex('purchaseDate', 'purchaseDate', { unique: false });
      }
      
      // 创建 settings 表
      if (!db.objectStoreNames.contains(SETTINGS_STORE_NAME)) {
        const settingsStore = db.createObjectStore(SETTINGS_STORE_NAME, { 
          keyPath: 'key'
        });
        
        // 初始化默认设置
        settingsStore.add({ key: 'language', value: DEFAULT_SETTINGS.language });
        settingsStore.add({ key: 'currency', value: DEFAULT_SETTINGS.currency });
      }
    };
  });
};

export const getAllItems = async () => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(ITEMS_STORE_NAME, 'readonly');
    const store = transaction.objectStore(ITEMS_STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

export const addItem = async (item) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(ITEMS_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(ITEMS_STORE_NAME);
    const request = store.add(item);

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

export const updateItem = async (id, item) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(ITEMS_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(ITEMS_STORE_NAME);
    const request = store.put({ ...item, id });

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

export const deleteItem = async (id) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(ITEMS_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(ITEMS_STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

// 获取设置
export const getSetting = async (key) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(SETTINGS_STORE_NAME, 'readonly');
    const store = transaction.objectStore(SETTINGS_STORE_NAME);
    const request = store.get(key);

    request.onsuccess = () => {
      if (request.result) {
        resolve(request.result.value);
      } else {
        resolve(DEFAULT_SETTINGS[key]);
      }
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

// 获取所有设置
export const getAllSettings = async () => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(SETTINGS_STORE_NAME, 'readonly');
    const store = transaction.objectStore(SETTINGS_STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      if (request.result && request.result.length > 0) {
        const settings = {};
        request.result.forEach(item => {
          settings[item.key] = item.value;
        });
        resolve(settings);
      } else {
        resolve(DEFAULT_SETTINGS);
      }
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

// 更新设置
export const updateSetting = async (key, value) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(SETTINGS_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(SETTINGS_STORE_NAME);
    const request = store.put({ key, value });

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}; 