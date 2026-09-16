export class CartService {
  private items: Array<{ price: number; quantity: number }> = [];

  calculateTotal(items?: Array<{ price: number; quantity: number }>): number {
    const cartItems = items ?? this.items;
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  addItem(item: { price: number; quantity: number }): void {
    this.items.push(item);
  }

  removeItem(index: number): void {
    this.items.splice(index, 1);
  }

  getItems(): Array<{ price: number; quantity: number }> {
    return [...this.items];
  }

  getItemCount(): number {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  clear(): void {
    this.items = [];
  }
}
