import { ViewConfig, ViewType, ViewComponent } from './ViewRegistry';

export const saleViewConfig: ViewConfig = {
  viewId: 'sale',
  type: 'sale',
  title: 'New Sale',
  icon: 'cart',
  permissions: ['sales.create'],
  layout: {
    type: 'split',
    orientation: 'horizontal',
    sections: [
      {
        id: 'product-panel',
        title: 'Products',
        components: ['product-search', 'category-tabs', 'product-grid'],
        collapsible: false,
        defaultExpanded: true,
        minSize: 300,
        maxSize: 600
      },
      {
        id: 'cart-panel',
        title: 'Cart',
        components: ['cart-items', 'cart-totals', 'cart-actions'],
        collapsible: false,
        defaultExpanded: true,
        minSize: 350
      },
      {
        id: 'payment-panel',
        title: 'Payment',
        components: ['payment-methods', 'payment-summary', 'customer-display'],
        collapsible: true,
        defaultExpanded: false
      }
    ]
  },
  components: [
    {
      componentId: 'product-search',
      type: 'search-input',
      props: {
        placeholder: 'Search products by name, SKU, or barcode...',
        debounceMs: 300,
        showBarcodeScanner: true
      },
      bindings: [
        { property: 'value', path: 'searchQuery', twoWay: true },
        { property: 'onSearch', path: 'onProductSearch' }
      ]
    },
    {
      componentId: 'category-tabs',
      type: 'tab-group',
      props: {
        tabs: [],
        showAllTab: true
      },
      bindings: [
        { property: 'tabs', path: 'categories' },
        { property: 'activeTab', path: 'selectedCategory', twoWay: true },
        { property: 'onChange', path: 'onCategoryChange' }
      ]
    },
    {
      componentId: 'product-grid',
      type: 'product-grid',
      props: {
        columns: 4,
        showPrice: true,
        showStock: true,
        enableQuickAdd: true
      },
      bindings: [
        { property: 'products', path: 'filteredProducts' },
        { property: 'onAddToCart', path: 'onAddToCart' },
        { property: 'onQuickAdd', path: 'onQuickAdd' }
      ]
    },
    {
      componentId: 'cart-items',
      type: 'cart-list',
      props: {
        showQuantity: true,
        showDiscount: true,
        showTax: true,
        enableEdit: true,
        enableRemove: true,
        enableVoid: true
      },
      bindings: [
        { property: 'items', path: 'cart.items', twoWay: true },
        { property: 'onQuantityChange', path: 'onQuantityChange' },
        { property: 'onDiscountChange', path: 'onDiscountChange' },
        { property: 'onRemove', path: 'onRemoveItem' },
        { property: 'onVoid', path: 'onVoidItem' }
      ]
    },
    {
      componentId: 'cart-totals',
      type: 'totals-display',
      props: {
        showSubtotal: true,
        showDiscount: true,
        showTax: true,
        showTotal: true,
        highlightTotal: true
      },
      bindings: [
        { property: 'subtotal', path: 'cart.subtotal' },
        { property: 'discount', path: 'cart.discount' },
        { property: 'tax', path: 'cart.tax' },
        { property: 'total', path: 'cart.total' }
      ]
    },
    {
      componentId: 'cart-actions',
      type: 'action-bar',
      props: {
        actions: [
          { id: 'add-customer', label: 'Add Customer', icon: 'user-plus', primary: false },
          { id: 'apply-discount', label: 'Apply Discount', icon: 'tag', primary: false },
          { id: 'suspend', label: 'Suspend', icon: 'pause', primary: false },
          { id: 'pay', label: 'Pay', icon: 'credit-card', primary: true }
        ]
      },
      bindings: [
        { property: 'onAction', path: 'onCartAction' }
      ]
    },
    {
      componentId: 'payment-methods',
      type: 'payment-method-selector',
      props: {
        methods: ['cash', 'card', 'mobile', 'gift_card', 'loyalty_points', 'store_credit'],
        allowSplit: true,
        showChangeDue: true
      },
      bindings: [
        { property: 'selectedMethods', path: 'payment.methods', twoWay: true },
        { property: 'amounts', path: 'payment.amounts', twoWay: true },
        { property: 'onMethodSelect', path: 'onPaymentMethodSelect' },
        { property: 'onAmountChange', path: 'onPaymentAmountChange' }
      ]
    },
    {
      componentId: 'payment-summary',
      type: 'payment-summary',
      props: {
        showTotal: true,
        showPaid: true,
        showChange: true,
        showRemaining: true
      },
      bindings: [
        { property: 'total', path: 'cart.total' },
        { property: 'paid', path: 'payment.paidAmount' },
        { property: 'change', path: 'payment.changeDue' },
        { property: 'remaining', path: 'payment.remainingAmount' }
      ]
    },
    {
      componentId: 'customer-display',
      type: 'customer-info-panel',
      props: {
        showName: true,
        showLoyalty: true,
        showPoints: true,
        showBalance: true
      },
      bindings: [
        { property: 'customer', path: 'customer' },
        { property: 'visible', path: 'customer != null' }
      ]
    }
  ],
  navigation: {
    previous: 'manager-menu',
    next: 'payment',
    cancel: 'manager-menu',
    shortcuts: {
      'F1': 'product-search',
      'F2': 'add-customer',
      'F3': 'apply-discount',
      'F4': 'suspend',
      'F12': 'pay'
    }
  },
  validation: {
    rules: [
      { field: 'cart.items.length', rule: 'min', value: 1, message: 'Cart must contain at least one item' },
      { field: 'payment.paidAmount', rule: 'min', value: 0, message: 'Paid amount cannot be negative' }
    ],
    validateOnChange: true,
    validateOnBlur: false
  }
};

