/**
 * 流程 DSL 导入/导出
 */
import type { WorkflowDocument } from '../types';

const DSL_VERSION = 1;

export function exportDSL(doc: WorkflowDocument): string {
  return JSON.stringify(
    {
      version: DSL_VERSION,
      nodes: doc.nodes,
      edges: doc.edges,
      meta: doc.meta,
    },
    null,
    2
  );
}

export function downloadDSL(doc: WorkflowDocument, filename = 'workflow.json'): void {
  const blob = new Blob([exportDSL(doc)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function parseJSON<T>(str: string): T {
  return JSON.parse(str) as T;
}

export interface ParseDSLResult {
  success: true;
  doc: WorkflowDocument;
}

export interface ParseDSLError {
  success: false;
  error: string;
}

export function parseDSL(input: string): ParseDSLResult | ParseDSLError {
  try {
    const raw = parseJSON<{ version?: number; nodes?: unknown[]; edges?: unknown[]; meta?: unknown }>(input);
    if (!Array.isArray(raw.nodes)) {
      return { success: false, error: '缺少或无效的 nodes' };
    }
    if (!Array.isArray(raw.edges)) {
      return { success: false, error: '缺少或无效的 edges' };
    }
    const doc: WorkflowDocument = {
      version: typeof raw.version === 'number' ? raw.version : 1,
      nodes: raw.nodes as WorkflowDocument['nodes'],
      edges: raw.edges as WorkflowDocument['edges'],
      meta: raw.meta as WorkflowDocument['meta'],
    };
    return { success: true, doc };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : '解析失败',
    };
  }
}

export function importDSLFromFile(): Promise<WorkflowDocument | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result as string;
        const result = parseDSL(text);
        if (result.success) {
          resolve(result.doc);
        } else {
          resolve(null);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  });
}
