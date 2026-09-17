import { BaseControl, ControlProps, ControlEventMap, ValidationResult } from './BaseControl';

export interface NumericInputProps extends ControlProps, ControlEventMap {
  value?: number;
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
  prefix?: string;
  suffix?: string;
  placeholder?: string;
  allowNegative?: boolean;
  showSpinner?: boolean;
  formatOnBlur?: boolean;
}

export class NumericInput extends BaseControl<number, NumericInputProps> {
  private inputElement: HTMLInputElement | null = null;
  private spinnerUp: HTMLButtonElement | null = null;
  private spinnerDown: HTMLButtonElement | null = null;

  constructor(props: NumericInputProps = {}) {
    super(props);
    this.state.value = props.value ?? 0;
  }

  protected getDefaultValue(): number {
    return 0;
  }

  protected render(): HTMLElement | string {
    const { prefix, suffix, placeholder, showSpinner, disabled } = this.props;
    
    return `
      <div class="numeric-input-wrapper" data-control="numeric-input">
        ${prefix ? `<span class="numeric-input-prefix">${this.escapeHtml(prefix)}</span>` : ''}
        <input 
          type="text" 
          class="numeric-input" 
          placeholder="${this.escapeHtml(placeholder || '')}"
          value="${this.formatValue(this.state.value)}"
          ${disabled ? 'disabled' : ''}
          inputmode="decimal"
          autocomplete="off"
        />
        ${suffix ? `<span class="numeric-input-suffix">${this.escapeHtml(suffix)}</span>` : ''}
        ${showSpinner ? `
          <div class="numeric-input-spinner">
            <button type="button" class="spinner-up" aria-label="Increase">▲</button>
            <button type="button" class="spinner-down" aria-label="Decrease">▼</button>
          </div>
        ` : ''}
      </div>
    `;
  }

  private spinnerUpClickHandler = () => this.stepUp();
  private spinnerDownClickHandler = () => this.stepDown();

  protected bindEvents(element: HTMLElement): void {
    this.inputElement = element.querySelector('.numeric-input');
    this.spinnerUp = element.querySelector('.spinner-up');
    this.spinnerDown = element.querySelector('.spinner-down');

    this.inputElement?.addEventListener('input', this.handleInput.bind(this));
    this.inputElement?.addEventListener('blur', this.handleBlur.bind(this));
    this.inputElement?.addEventListener('focus', this.handleFocus.bind(this));
    this.inputElement?.addEventListener('keydown', this.handleKeyDown.bind(this));
    this.inputElement?.addEventListener('wheel', this.handleWheel.bind(this));

    this.spinnerUp?.addEventListener('click', this.spinnerUpClickHandler);
    this.spinnerDown?.addEventListener('click', this.spinnerDownClickHandler);
    this.spinnerUp?.addEventListener('mousedown', this.handleSpinnerMouseDown.bind(this, 1));
    this.spinnerDown?.addEventListener('mousedown', this.handleSpinnerMouseDown.bind(this, -1));
  }

  protected unbindEvents(element: HTMLElement): void {
    this.inputElement?.removeEventListener('input', this.handleInput.bind(this));
    this.inputElement?.removeEventListener('blur', this.handleBlur.bind(this));
    this.inputElement?.removeEventListener('focus', this.handleFocus.bind(this));
    this.inputElement?.removeEventListener('keydown', this.handleKeyDown.bind(this));
    this.inputElement?.removeEventListener('wheel', this.handleWheel.bind(this));
    this.spinnerUp?.removeEventListener('click', this.spinnerUpClickHandler);
    this.spinnerDown?.removeEventListener('click', this.spinnerDownClickHandler);
  }

  private handleInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const rawValue = input.value;
    const parsed = this.parseValue(rawValue);
    