export const refundViewConfig: ViewConfig = {
  viewId: 'refund',
  type: 'refund',
  title: 'Process Refund',
  icon: 'undo',
  permissions: ['returns.create'],
  layout: {
    type: 'split',
    orientation: 'horizontal',
    sections: [
      {
        id: 'order-lookup',
        title: 'Find Order',
        components: ['order-search', 'order-details'],
        collapsible: false,
        defaultExpanded: true,
        minSize: 400
      },
      {
        id: 'refund-panel',
        title: 'Refund Items',
        components: ['refund-items', 'refund-totals', 'refund-payment', 'refund-actions'],
        collapsible: false,
        defaultExpanded: true
      }
    ]
  },
  components: [
    {
      componentId: 'order-search',
      type: 'order-search',
      props: {
        searchBy: ['orderId', 'receiptNumber', 'customerId', 'dateRange'],
        showRecent: true,
        recentLimit: 10
      },
      bindings: [
        { property: 'onSearch', path: 'onOrderSearch' },
        { property: 'onSelect', path: 'onOrderSelect' }
      ]
    },
    {
      componentId: 'order-details',
      type: 'order-detail-view',
      props: {
        showItems: true,
        showPayments: true,
        showCustomer: true,
        selectableItems: true
      },
      bindings: [
        { property: 'order', path: 'selectedOrder' },
        { property: 'onItemSelect', path: 'onRefundItemSelect' }
      ]
    },
    {
      componentId: 'refund-items',
      type: 'refund-item-list',
      props: {
        showQuantity: true,
        showReason: true,
        reasons: ['defective', 'wrong_item', 'customer_changed_mind', 'damaged', 'expired', 'other']
      },
      bindings: [
        { property: 'items', path: 'refund.items', twoWay: true },
        { property: 'onQuantityChange', path: 'onRefundQuantityChange' },
        { property: 'onReasonChange', path: 'onRefundReasonChange' },
        { property: 'onRemove', path: 'onRemoveRefundItem' }
      ]
    },
    {
      componentId: 'refund-totals',
      type: 'totals-display',
      props: {
        showSubtotal: true,
        showTax: true,
        showTotal: true,
        highlightTotal: true,
        labelPrefix: 'Refund '
      },
      bindings: [
        { property: 'subtotal', path: 'refund.subtotal' },
        { property: 'tax', path: 'refund.tax' },
        { property: 'total', path: 'refund.total' }
      ]
    },
    {
      componentId: 'refund-payment',
      type: 'refund-payment-method',
      props: {
        methods: ['cash', 'card', 'gift_card', 'store_credit'],
        originalPaymentMethod: true
      },
      bindings: [
        { property: 'method', path: 'refund.paymentMethod', twoWay: true },
        { property: 'originalMethod', path: 'selectedOrder.payments[0].method' }
      ]
    },
    {
      componentId: 'refund-actions',
      type: 'action-bar',
      props: {
        actions: [
          { id: 'cancel', label: 'Cancel', icon: 'x', primary: false },
          { id: 'process', label: 'Process Refund', icon: 'check', primary: true }
        ]
      },
      bindings: [
        { property: 'onAction', path: 'onRefundAction' }
      ]
    }
  ],
  navigation: {
    previous: 'manager-menu',
    cancel: 'manager-menu',
    shortcuts: {
      'Escape': 'cancel',
      'Enter': 'process'
    }
  },
  validation: {
    rules: [
      { field: 'selectedOrder', rule: 'required', message: 'Please select an order to refund' },
      { field: 'refund.items.length', rule: 'min', value: 1, message: 'Must select at least one item to refund' },
      { field: 'refund.paymentMethod', rule: 'required', message: 'Refund payment method is required' }
    ],
    validateOnChange: true
  }
};

