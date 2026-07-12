class Inquilino {
  constructor(idInquilino, dni, nombreCompleto, celular, estadoActivo = true) {
    this.idInquilino = idInquilino;
    this.dni = dni; // Validado a 8 dígitos en el controlador
    this.nombreCompleto = nombreCompleto;
    this.celular = celular;
    this.estadoActivo = estadoActivo; // true = actual, false = ya se retiró (historial)
  }

  // Método útil para cuando mostremos resúmenes en el historial o listas
  obtenerInfoCorta() {
    return `${this.nombreCompleto} (DNI: ${this.dni})`;
  }
}

module.exports = Inquilino;