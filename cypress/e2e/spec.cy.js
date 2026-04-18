describe('template spec', () => {
  it('passes', () => {
    cy.visit('https://example.cypress.io')
  })
})

it('debe cargar la tabla de productos', () => {
  cy.contains('h1', 'Inventario de Productos')
  cy.get('table').should('exist')

  cy.wait(1000)
  cy.screenshot('tabla-productos')
})