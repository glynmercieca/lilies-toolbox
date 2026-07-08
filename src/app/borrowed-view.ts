import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { ToolCardComponent } from './shed-tool-card';
import { ToolboxStateService } from './core/toolbox-state.service';

@Component({
  selector: 'app-borrowed-view',
  imports: [MatCardModule, MatIconModule, ToolCardComponent],
  templateUrl: './borrowed-view.html',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class BorrowedViewComponent {
  readonly state = inject(ToolboxStateService);
}
