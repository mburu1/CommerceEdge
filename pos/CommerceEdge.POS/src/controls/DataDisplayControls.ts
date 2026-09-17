import { BaseControl, ControlProps, ControlEventMap } from './BaseControl';

export interface DataTableProps<T = Record<string, unknown>> extends ControlProps, ControlEventMap {
  columns: DataTableColumn<T>[];
  data: T[];
  selectable?: boolean;
  multiSelect?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  pageable?: boolean;
  pageSize?: number;
  rowKey?: string;
  emptyMessage?: string;
  loading?: boolean;
  striped?: boolean;
  bordered?: boolean;
  hoverable?: boolean;
  onRowClick?: (row: T, index: number) => void;
  onSelectionChange?: (selectedRows: T[]) => void;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  onPageChange?: (page: number, pageSize: number) => void;
}

export interface DataTableColumn<T = Record<string, unknown>> {
  key: string;
  title: string;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: unknown, row: T, index: number) => string | HTMLElement;
  className?: string;
}

export class DataTable<T = Record<string, unknown>> extends BaseControl<T[], DataTableProps<T>> {
  private tableElement: HTMLTableElement | null = null;
  private tbodyElement: HTMLTableSectionElement | null = null;
  private headerElement: HTMLTableSectionElement | null = null;
  private paginationElement: HTMLElement | null = null;
  private sortState: { column: string; direction: 'asc' | 'desc' } | null = null;
  private currentPage: number = 1;
  private selectedRows: Set<string | number> = new Set();

  constructor(props: DataTableProps<T>) {
    super(props);
    this.state.value = props.data || [];
  }

  protected getDefaultValue(): T[] {
    return [];
  }

  protected render(): HTMLElement | string {
    const { columns, striped, bordered, hoverable, loading } = this.props;
    
    return `
      <div class="data-table-wrapper" data-control="data-table">
        <div class="data-table-container">
          <table class="data-table ${striped ? 'striped' : ''} ${bordered ? 'bordered' : ''} ${hoverable ? 'hoverable' : ''}">
            <thead class="data-table-header">
              <tr>
                ${this.props.selectable ? '<th class="selection-column"><input type="checkbox" class="select-all" /></th>' : ''}
                ${columns.map(col => `
                  <th class="${col.className || ''}" style="width: ${col.width || 'auto'}" data-column="${col.key}">
                    <span class="column-title">${this.escapeHtml(col.title)}</span>
                    ${col.sortable ? '<span class="sort-indicator"></span>' : ''}
                  </th>
                `).join('')}
              </tr>
            </thead>
            <tbody class="data-table-body"></tbody>
          </table>
          ${loading ? '<div class="data-table-loading">Loading...</div>' : ''}
        </div>
        <div class="data-table-pagination"></div>
        <div class="data-table-empty" style="display: none;">${this.escapeHtml(this.props.emptyMessage || 'No data available')}</div>
      </div>
    `;
  }

  protected bindEvents(element: HTMLElement): void {
    this.tableElement = element.querySelector('.data-table');
    this.tbodyElement = element.querySelector('.data-table-body');
    this.headerElement = element.querySelector('.data-table-header');
    this.paginationElement = element.querySelector('.data-table-pagination');

    this.headerElement?.addEventListener('click', this.handleHeaderClick.bind(this));
    this.tbodyElement?.addEventListener('click', this.handleRowClick.bind(this));
    this.tbodyElement?.addEventListener('dblclick', this.handleRowDoubleClick.bind(this));
    
    const selectAll = element.querySelector('.select-all') as HTMLInputElement;
    selectAll?.addEventListener('change', this.handleSelectAll.bind(this));

    this.renderRows();
    this.renderPagination();
  }

  protected unbindEvents(element: HTMLElement): void {
    this.headerElement?.removeEventListener('click', this.handleHeaderClick.bind(this));
    this.tbodyElement?.removeEventListener('click', this.handleRowClick.bind(this));
    this.tbodyElement?.removeEventListener('dblclick', this.handleRowDoubleClick.bind(this));
  }

  private handleHeaderClick(event: MouseEvent): void {
    const th = (event.target as HTMLElement).closest('th[data-column]');
    if (!th || !this.props.sortable) return;

    const columnKey = th.getAttribute('data-column');
    const column = this.props.columns.find(c => c.key === columnKey);
    if (!column?.sortable) return;

    const currentDirection = this.sortState?.column === columnKey ? this.sortState.direction : 'asc';
    const newDirection = currentDirection === 'asc' ? 'desc' : 'asc';
    
    this.sortState = { column: columnKey!, direction: newDirection };
    this.props.onSort?.(columnKey!, newDirection);
    this.sortData(columnKey!, newDirection);
    this.renderRows();
    this.updateSortIndicators();
  }