    if (parsed !== null) {
      this.state.value = parsed;
      this.state.dirty = true;
      this.props.onChange?.(parsed, event);
    }
  }

  private handleBlur(event: FocusEvent): void {
    this.state.touched = true;
    this.validate();
    
    if (this.props.formatOnBlur !== false) {
      this.formatDisplay();
    }
    
    this.props.onBlur?.(event);
  }

  private handleFocus(event: FocusEvent): void {
    this.props.onFocus?.(event);
  }

  private handleKeyDown(event: KeyboardEvent): void {
    const { key } = event;
    
    if (key === 'ArrowUp') {
      event.preventDefault();
      this.stepUp(event.shiftKey ? 10 : 1);
    } else if (key === 'ArrowDown') {
      event.preventDefault();
      this.stepDown(event.shiftKey ? 10 : 1);
    } else if (key === 'Enter') {
      this.handleBlur(event as unknown as FocusEvent);
    }
    
    this.props.onKeyDown?.(event);
  }

  private handleWheel(event: WheelEvent): void {
    if (!this.inputElement?.matches(':focus')) return;
    
    event.preventDefault();
    if (event.deltaY < 0) {
      this.stepUp();
    } else {
      this.stepDown();
    }
  }

  private handleSpinnerMouseDown(direction: number, event: MouseEvent): void {
    event.preventDefault();
    
    const step = () => {
      if (direction > 0) this.stepUp();
      else this.stepDown();
    };
    
    step();
    
    const interval = setInterval(step, 100);
    const cleanup = () => {
      clearInterval(interval);
      document.removeEventListener('mouseup', cleanup);
    };
    document.addEventListener('mouseup', cleanup, { once: true });
  }

  private stepUp(multiplier: number = 1): void {
    const step = this.props.step || 1;
    const newValue = Math.min(
      this.state.value + step * multiplier,
      this.props.max ?? Infinity
    );
    this.setValue(newValue);
    this.formatDisplay();
  }

  private stepDown(multiplier: number = 1): void {
    const step = this.props.step || 1;
    const newValue = Math.max(
      this.state.value - step * multiplier,
      this.props.min ?? -Infinity
    );
    this.setValue(newValue);
    this.formatDisplay();
  }

  private parseValue(value: string): number | null {
    if (!value && value !== '0') return null;
    
    const { allowNegative, precision } = this.props;
    let cleaned = value.replace(/[^\d.-]/g, '');
    
    if (!allowNegative) {
      cleaned = cleaned.replace('-', '');
    }
    
    const parts = cleaned.split('.');
    if (parts.length > 2) return null;
    
    if (precision !== undefined && parts[1] && parts[1].length > precision) {
      return null;
    }
    
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? null : parsed;
  }

  private formatValue(value: number): string {
    const { precision } = this.props;
    if (precision !== undefined) {
      return value.toFixed(precision);
    }
    return value.toString();
  }

  private formatDisplay(): void {
    if (this.inputElement) {
      this.inputElement.value = this.formatValue(this.state.value);
    }
  }

  public validate(): ValidationResult[] {
    const errors = super.validate();
    const { min, max, allowNegative } = this.props;
    const value = this.state.value;

    if (!allowNegative && value < 0) {
      errors.push({ valid: false, message: 'Value cannot be negative', severity: 'error' });
    }

    if (min !== undefined && value < min) {
      errors.push({ valid: false, message: `Value must be at least ${min}`, severity: 'error' });
    }

    if (max !== undefined && value > max) {
      errors.push({ valid: false, message: `Value must be at most ${max}`, severity: 'error' });
    }

    this.state.errors = errors;
    this.state.valid = errors.length === 0;
    this.updateValidationUI();

    return errors;
  }
}

export interface SearchInputProps extends ControlProps, ControlEventMap {
  value?: string;
  placeholder?: string;
  debounceMs?: number;
  showClear?: boolean;
  showSearchIcon?: boolean;
  showBarcodeScanner?: boolean;
  onSearch?: (query: string) => void;
  onBarcodeScan?: (code: string) => void;
}

export class SearchInput extends BaseControl<string, SearchInputProps> {
  private inputElement: HTMLInputElement | null = null;
  private clearButton: HTMLButtonElement | null = null;
  private searchIcon: HTMLElement | null = null;
  private barcodeButton: HTMLButtonElement | null = null;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(props: SearchInputProps = {}) {
    super(props);
    this.state.value = props.value ?? '';
  }

  protected getDefaultValue(): string {
    return '';
  }

  protected render(): HTMLElement | string {
    const { placeholder, showClear, showSearchIcon, showBarcodeScanner } = this.props;
    
    return `
      <div class="search-input-wrapper" data-control="search-input">
        ${showSearchIcon ? `<span class="search-icon" aria-hidden="true">🔍</span>` : ''}
        <input 
          type="search" 
          class="search-input" 
          placeholder="${this.escapeHtml(placeholder || 'Search...')}"
          value="${this.escapeHtml(this.state.value)}"
          autocomplete="off"
          aria-label="${this.escapeHtml(placeholder || 'Search')}"
        />
        ${showClear ? `<button type="button" class="search-clear" aria-label="Clear search">✕</button>` : ''}
        ${showBarcodeScanner ? `<button type="button" class="search-barcode" aria-label="Scan barcode">📷</button>` : ''}
      </div>
    `;
  }