export const customerViewConfig: ViewConfig = {
  viewId: 'customer-lookup',
  type: 'customer_lookup',
  title: 'Customer Lookup',
  icon: 'search',
  permissions: ['customers.read'],
  layout: {
    type: 'single',
    sections: [
      {
        id: 'search-section',
        title: 'Search',
        components: ['search-form', 'search-results'],
        defaultExpanded: true
      },
      {
        id: 'detail-section',
        title: 'Customer Details',
        components: ['customer-details', 'customer-actions'],
        defaultExpanded: true,
        collapsible: true
      }
    ]
  },
  components: [
    {
      componentId: 'search-form',
      type: 'customer-search-form',
      props: {
        fields: ['name', 'email', 'phone', 'customerId', 'loyaltyTier'],
        showAdvanced: true
      },
      bindings: [
        { property: 'onSearch', path: 'onCustomerSearch' },
        { property: 'onClear', path: 'onClearSearch' }
      ]
    },
    {
      componentId: 'search-results',
      type: 'customer-results-table',
      props: {
        columns: ['customerId', 'name', 'email', 'phone', 'loyaltyTier', 'loyaltyPoints'],
        selectable: true,
        multiSelect: false,
        pageSize: 20
      },
      bindings: [
        { property: 'customers', path: 'searchResults.customers' },
        { property: 'totalCount', path: 'searchResults.totalCount' },
        { property: 'page', path: 'searchResults.page', twoWay: true },
        { property: 'onSelect', path: 'onCustomerSelect' },
        { property: 'onPageChange', path: 'onPageChange' }
      ]
    },
    {
      componentId: 'customer-details',
      type: 'customer-detail-panel',
      props: {
        showAddress: true,
        showLoyalty: true,
        showHistory: true,
        showOrders: true,
        editable: false
      },
      bindings: [
        { property: 'customer', path: 'selectedCustomer' },
        { property: 'visible', path: 'selectedCustomer != null' }
      ]
    },
    {
      componentId: 'customer-actions',
      type: 'action-bar',
      props: {
        actions: [
          { id: 'new', label: 'New Customer', icon: 'plus', primary: true },
          { id: 'edit', label: 'Edit', icon: 'edit', primary: false },
          { id: 'add-points', label: 'Add Points', icon: 'star', primary: false },
          { id: 'view-orders', label: 'Order History', icon: 'history', primary: false }
        ]
      },
      bindings: [
        { property: 'onAction', path: 'onCustomerAction' },
        { property: 'disabled', path: 'selectedCustomer == null', target: ['edit', 'add-points', 'view-orders'] }
      ]
    }
  ],
  navigation: {
    previous: 'manager-menu',
    cancel: 'manager-menu'
  }
};

export const shiftViewConfig: ViewConfig = {
  viewId: 'shift-open',
  type: 'shift_open',
  title: 'Open Shift',
  icon: 'play-circle',
  permissions: ['shifts.open'],
  layout: {
    type: 'single',
    sections: [
      {
        id: 'main',
        components: ['shift-form', 'float-entry', 'shift-actions']
      }
    ]
  },
  components: [
    {
      componentId: 'shift-form',
      type: 'shift-open-form',
      props: {
        fields: ['operatorId', 'registerId'],
        autoFocus: 'operatorId'
      },
      bindings: [
        { property: 'operatorId', path: 'form.operatorId', twoWay: true },
        { property: 'registerId', path: 'form.registerId', twoWay: true },
        { property: 'onSubmit', path: 'onOpenShift' }
      ]
    },
    {
      componentId: 'float-entry',
      type: 'float-entry',
      props: {
        label: 'Opening Float',
        currency: 'USD',
        denominations: [100, 50, 20, 10, 5, 1, 0.25, 0.10, 0.05, 0.01],
        showCalculator: true
      },
      bindings: [
        { property: 'amount', path: 'form.openingFloat', twoWay: true },
        { property: 'breakdown', path: 'form.floatBreakdown', twoWay: true }
      ]
    },
    {
      componentId: 'shift-actions',
      type: 'action-bar',
      props: {
        actions: [
          { id: 'cancel', label: 'Cancel', icon: 'x', primary: false },
          { id: 'open', label: 'Open Shift', icon: 'check', primary: true }
        ]
      },
      bindings: [
        { property: 'onAction', path: 'onShiftAction' }
      ]
    }
  ],
  validation: {
    rules: [
      { field: 'form.operatorId', rule: 'required', message: 'Operator ID is required' },
      { field: 'form.registerId', rule: 'required', message: 'Register ID is required' },
      { field: 'form.openingFloat', rule: 'min', value: 0, message: 'Opening float cannot be negative' }
    ],
    validateOnChange: true
  }
};