  private handleRowClick(event: MouseEvent): void {
    const tr = (event.target as HTMLElement).closest('tr[data-row-key]');
    if (!tr) return;

    const rowKey = tr.getAttribute('data-row-key');
    const index = parseInt(tr.getAttribute('data-row-index') || '0', 10);
    const row = this.state.value[index];

    if (this.props.selectable) {
      const checkbox = tr.querySelector('.row-select') as HTMLInputElement;
      if (event.target !== checkbox) {
        checkbox.checked = !checkbox.checked;
      }
      this.toggleRowSelection(rowKey!, row);
    }

    this.props.onRowClick?.(row, index);
  }

  private handleRowDoubleClick(event: MouseEvent): void {
    const tr = (event.target as HTMLElement).closest('tr[data-row-key]');
    if (!tr) return;
    const index = parseInt(tr.getAttribute('data-row-index') || '0', 10);
    const row = this.state.value[index];
    this.props.onRowClick?.(row, index);
  }

  private handleSelectAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    
    if (checked) {
      this.state.value.forEach((row, index) => {
        const key = this.getRowKey(row, index);
        this.selectedRows.add(key);
      });
    } else {
      this.selectedRows.clear();
    }

    this.updateRowCheckboxes();
    this.updateSelectAllCheckbox();
    this.props.onSelectionChange?.(this.getSelectedRows());
  }

  private toggleRowSelection(rowKey: string | number, row: T): void {
    if (this.selectedRows.has(rowKey)) {
      this.selectedRows.delete(rowKey);
    } else {
      if (!this.props.multiSelect) {
        this.selectedRows.clear();
      }
      this.selectedRows.add(rowKey);
    }

    this.updateRowCheckboxes();
    this.updateSelectAllCheckbox();
    this.props.onSelectionChange?.(this.getSelectedRows());
  }

  private getRowKey(row: T, index: number): string | number {
    return this.props.rowKey ? (row as any)[this.props.rowKey] : index;
  }

  private getSelectedRowData(): T[] {
    return this.state.value.filter((row, index) => 
      this.selectedRows.has(this.getRowKey(row, index))
    );
  }

  private updateRowCheckboxes(): void {
    this.tbodyElement?.querySelectorAll('.row-select').forEach((checkbox, index) => {
      const rowKey = this.getRowKey(this.state.value[index], index);
      (checkbox as HTMLInputElement).checked = this.selectedRows.has(rowKey);
    });
  }

  private updateSelectAllCheckbox(): void {
    const selectAll = this.element?.querySelector('.select-all') as HTMLInputElement;
    if (selectAll) {
      selectAll.checked = this.selectedRows.size === this.state.value.length && this.state.value.length > 0;
      selectAll.indeterminate = this.selectedRows.size > 0 && this.selectedRows.size < this.state.value.length;
    }
  }

  private updateSortIndicators(): void {
    this.headerElement?.querySelectorAll('th[data-column]').forEach(th => {
      const columnKey = th.getAttribute('data-column');
      const indicator = th.querySelector('.sort-indicator');
      if (indicator && this.sortState?.column === columnKey) {
        indicator.textContent = this.sortState.direction === 'asc' ? ' ▲' : ' ▼';
        th.classList.add('sorted');
      } else if (indicator) {
        indicator.textContent = '';
        th.classList.remove('sorted');
      }
    });
  }

  private sortData(columnKey: string, direction: 'asc' | 'desc'): void {
    const column = this.props.columns.find(c => c.key === columnKey);
    if (!column) return;

    this.state.value.sort((a, b) => {
      const aVal = (a as any)[columnKey];
      const bVal = (b as any)[columnKey];
      
      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  private renderRows(): void {
    if (!this.tbodyElement) return;

    const { columns, selectable, rowKey } = this.props;
    const data = this.state.value;

    if (data.length === 0) {
      this.tbodyElement.innerHTML = '';
      this.element?.querySelector('.data-table-empty')?.setAttribute('style', 'display: block');
      this.element?.querySelector('.data-table-container')?.setAttribute('style', 'display: none');
      return;
    }

    this.element?.querySelector('.data-table-empty')?.setAttribute('style', 'display: none');
    this.element?.querySelector('.data-table-container')?.setAttribute('style', 'display: block');

    this.tbodyElement.innerHTML = data.map((row, index) => {
      const key = this.getRowKey(row, index);
      const selected = this.selectedRows.has(key);
      
      return `
        <tr data-row-key="${key}" data-row-index="${index}" class="${selected ? 'selected' : ''}">
          ${selectable ? `<td class="selection-column"><input type="checkbox" class="row-select" ${selected ? 'checked' : ''} /></td>` : ''}
          ${columns.map(col => {
            const value = (row as any)[col.key];
            const rendered = col.render ? col.render(value, row, index) : this.escapeHtml(String(value ?? ''));
            const content = typeof rendered === 'string' ? rendered : rendered.outerHTML;
            return `<td class="${col.className || ''}" style="text-align: ${col.align || 'left'}">${content}</td>`;
          }).join('')}
        </tr>
      `;
    }).join('');
  }

  private renderPagination(): void {
    if (!this.paginationElement || !this.props.pageable) return;

    const { data, pageSize = 20 } = this.props;
    const totalPages = Math.ceil(data.length / pageSize);
    
    if (totalPages <= 1) {
      this.paginationElement.innerHTML = '';
      return;
    }

    this.paginationElement.innerHTML = `
      <nav class="pagination" aria-label="Pagination">
        <button class="pagination-btn" data-page="first" ${this.currentPage === 1 ? 'disabled' : ''} aria-label="First page">««</button>
        <button class="pagination-btn" data-page="prev" ${this.currentPage === 1 ? 'disabled' : ''} aria-label="Previous page">«</button>
        <span class="pagination-info">Page ${this.currentPage} of ${totalPages}</span>
        <button class="pagination-btn" data-page="next" ${this.currentPage === totalPages ? 'disabled' : ''} aria-label="Next page">»</button>
        <button class="pagination-btn" data-page="last" ${this.currentPage === totalPages ? 'disabled' : ''} aria-label="Last page">»»</button>
      </nav>
    `;

    this.paginationElement.querySelectorAll('.pagination-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLButtonElement;
        const page = target.getAttribute('data-page');
        
        if (page === 'first') this.goToPage(1);
        else if (page === 'prev') this.goToPage(this.currentPage - 1);
        else if (page === 'next') this.goToPage(this.currentPage + 1);
        else if (page === 'last') this.goToPage(totalPages);
      });
    });
  }

  goToPage(page: number): void {
    const { pageSize = 20 } = this.props;
    const totalPages = Math.ceil(this.state.value.length / pageSize);
    
    if (page < 1 || page > totalPages) return;
    
    this.currentPage = page;
    this.props.onPageChange?.(page, pageSize);
    this.renderRows();
    this.renderPagination();
  }

  setData(data: T[]): void {
    this.state.value = data;
    this.currentPage = 1;
    this.selectedRows.clear();
    this.renderRows();
    this.renderPagination();
  }

  getSelectedRows(): T[] {
    return this.getSelectedRowData();
  }

  clearSelection(): void {
    this.selectedRows.clear();
    this.updateRowCheckboxes();
    this.updateSelectAllCheckbox();
  }
}

