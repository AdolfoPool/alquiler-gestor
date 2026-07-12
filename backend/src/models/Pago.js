class Pago {
  constructor(idPago, idAlquiler, periodo, montoRecibido, fechaRegistro = new Date()) {
    this.idPago = idPago;
    this.idAlquiler = idAlquiler;
    this.periodo = periodo; // Ej: "07-2026"
    this.montoRecibido = parseFloat(montoRecibido);
    this.fechaRegistro = fechaRegistro;
    
    // Ejecutamos la regla de negocio automáticamente al instanciar el objeto
    this.impuestoSunat = this.calcularImpuestoSunat();
  }

  // REGLA DE NEGOCIO (CUS04): Impuesto de Primera Categoría en Perú (5%)
  calcularImpuestoSunat() {
    return this.montoRecibido * 0.05;
  }

  // Método para formatear los datos antes de enviarlos a la base de datos o al frontend
  obtenerResumenPago() {
    return {
      idPago: this.idPago,
      idAlquiler: this.idAlquiler,
      periodo: this.periodo,
      monto: this.montoRecibido,
      impuesto: this.impuestoSunat,
      fecha: this.fechaRegistro.toLocaleDateString('es-PE')
    };
  }
}

module.exports = Pago;