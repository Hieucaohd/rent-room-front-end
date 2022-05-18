const data = require('../fixtures/data.json');

Cypress.Commands.add('login', (user, password) => {
    cy.visit(`${data.FE_URL}/signin`);
    cy.get('input[name="email"]').type(user);
    cy.get('input[name="password"]').type(password);
    cy.get('button[type="submit"]').should('have.text', 'Đăng Nhập').click();
});

Cypress.Commands.add('logout', () => {
    cy.get('button[id*="menu-button"]').click();
    cy.get('div.chakra-menu__menu-list').children('button').last().click();
    cy.get('footer[class*="chakra-modal"]').children().last().should('have.text', 'Đồng ý').click();
});

Cypress.Commands.add('to_profile', () => {
    cy.get('button[id*="menu-button"]').click();
    cy.get('div.chakra-menu__menu-list').children('button').first().click();
});

// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