export interface TotalsDisplayProps extends ControlProps {
  showSubtotal?: boolean;
  showDiscount?: boolean;
  showTax?: boolean;
  showTotal?: boolean;
  labelPrefix?: string;
  currency?: string;
  highlightTotal?: boolean;
}

export class TotalsDisplay extends BaseControl<{ subtotal: number; discount: number; tax: number; total: number }, TotalsDisplayProps> {
  constructor(props: TotalsDisplayProps = {}) {
    super(props);
    this.state.value = { subtotal: 0, discount: 0, tax: 0, total: 0 };
  }

  protected getDefaultValue(): { subtotal: number; discount: number; tax: number; total: number } {
    return { subtotal: 0, discount: 0, tax: 0, total: 0 };
  }

  protected render(): HTMLElement | string {
    const { showSubtotal = true, showDiscount = true, showTax = true, showTotal = true, labelPrefix = '', currency = 'USD', highlightTotal } = this.props;
    const { subtotal, discount, tax, total } = this.state.value;
    
    const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value);

    return `
      <div class="totals-display" data-control="totals-display">
        ${showSubtotal ? `
          <div class="total-row subtotal">
            <span class="total-label">${this.escapeHtml(labelPrefix)}Subtotal</span>
            <span class="total-value">${formatCurrency(subtotal)}</span>
          </div>
        ` : ''}
        ${showDiscount && discount > 0 ? `
          <div class="total-row discount">
            <span class="total-label">${this.escapeHtml(labelPrefix)}Discount</span>
            <span class="total-value">-${formatCurrency(discount)}</span>
          </div>
        ` : ''}
        ${showTax && tax > 0 ? `
          <div class="total-row tax">
            <span class="total-label">${this.escapeHtml(labelPrefix)}Tax</span>
            <span class="total-value">${formatCurrency(tax)}</span>
          </div>
        ` : ''}
        ${showTotal ? `
          <div class="total-row total ${highlightTotal ? 'highlight' : ''}">
            <span class="total-label">${this.escapeHtml(labelPrefix)}Total</span>
            <span class="total-value">${formatCurrency(total)}</span>
          </div>
        ` : ''}
      </div>
    `;
  }

  protected bindEvents(element: HTMLElement): void {}

  protected unbindEvents(element: HTMLElement): void {}

  updateTotals(totals: { subtotal: number; discount: number; tax: number; total: number }): void {
    this.setValue(totals);
    this.render();
  }
}

