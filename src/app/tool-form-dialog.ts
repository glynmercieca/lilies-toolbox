import { ChangeDetectionStrategy, Component, inject, OnDestroy, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject } from 'rxjs';

import { fallbackImage } from './core/image-url.util';
import { ResolvedImageDirective } from './core/resolved-image.directive';
import { ToolFormValue } from './core/models';

interface ToolFormDialogData {
  mode: 'add' | 'edit';
  value?: ToolFormValue;
}

const MAX_IMAGE_FILE_SIZE_BYTES = 32 * 1024 * 1024;

@Component({
  selector: 'app-tool-form-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogTitle,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    ResolvedImageDirective,
  ],
  templateUrl: './tool-form-dialog.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './tool-form-dialog.scss',
})
export class ToolFormDialogComponent implements OnDestroy {
  private readonly formBuilder = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<ToolFormDialogComponent>);
  readonly data = inject<ToolFormDialogData>(MAT_DIALOG_DATA);
  readonly imageUrl = signal(this.data.value?.imageUrl ?? '');
  readonly selectedFile = signal<{ file: File; previewUrl: string } | null>(null);
  readonly imageSelectionError = signal<string | null>(null);
  readonly saving = signal(false);
  readonly submitRequested = new Subject<ToolFormValue>();
  protected readonly fallbackImage = fallbackImage;
  protected readonly maxImageSizeMb = 32;

  readonly form = this.formBuilder.nonNullable.group({
    name: [this.data.value?.name ?? '', Validators.required],
    description: [this.data.value?.description ?? '', Validators.required],
    notes: [this.data.value?.notes ?? ''],
  });

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    const files = Array.from(input?.files ?? []);
    if (!files.length) {
      return;
    }

    const oversizedFiles = files.filter((file) => file.size > MAX_IMAGE_FILE_SIZE_BYTES);
    const allowedFiles = files.filter((file) => file.size <= MAX_IMAGE_FILE_SIZE_BYTES);

    if (oversizedFiles.length) {
      const fileList = oversizedFiles.map((file) => file.name || 'Unnamed image').join(', ');
      this.imageSelectionError.set(`Images must be ${this.maxImageSizeMb} MB or smaller. Skipped: ${fileList}.`);
    } else {
      this.imageSelectionError.set(null);
    }

    if (!allowedFiles.length) {
      if (input) {
        input.value = '';
      }
      return;
    }

    const nextFile = allowedFiles[0];
    const currentSelectedFile = this.selectedFile();
    if (currentSelectedFile) {
      URL.revokeObjectURL(currentSelectedFile.previewUrl);
    }

    this.selectedFile.set({
      file: nextFile,
      previewUrl: URL.createObjectURL(nextFile),
    });

    if (input) {
      input.value = '';
    }
  }

  removeExistingImage(): void {
    if (this.saving()) {
      return;
    }

    this.imageUrl.set('');
  }

  removeSelectedFile(): void {
    if (this.saving()) {
      return;
    }

    const selectedFile = this.selectedFile();
    if (selectedFile) {
      URL.revokeObjectURL(selectedFile.previewUrl);
    }

    this.selectedFile.set(null);
  }

  submit(): void {
    if (this.saving()) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.imageSelectionError()) {
      return;
    }

    this.submitRequested.next({
      ...this.form.getRawValue(),
      imageUrl: this.imageUrl(),
      imageFile: this.selectedFile()?.file ?? null,
    });
  }

  setSaving(saving: boolean): void {
    this.saving.set(saving);
    this.dialogRef.disableClose = saving;

    if (saving) {
      this.form.disable({ emitEvent: false });
      return;
    }

    this.form.enable({ emitEvent: false });
  }

  ngOnDestroy(): void {
    this.submitRequested.complete();

    const selectedFile = this.selectedFile();
    if (selectedFile) {
      URL.revokeObjectURL(selectedFile.previewUrl);
    }
  }
}
