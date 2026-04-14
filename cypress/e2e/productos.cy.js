describe('CompuService - Gestión de Productos', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('debe cargar la tabla de productos', () => {
    cy.contains('h1', 'Inventario de Productos')
    cy.get('table').should('exist')
    cy.get('thead').contains('th', 'Nombre')
    cy.get('thead').contains('th', 'Stock')
  })

  it('debe abrir y cerrar el modal para crear productos', () => {
    cy.get('[data-testid="btn-nuevo"]').click()
    cy.get('#modal-producto').should('not.have.class', 'oculta')
    
    cy.get('#modal-titulo').should('contain', 'Crear Producto')
    cy.get('[data-testid="input-nombre"]').should('exist')
    
    cy.get('#btn-cancelar').click()
    cy.get('#modal-producto').should('have.class', 'oculta')
  })

  it('debe permitir llenar el formulario de nuevo producto', () => {
    cy.get('[data-testid="btn-nuevo"]').click()
    
    cy.get('[data-testid="input-nombre"]').type('Teclado Mecánico Test')
    cy.get('[data-testid="input-categoria"]').type('Periféricos')
    cy.get('[data-testid="input-precio"]').type('45.99')
    cy.get('[data-testid="input-stock"]').type('10')
    
    cy.get('[data-testid="input-nombre"]').should('have.value', 'Teclado Mecánico Test')
  })
})