  protected bindEvents(element: HTMLElement): void {
    this.inputElement = element.querySelector('.search-input');
    this.clearButton = element.querySelector('.search-clear');
    this.searchIcon = element.querySelector('.search-icon');
    this.barcodeButton = element.querySelector('.search-barcode');

    this.inputElement?.addEventListener('input', this.handleInput.bind(this));
    this.inputElement?.addEventListener('keydown', this.handleKeyDown.bind(this));
    this.inputElement?.addEventListener('focus', this.handleFocus.bind(this));
    this.inputElement?.addEventListener('blur', this.handleBlur.bind(this));

    this.clearButton?.addEventListener('click', this.clear.bind(this));
    this.barcodeButton?.addEventListener('click', this.handleBarcodeScan.bind(this));
  }

  protected unbindEvents(element: HTMLElement): void {
    this.inputElement?.removeEventListener('input', this.handleInput.bind(this));
    this.inputElement?.removeEventListener('keydown', this.handleKeyDown.bind(this));
    this.inputElement?.removeEventListener('focus', this.handleFocus.bind(this));
    this.inputElement?.removeEventListener('blur', this.handleBlur.bind(this));
    this.clearButton?.removeEventListener('click', this.clear.bind(this));
    this.barcodeButton?.removeEventListener('click', this.handleBarcodeScan.bind(this));
  }

  private handleInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    
    this.state.value = value;
    this.state.dirty = true;
    
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    
    this.debounceTimer = setTimeout(() => {
      this.props.onSearch?.(value);
    }, this.props.debounceMs || 300);
    
    this.props.onChange?.(value, event);
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }
      this.props.onSearch?.(this.state.value);
    } else if (event.key === 'Escape') {
      this.clear();
    }
    
    this.props.onKeyDown?.(event);
  }

  private handleFocus(event: FocusEvent): void {
    this.props.onFocus?.(event);
  }

  private handleBlur(event: FocusEvent): void {
    this.state.touched = true;
    this.props.onBlur?.(event);
  }

  private handleBarcodeScan(): void {
    // In a real implementation, this would open a barcode scanner
    // For now, we'll simulate with a prompt
    const code = prompt('Enter barcode:');
    if (code) {
      this.setValue(code);
      this.props.onBarcodeScan?.(code);
    }
  }

  clear(): void {
    this.setValue('');
    if (this.inputElement) {
      this.inputElement.value = '';
      this.inputElement.focus();
    }
  }
}

export interface ButtonProps extends ControlProps, ControlEventMap {
  label: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'small' | 'medium' | 'large';
  icon?: string;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export class Button extends BaseControl<void, ButtonProps> {
  private buttonElement: HTMLButtonElement | null = null;

  constructor(props: ButtonProps) {
    super(props);
  }

  protected getDefaultValue(): void {
    return undefined;
  }

  protected render(): HTMLElement | string {
    const { label, variant = 'primary', size = 'medium', icon, iconPosition = 'left', loading, fullWidth, type = 'button', disabled } = this.props;
    
    const classes = [
      'btn',
      `btn-${variant}`,
      `btn-${size}`,
      fullWidth ? 'btn-full-width' : '',
      loading ? 'btn-loading' : '',
      disabled ? 'btn-disabled' : ''
    ].filter(Boolean).join(' ');

    return `
      <button 
        type="${type}" 
        class="${classes}"
        ${disabled ? 'disabled' : ''}
        ${loading ? 'aria-busy="true"' : ''}
      >
        ${loading ? '<span class="btn-spinner" aria-hidden="true"></span>' : ''}
        ${icon && iconPosition === 'left' ? `<span class="btn-icon" aria-hidden="true">${this.escapeHtml(icon)}</span>` : ''}
        <span class="btn-label">${this.escapeHtml(label)}</span>
        ${icon && iconPosition === 'right' ? `<span class="btn-icon" aria-hidden="true">${this.escapeHtml(icon)}</span>` : ''}
      </button>
    `;
  }

  protected bindEvents(element: HTMLElement): void {
    this.buttonElement = element as HTMLButtonElement;
    this.buttonElement.addEventListener('click', this.handleClick.bind(this));
  }

  protected unbindEvents(element: HTMLElement): void {
    this.buttonElement?.removeEventListener('click', this.handleClick.bind(this));
  }

  private handleClick(event: MouseEvent): void {
    if (this.props.disabled || this.props.loading) return;
    this.props.onClick?.(event);
  }

  setLoading(loading: boolean): void {
    this.props.loading = loading;
    if (this.buttonElement) {
      this.buttonElement.classList.toggle('btn-loading', loading);
      this.buttonElement.setAttribute('aria-busy', loading.toString());
    }
  }
}

export interface ModalProps extends ControlProps {
  title?: string;
  open?: boolean;
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  closable?: boolean;
  maskClosable?: boolean;
  onClose?: () => void;
  onConfirm?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  footer?: boolean;
}

export class Modal extends BaseControl<boolean, ModalProps> {
  private modalElement: HTMLElement | null = null;
  private overlayElement: HTMLElement | null = null;
  private closeButton: HTMLButtonElement | null = null;
  private confirmButton: HTMLButtonElement | null = null;
  private cancelButton: HTMLButtonElement | null = null;