export interface ProgressIndicatorProps extends ControlProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  label?: string;
  variant?: 'bar' | 'circle' | 'steps';
  color?: string;
  size?: 'small' | 'medium' | 'large';
  striped?: boolean;
  animated?: boolean;
  steps?: number;
}

export class ProgressIndicator extends BaseControl<number, ProgressIndicatorProps> {
  constructor(props: ProgressIndicatorProps) {
    super(props);
    this.state.value = props.value;
  }

  protected getDefaultValue(): number {
    return 0;
  }

  protected render(): HTMLElement | string {
    const { value, max = 100, showLabel = true, label, variant = 'bar', color, size = 'medium', striped, animated } = this.props;
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));
    
    if (variant === 'circle') {
      const radius = size === 'small' ? 20 : size === 'large' ? 60 : 40;
      const circumference = 2 * Math.PI * radius;
      const offset = circumference - (percentage / 100) * circumference;
      
      return `
        <div class="progress-circle progress-${size}" style="--progress-color: ${color || '#007bff'}; --progress-offset: ${offset};">
          <svg width="${radius * 2}" height="${radius * 2}">
            <circle class="progress-circle-bg" cx="${radius}" cy="${radius}" r="${radius}" fill="none" stroke-width="4" />
            <circle class="progress-circle-fg" cx="${radius}" cy="${radius}" r="${radius}" fill="none" stroke-width="4" stroke-dasharray="${circumference}" stroke-dashoffset="${offset}" />
          </svg>
          ${showLabel ? `<span class="progress-circle-label">${label || `${Math.round(percentage)}%`}</span>` : ''}
        </div>
      `;
    }

    if (variant === 'steps') {
      const steps = this.props.steps || 5;
      return `
        <div class="progress-steps progress-${size}">
          ${Array.from({ length: steps }, (_, i) => `
            <div class="progress-step ${i < percentage / 100 * steps ? 'completed' : ''} ${i === Math.floor(percentage / 100 * steps) ? 'active' : ''}">
              <span class="step-indicator">${i + 1}</span>
              <span class="step-label">Step ${i + 1}</span>
            </div>
          `).join('')}
        </div>
      `;
    }

    return `
      <div class="progress-bar progress-${size} ${striped ? 'striped' : ''} ${animated ? 'animated' : ''}" role="progressbar" aria-valuenow="${value}" aria-valuemin="0" aria-valuemax="${max}">
        <div class="progress-bar-fill" style="width: ${percentage}%; ${color ? `background-color: ${color};` : ''}"></div>
        ${showLabel ? `<span class="progress-bar-label">${label || `${Math.round(percentage)}%`}</span>` : ''}
      </div>
    `;
  }

  protected bindEvents(element: HTMLElement): void {}

  protected unbindEvents(element: HTMLElement): void {}

  setValue(value: number): void {
    super.setValue(value, { silent: true });
    this.updateDisplay();
  }

  private updateDisplay(): void {
    const { max = 100, variant = 'bar' } = this.props;
    const percentage = Math.min(100, Math.max(0, (this.state.value / max) * 100));

    if (variant === 'bar') {
      const fill = this.element?.querySelector('.progress-bar-fill') as HTMLElement;
      const label = this.element?.querySelector('.progress-bar-label');
      if (fill) fill.style.width = `${percentage}%`;
      if (label) label.textContent = `${Math.round(percentage)}%`;
    } else if (variant === 'circle') {
      const radius = this.props.size === 'small' ? 20 : this.props.size === 'large' ? 60 : 40;
      const circumference = 2 * Math.PI * radius;
      const offset = circumference - (percentage / 100) * circumference;
      const fg = this.element?.querySelector('.progress-circle-fg') as SVGCircleElement;
      if (fg) fg.style.strokeDashoffset = String(offset);
      const label = this.element?.querySelector('.progress-circle-label');
      if (label) label.textContent = `${Math.round(percentage)}%`;
    }
  }
}