export const paymentViewConfig: ViewConfig = {
  viewId: 'payment',
  type: 'payment',
  title: 'Payment',
  icon: 'credit-card',
  permissions: ['payments.process'],
  layout: {
    type: 'split',
    orientation: 'vertical',
    sections: [
      {
        id: 'payment-methods',
        title: 'Payment Methods',
        components: ['method-selector', 'amount-entry', 'card-terminal'],
        defaultExpanded: true
      },
      {
        id: 'summary',
        title: 'Payment Summary',
        components: ['payment-summary', 'payment-actions'],
        defaultExpanded: true
      }
    ]
  },
  components: [
    {
      componentId: 'method-selector',
      type: 'payment-method-grid',
      props: {
        methods: [
          { id: 'cash', label: 'Cash', icon: 'cash', color: 'green' },
          { id: 'card', label: 'Card', icon: 'credit-card', color: 'blue' },
          { id: 'mobile', label: 'Mobile Pay', icon: 'smartphone', color: 'purple' },
          { id: 'gift_card', label: 'Gift Card', icon: 'gift', color: 'orange' },
          { id: 'loyalty_points', label: 'Loyalty Points', icon: 'star', color: 'gold' },
          { id: 'store_credit', label: 'Store Credit', icon: 'wallet', color: 'teal' }
        ],
        allowMultiple: true
      },
      bindings: [
        { property: 'selectedMethods', path: 'payment.methods', twoWay: true },
        { property: 'onSelect', path: 'onMethodSelect' }
      ]
    },
    {
      componentId: 'amount-entry',
      type: 'payment-amount-entry',
      props: {
        showQuickAmounts: true,
        quickAmounts: [5, 10, 20, 50, 100],
        showExactChange: true,
        currency: 'USD'
      },
      bindings: [
        { property: 'amounts', path: 'payment.amounts', twoWay: true },
        { property: 'total', path: 'cart.total' },
        { property: 'onAmountChange', path: 'onAmountChange' },
        { property: 'onQuickAmount', path: 'onQuickAmount' }
      ]
    },
    {
      componentId: 'card-terminal',
      type: 'card-terminal-status',
      props: {
        showStatus: true,
        showLastTransaction: true,
        simulateMode: true
      },
      bindings: [
        { property: 'connected', path: 'terminal.connected' },
        { property: 'onProcessCard', path: 'onProcessCard' },
        { property: 'onCancel', path: 'onCancelCard' }
      ],
      visible: 'payment.methods.includes("card")'
    },
    {
      componentId: 'payment-summary',
      type: 'payment-summary',
      props: {
        showTotal: true,
        showPaid: true,
        showChange: true,
        showRemaining: true
      },
      bindings: [
        { property: 'total', path: 'cart.total' },
        { property: 'paid', path: 'payment.paidAmount' },
        { property: 'change', path: 'payment.changeDue' },
        { property: 'remaining', path: 'payment.remainingAmount' }
      ]
    },
    {
      componentId: 'payment-actions',
      type: 'action-bar',
      props: {
        actions: [
          { id: 'back', label: 'Back to Cart', icon: 'arrow-left', primary: false },
          { id: 'complete', label: 'Complete Sale', icon: 'check-circle', primary: true }
        ]
      },
      bindings: [
        { property: 'onAction', path: 'onPaymentAction' },
        { property: 'disabled', path: 'payment.remainingAmount > 0', target: ['complete'] }
      ]
    }
  ],
  navigation: {
    previous: 'sale',
    cancel: 'sale'
  },
  validation: {
    rules: [
      { field: 'payment.remainingAmount', rule: 'max', value: 0, message: 'Payment amount must cover total' }
    ],
    validateOnChange: true
  }
};

export const registerStandardViews = (registry: any): void => {
  registry.register(saleViewConfig);
  registry.register(refundViewConfig);
  registry.register(customerViewConfig);
  registry.register(shiftViewConfig);
  registry.register(paymentViewConfig);
};