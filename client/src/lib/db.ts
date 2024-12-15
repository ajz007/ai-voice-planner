import { openDB, type IDBPDatabase } from 'idb';

export interface Note {
  id?: number;
  text: string;
  audioBlob?: Blob;
  timestamp: number;
  transcribed: boolean;
  synced: boolean;
}

export interface Task {
  id?: number;
  title: string;
  description: string;
  status: 'not_started' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  scheduledStart?: number;
  scheduledEnd?: number;
  estimatedHours?: number;
  actualHours?: number;
  labels: string[];
  metadata?: Record<string, any>;
  createdAt: number;
  updatedAt: number;
}

class DB {
  private dbPromise: Promise<IDBPDatabase>;
  
  constructor() {
    this.dbPromise = this.init();
  }
  
  private async init() {
    return await openDB('voiceNotesPWA', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('notes')) {
          const notesStore = db.createObjectStore('notes', { keyPath: 'id', autoIncrement: true });
          notesStore.createIndex('timestamp', 'timestamp');
          notesStore.createIndex('synced', 'synced');
        }
        
        if (!db.objectStoreNames.contains('tasks')) {
          const tasksStore = db.createObjectStore('tasks', { keyPath: 'id', autoIncrement: true });
          tasksStore.createIndex('synced', 'synced');
        }
      },
    });
  }

  async addNote(note: Omit<Note, 'id'>): Promise<number> {
    const db = await this.dbPromise;
    const id = await db.add('notes', note);
    return typeof id === 'number' ? id : parseInt(id.toString(), 10);
  }

  async getNotes(): Promise<Note[]> {
    const db = await this.dbPromise;
    const notes = await db.getAllFromIndex('notes', 'timestamp');
    return notes.sort((a, b) => b.timestamp - a.timestamp); // Latest first
  }

  async updateNote(id: number, changes: Partial<Note>): Promise<void> {
    const db = await this.dbPromise;
    const note = await db.get('notes', id);
    if (!note) throw new Error('Note not found');
    await db.put('notes', { ...note, ...changes });
  }

  async addTask(task: Omit<Task, 'id'>): Promise<number> {
    const db = await this.dbPromise;
    const id = await db.add('tasks', task);
    return typeof id === 'number' ? id : parseInt(id.toString(), 10);
  }

  async getTasks(): Promise<Task[]> {
    const db = await this.dbPromise;
    return await db.getAll('tasks');
  }

  async updateTask(id: number, changes: Partial<Task>): Promise<void> {
    const db = await this.dbPromise;
    const task = await db.get('tasks', id);
    if (!task) throw new Error('Task not found');
    await db.put('tasks', { ...task, ...changes });
  }
}

export const db = new DB();
