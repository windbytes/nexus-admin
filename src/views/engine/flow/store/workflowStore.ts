/**
 * 流程编排状态
 * nodes / edges / 选中 / 撤销重做 / 保存状态
 */
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type EdgeChange,
  type NodeChange,
  type OnConnect,
} from '@xyflow/react';
import { create } from 'zustand';
import type { WorkflowDocument, WorkflowEdge, WorkflowNode } from '../types';

const MAX_HISTORY = 50;

interface HistoryEntry {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

interface WorkflowState {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  selectedNodeId: string | null;
  lastSavedAt: string | null;
  dirty: boolean;
  history: HistoryEntry[];
  historyIndex: number;
  redoStack: HistoryEntry[];
  // actions
  setNodes: (nodes: WorkflowNode[] | ((prev: WorkflowNode[]) => WorkflowNode[])) => void;
  setEdges: (edges: WorkflowEdge[] | ((prev: WorkflowEdge[]) => WorkflowEdge[])) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: OnConnect;
  setSelectedNodeId: (id: string | null) => void;
  setLastSavedAt: (at: string | null) => void;
  setDirty: (dirty: boolean) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  pushHistory: () => void;
  loadDocument: (doc: WorkflowDocument) => void;
  getDocument: (appId?: string) => WorkflowDocument;
  reset: () => void;
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  lastSavedAt: null,
  dirty: false,
  history: [],
  historyIndex: -1,
  redoStack: [],

  setNodes: (nodesOrUpdater) => {
    set((s) => {
      const next = typeof nodesOrUpdater === 'function' ? nodesOrUpdater(s.nodes) : nodesOrUpdater;
      return { nodes: next, dirty: true, redoStack: [] };
    });
  },

  setEdges: (edgesOrUpdater) => {
    set((s) => {
      const next = typeof edgesOrUpdater === 'function' ? edgesOrUpdater(s.edges) : edgesOrUpdater;
      return { edges: next, dirty: true, redoStack: [] };
    });
  },

  onNodesChange: (changes) => {
    set((s) => {
      const next = applyNodeChanges(changes, s.nodes) as WorkflowNode[];
      return { nodes: next, dirty: true, redoStack: [] };
    });
  },

  onEdgesChange: (changes) => {
    set((s) => {
      const next = applyEdgeChanges(changes, s.edges);
      return { edges: next, dirty: true, redoStack: [] };
    });
  },

  onConnect: (connection) => {
    set((s) => ({
      edges: addEdge(connection, s.edges),
      dirty: true,
      redoStack: [],
    }));
  },

  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
  setLastSavedAt: (at) => set({ lastSavedAt: at }),
  setDirty: (dirty) => set({ dirty }),

  pushHistory: () => {
    const state = get();
    const { nodes, edges, history } = state;
    const newHistory = [...history];
    if (newHistory.length >= MAX_HISTORY) {
      newHistory.shift();
    }
    newHistory.push({ nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) });
    set({ history: newHistory, historyIndex: newHistory.length - 1, redoStack: [] });
  },

  undo: () => {
    const state = get();
    if (state.historyIndex < 0) {
      return;
    }
    const entry = state.history[state.historyIndex];
    const redoEntry = { nodes: [...state.nodes], edges: [...state.edges] };
    set({
      nodes: entry?.nodes ?? [],
      edges: entry?.edges ?? [],
      historyIndex: state.historyIndex - 1,
      redoStack: [...state.redoStack, redoEntry],
      dirty: true,
    });
  },

  redo: () => {
    const state = get();
    if (state.redoStack.length === 0) {
      return;
    }
    const next = state.redoStack[state.redoStack.length - 1];
    const newRedo = state.redoStack.slice(0, -1);
    const historyEntry = { nodes: [...state.nodes], edges: [...state.edges] };
    const newHistory = [...state.history, historyEntry];
    if (newHistory.length > MAX_HISTORY) {
      newHistory.shift();
    }
    set({
      nodes: next?.nodes ?? [],
      edges: next?.edges ?? [],
      historyIndex: newHistory.length - 1,
      history: newHistory,
      redoStack: newRedo,
      dirty: true,
    });
  },

  canUndo: () => get().historyIndex >= 0,
  canRedo: () => get().redoStack.length > 0,

  loadDocument: (doc) => {
    set({
      nodes: doc.nodes as WorkflowNode[],
      edges: doc.edges as WorkflowEdge[],
      history: [{ nodes: doc.nodes, edges: doc.edges }],
      historyIndex: 0,
      redoStack: [],
      dirty: false,
      selectedNodeId: null,
    });
  },

  getDocument: (appId?) => {
    const s = get();
    const doc: WorkflowDocument = {
      version: 1,
      nodes: s.nodes as WorkflowNode[],
      edges: s.edges as WorkflowEdge[],
      meta: appId ? { appId, updatedAt: new Date().toISOString() } : undefined,
    };
    return doc;
  },

  reset: () =>
    set({
      nodes: [],
      edges: [],
      selectedNodeId: null,
      lastSavedAt: null,
      dirty: false,
      history: [],
      historyIndex: -1,
      redoStack: [],
    }),
}));
