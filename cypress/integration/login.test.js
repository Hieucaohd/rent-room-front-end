/// <reference types="cypress"/>

const { FE_URL } = require('../fixtures/data.json');
const { acc } = require('../fixtures/account.json');
describe('Login Test', () => {
    acc.map((item, index) => {
        it(`đăng nhập ${index + 1}`, () => {
            cy.login(item.user, item.password);
            cy.url({
                timeout: 10000,
            })
                .should("eq", `${FE_URL}/`)
                .then(() => {
                    cy.clearCookies();
                });
        });
    });
});