  constructor(props: ModalProps = {}) {
    super(props);
    this.state.value = props.open ?? false;
  }

  protected getDefaultValue(): boolean {
    return false;
  }

  protected render(): HTMLElement | string {
    const { title, size = 'medium', closable = true, footer = true, confirmLabel = 'Confirm', cancelLabel = 'Cancel' } = this.props;
    
    return `
      <div class="modal-overlay ${this.state.value ? 'open' : ''}" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div class="modal modal-${size}">
          <div class="modal-header">
            <h2 id="modal-title" class="modal-title">${this.escapeHtml(title || '')}</h2>
            ${closable ? '<button type="button" class="modal-close" aria-label="Close">✕</button>' : ''}
          </div>
          <div class="modal-body"></div>
          ${footer ? `
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary modal-cancel">${this.escapeHtml(cancelLabel)}</button>
              <button type="button" class="btn btn-primary modal-confirm">${this.escapeHtml(confirmLabel)}</button>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  protected bindEvents(element: HTMLElement): void {
    this.modalElement = element;
    this.overlayElement = element.querySelector('.modal-overlay');
    this.closeButton = element.querySelector('.modal-close');
    this.confirmButton = element.querySelector('.modal-confirm');
    this.cancelButton = element.querySelector('.modal-cancel');

    this.closeButton?.addEventListener('click', this.close.bind(this));
    this.cancelButton?.addEventListener('click', this.close.bind(this));
    this.confirmButton?.addEventListener('click', this.confirm.bind(this));
    this.overlayElement?.addEventListener('click', this.handleOverlayClick.bind(this));

    document.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  protected unbindEvents(element: HTMLElement): void {
    this.closeButton?.removeEventListener('click', this.close.bind(this));
    this.cancelButton?.removeEventListener('click', this.close.bind(this));
    this.confirmButton?.removeEventListener('click', this.confirm.bind(this));
    this.overlayElement?.removeEventListener('click', this.handleOverlayClick.bind(this));
    document.removeEventListener('keydown', this.handleKeyDown.bind(this));
  }

  private handleOverlayClick(event: MouseEvent): void {
    if (event.target === this.overlayElement && this.props.maskClosable !== false) {
      this.close();
    }
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (!this.state.value) return;
    
    if (event.key === 'Escape' && this.props.closable !== false) {
      this.close();
    } else if (event.key === 'Enter' && event.ctrlKey) {
      this.confirm();
    }
  }

  open(): void {
    this.setValue(true);
    this.updateVisibility();
    document.body.style.overflow = 'hidden';
    (this.element?.querySelector('.modal-body') as HTMLElement | null)?.focus();
  }

  close(): void {
    this.setValue(false);
    this.updateVisibility();
    document.body.style.overflow = '';
    this.props.onClose?.();
  }

  confirm(): void {
    this.props.onConfirm?.();
    this.close();
  }

  private updateVisibility(): void {
    if (this.overlayElement) {
      this.overlayElement.classList.toggle('open', this.state.value);
    }
  }

  setContent(content: HTMLElement | string): void {
    const body = this.element?.querySelector('.modal-body');
    if (body) {
      if (typeof content === 'string') {
        body.innerHTML = content;
      } else {
        body.innerHTML = '';
        body.appendChild(content);
      }
    }
  }
}