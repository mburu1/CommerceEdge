export interface ControlProps {
  id?: string;
  className?: string;
  style?: Record<string, string | number>;
  disabled?: boolean;
  visible?: boolean;
  testId?: string;
}

export interface ControlEventMap {
  onChange?: (value: unknown, event?: Event) => void;
  onFocus?: (event?: FocusEvent) => void;
  onBlur?: (event?: FocusEvent) => void;
  onKeyDown?: (event?: KeyboardEvent) => void;
  onClick?: (event?: MouseEvent) => void;
}

export type ControlValidator = (value: unknown) => ValidationResult;

export interface ValidationResult {
  valid: boolean;
  message?: string;
  severity?: 'error' | 'warning' | 'info';
}

export interface ControlState<T = unknown> {
  value: T;
  pristine: boolean;
  touched: boolean;
  dirty: boolean;
  valid: boolean;
  errors: ValidationResult[];
  validating: boolean;
}

export abstract class BaseControl<T = unknown, P extends ControlProps & ControlEventMap = ControlProps & ControlEventMap> {
  protected props: P;
  protected state: ControlState<T>;
  protected validators: ControlValidator[] = [];
  protected element: HTMLElement | null = null;
  protected mounted: boolean = false;

  constructor(props: P = {} as P) {
    this.props = props;
    this.state = {
      value: this.getDefaultValue(),
      pristine: true,
      touched: false,
      dirty: false,
      valid: true,
      errors: [],
      validating: false
    };
  }

  protected abstract getDefaultValue(): T;
  protected abstract render(): HTMLElement | string;
  protected abstract bindEvents(element: HTMLElement): void;
  protected abstract unbindEvents(element: HTMLElement): void;

  mount(container: HTMLElement | string): HTMLElement {
    const containerEl = typeof container === 'string' 
      ? document.querySelector(container) 
      : container;

    if (!containerEl) {
      throw new Error('Container element not found');
    }

    const rendered = this.render();
    const element = typeof rendered === 'string' 
      ? this.createElementFromString(rendered) 
      : rendered;

    this.element = element;
    this.applyProps(element);
    this.bindEvents(element);
    this.mounted = true;

    containerEl.appendChild(element);
    return element;
  }

  unmount(): void {
    if (this.element) {
      this.unbindEvents(this.element);
      this.element.remove();
      this.element = null;
      this.mounted = false;
    }
  }

  getValue(): T {
    return this.state.value;
  }

  setValue(value: T, options: { silent?: boolean; validate?: boolean } = {}): void {
    const oldValue = this.state.value;
    this.state.value = value;
    this.state.pristine = false;
    this.state.dirty = true;

    if (options.validate !== false) {
      this.validate();
    }

    if (!options.silent && oldValue !== value) {
      this.props.onChange?.(value);
    }
  }

  validate(): ValidationResult[] {
    this.state.validating = true;
    this.state.errors = [];

    for (const validator of this.validators) {
      const result = validator(this.state.value);
      if (!result.valid) {
        this.state.errors.push(result);
      }
    }

    this.state.valid = this.state.errors.length === 0;
    this.state.validating = false;
    this.updateValidationUI();

    return this.state.errors;
  }

  addValidator(validator: ControlValidator): void {
    this.validators.push(validator);
  }

  clearValidators(): void {
    this.validators = [];
  }

  focus(): void {
    this.element?.focus();
  }

  blur(): void {
    this.element?.blur();
    this.state.touched = true;
  }

  setDisabled(disabled: boolean): void {
    this.props.disabled = disabled;
    if (this.element) {
      (this.element as HTMLInputElement).disabled = disabled;
    }
  }

  setVisible(visible: boolean): void {
    this.props.visible = visible;
    if (this.element) {
      this.element.style.display = visible ? '' : 'none';
    }
  }

  getState(): Readonly<ControlState<T>> {
    return { ...this.state };
  }

  isValid(): boolean {
    return this.state.valid;
  }

  isDirty(): boolean {
    return this.state.dirty;
  }

  reset(): void {
    this.state.value = this.getDefaultValue();
    this.state.pristine = true;
    this.state.touched = false;
    this.state.dirty = false;
    this.state.valid = true;
    this.state.errors = [];
    this.updateValidationUI();
  }

  protected createElementFromString(html: string): HTMLElement {
    const div = document.createElement('div');
    div.innerHTML = html.trim();
    const element = div.firstElementChild;
    if (!element) {
      throw new Error('Failed to create element from HTML string');
    }
    return element as HTMLElement;
  }

  protected applyProps(element: HTMLElement): void {
    if (this.props.id) element.id = this.props.id;
    if (this.props.className) element.className = this.props.className;
    if (this.props.style) Object.assign(element.style, this.props.style);
    if (this.props.testId) element.setAttribute('data-testid', this.props.testId);
    if (this.props.disabled) (element as HTMLInputElement).disabled = true;
    if (this.props.visible === false) element.style.display = 'none';
  }

  protected updateValidationUI(): void {
    if (!this.element) return;

    const errorElements = this.element.querySelectorAll('.validation-error');
    errorElements.forEach(el => el.remove());

    if (!this.state.valid && this.state.touched) {
      const errorContainer = document.createElement('div');
      errorContainer.className = 'validation-error';
      errorContainer.setAttribute('role', 'alert');
      errorContainer.innerHTML = this.state.errors
        .map(e => `<span class="validation-message">${e.message}</span>`)
        .join('');
      this.element.appendChild(errorContainer);
      this.element.classList.add('invalid');
    } else {
      this.element.classList.remove('invalid');
    }
  }

  protected emitChange(value: T): void {
    this.props.onChange?.(value);
  }

  protected emitFocus(event?: FocusEvent): void {
    this.props.onFocus?.(event);
  }

  protected emitBlur(event?: FocusEvent): void {
    this.state.touched = true;
    this.props.onBlur?.(event);
  }

  protected escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

export function createControl<T extends BaseControl>(ControlClass: new (props: any) => T, props: any): T {
  return new ControlClass(props);
}