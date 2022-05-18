/// <reference types="cypress"/>

const data = require('../fixtures/data.json');
const { acc } = require('../fixtures/account.json');
describe('Login Test', () => {
    it('thêm trọ', () => {
        cy.server().route(
            'GET',
            '*mapbox.com*'
        ).as('MAPBOX')
        cy.login(acc[0].user, acc[0].password);
        cy.url({
            timeout: 10000,
        }).should('eq', `${data.FE_URL}/`);
        cy.visit(`${data.FE_URL}/user/homes?page=1`);
        cy.get('button[class*="chakra-button"]').contains('Thêm trọ').click();
        cy.get('select[name="province"]', {
            timeout: 10000,
        }).select(1);
        cy.get('select[name="district"]', {
            timeout: 10000,
        }).select(5);
        cy.get('select[name="ward"]', {
            timeout: 10000,
        }).select(4);
        cy.get('input[placeholder="Vị trí cụ thể"]').click().wait(4000);
        cy.get('div.addhome-form__mapbox').click(225, 260).wait(1000);
        cy.get('button[type="button"]').contains('Tiếp tục').click();
        cy.get('select[name="liveWithOwner"]').select(0);
        cy.get('input[name="electricityPrice"]').type('12345');
        cy.get('input[name="waterPrice"]').type('20000');
        cy.get('button[type="submit"]').contains('Thêm').click();
        cy.contains('Thêm trọ thành công', {
            timeout: 10000,
        });
    });
});
