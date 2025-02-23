/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to clear the shopping cart
       * @example cy.clearCart()
       */
      clearCart(): Chainable<void>;
    }
  }
}

// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Add custom commands here if needed
Cypress.Commands.add("clearCart", () => {
  localStorage.removeItem("cart");
});

export {};
