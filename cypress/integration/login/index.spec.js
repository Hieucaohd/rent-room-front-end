const data = require('../../fixtures/data.json')
describe('Login Test', () => {
    it('đi đến trang đăng nhập', () => {
        cy.visit(`${data.FE_URI}/signin`)
    })
})