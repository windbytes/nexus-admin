import {
  FreeLayoutPluginContext,
  inject,
  injectable,
  Playground,
  SelectionService,
  WorkflowDocument,
} from '@flowgram.ai/free-layout-editor';

/**
 * 自定义服务
 */
@injectable()
export class CustomService {
  @inject(FreeLayoutPluginContext) ctx: FreeLayoutPluginContext;

  @inject(SelectionService) selectionService: SelectionService;

  @inject(Playground) playground: Playground;

  @inject(WorkflowDocument) document: WorkflowDocument;

  save() {
    console.log(this.document.toJSON());
  }
}
