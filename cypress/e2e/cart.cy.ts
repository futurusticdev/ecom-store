describe("Shopping Cart", () => {
  beforeEach(() => {
    // Clear cart before each test
    cy.window().then((win) => {
      win.localStorage.removeItem("cart");
    });
    // Visit the product page
    cy.visit("/products/classic-leather-jacket");
  });

  it("should add an item to cart", () => {
    // Select a size and color
    cy.get('[data-testid="size-select"]').select("M");
    cy.get('[data-testid="color-select"]').select("Black");

    // Add to cart
    cy.get('[data-testid="add-to-cart"]').click();

    // Verify cart has item
    cy.get('[data-testid="cart-count"]').should("have.text", "1");
  });

  it("should update quantity in cart", () => {
    // Add item first
    cy.get('[data-testid="size-select"]').select("M");
    cy.get('[data-testid="color-select"]').select("Black");
    cy.get('[data-testid="add-to-cart"]').click();

    // Open cart
    cy.get('[data-testid="cart-button"]').click();

    // Increase quantity
    cy.get('[data-testid="increase-quantity"]').click();

    // Verify quantity updated
    cy.get('[data-testid="item-quantity"]').should("have.text", "2");
  });

  it("should remove item from cart", () => {
    // Add item first
    cy.get('[data-testid="size-select"]').select("M");
    cy.get('[data-testid="color-select"]').select("Black");
    cy.get('[data-testid="add-to-cart"]').click();

    // Open cart
    cy.get('[data-testid="cart-button"]').click();

    // Remove item
    cy.get('[data-testid="remove-item"]').click();

    // Verify cart is empty
    cy.get('[data-testid="cart-empty"]').should("be.visible");
  });

  it("should proceed to checkout", () => {
    // Add item first
    cy.get('[data-testid="size-select"]').select("M");
    cy.get('[data-testid="color-select"]').select("Black");
    cy.get('[data-testid="add-to-cart"]').click();

    // Open cart
    cy.get('[data-testid="cart-button"]').click();

    // Click checkout
    cy.get('[data-testid="checkout-button"]').click();

    // Verify on checkout page
    cy.url().should("include", "/checkout");
  });
});
