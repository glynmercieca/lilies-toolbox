import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { ToolCardComponent } from './shed-tool-card';
import { ToolboxStateService } from './core/toolbox-state.service';

@Component({
  selector: 'app-my-tools-view',
  imports: [MatCardModule, MatIconModule, ToolCardComponent],
  templateUrl: './my-tools-view.html',
  styleUrl: './my-tools-view.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class MyToolsViewComponent {
  readonly state = inject(ToolboxStateService);
}
