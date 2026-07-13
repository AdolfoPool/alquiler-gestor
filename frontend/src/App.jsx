import React, { useState, useEffect } from 'react'

function App() {
  const [habitaciones, setHabitaciones] = useState([])
  const [cargando, setCargando] = useState(true)
  
  // MODAL 1: Registrar Inquilino
  const [modalInquilinoAbierto, setModalInquilinoAbierto] = useState(false)
  const [cuartoSeleccionado, setCuartoSeleccionado] = useState(null)
  const [dni, setDni] = useState('')
  const [nombreCompleto, setNombreCompleto] = useState('')
  const [celular, setCelular] = useState('')

  // MODAL 2: Ver Pagos / Recibo
  const [modalPagosAbierto, setModalPagosAbierto] = useState(false)
  const [historialPagos, setHistorialPagos] = useState([])
  const [mesPagado, setMesPagado] = useState('')
  const [montoPago, setMontoPago] = useState('')

  const cargarHabitaciones = () => {
    setCargando(true)
    fetch('http://localhost:5000/api/habitaciones')
      .then(res => res.json())
      .then(data => {
        setHabitaciones(data)
        setCargando(false)
      })
      .catch(err => {
        console.error("Error al conectar con el backend:", err)
        setCargando(false)
      })
  }

  useEffect(() => {
    cargarHabitaciones()
  }, [])

  // Acciones de Inquilino
  const abrirRegistroInquilino = (habitacion) => {
    setCuartoSeleccionado(habitacion)
    setDni('')
    setNombreCompleto('')
    setCelular('')
    setModalInquilinoAbierto(true)
  }

  const handleGuardarInquilino = (e) => {
    e.preventDefault()
    const nuevoInquilino = {
      dni,
      nombreCompleto,
      celular,
      idHabitacion: cuartoSeleccionado.id
    }

    fetch('http://localhost:5000/api/inquilinos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevoInquilino)
    })
    .then(res => {
      if (res.ok) {
        alert('¡Inquilino registrado con éxito! 🎉')
        setModalInquilinoAbierto(false)
        cargarHabitaciones()
      } else {
        alert('Error al registrar inquilino.')
      }
    })
    .catch(err => console.error(err))
  }

  // Acciones de Pagos
  const abrirModalPagos = (habitacion) => {
    setCuartoSeleccionado(habitacion)
    setMesPagado('')
    setMontoPago(habitacion.precioMensual) // Autorellena el precio pactado del cuarto
    setHistorialPagos([])
    
    // Traemos los pagos que tiene guardados este cuarto
    fetch(`http://localhost:5000/api/pagos/${habitacion.id}`)
      .then(res => res.json())
      .then(pagos => setHistorialPagos(pagos))
      .catch(err => console.error("Error al traer pagos:", err))

    setModalPagosAbierto(true)
  }

const handleGuardarPago = (e) => {
    e.preventDefault()
    const nuevoPago = {
      mesPagado,
      monto: parseFloat(montoPago),
      idHabitacion: cuartoSeleccionado.id
    }

    fetch('http://localhost:5000/api/pagos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevoPago)
    })
    .then(res => {
      if (res.ok) {
        alert('¡Recibo de pago guardado correctamente! 💰')
        // Recargamos el historial del modal inmediatamente
        return fetch(`http://localhost:5000/api/pagos/${cuartoSeleccionado.id}`)
      } else {
        alert('Error al procesar el pago')
      }
    })
    .then(res => res?.json())
    .then(pagosActualizados => { // <-- ¡Listo! Juntito y sin espacios para que no chille
      if (pagosActualizados) setHistorialPagos(pagosActualizados)
    })
    .catch(err => console.error(err))
  }

  const handleRetirarInquilino = (idHabitacion, numeroCuarto) => {
    const confirmar = window.confirm(`¿Estás seguro de que deseas retirar al inquilino del Cuarto ${numeroCuarto}? Esto liberará la habitación.`);
    if (!confirmar) return;

    fetch(`http://localhost:5000/api/inquilinos/habitacion/${idHabitacion}`, {
      method: 'DELETE'
    })
    .then(res => {
      if (res.ok) {
        alert('¡Habitación liberada correctamente! 🧼');
        cargarHabitaciones(); // Recargamos la interfaz
      } else {
        alert('Error al intentar retirar al inquilino.');
      }
    })
    .catch(err => console.error("Error:", err));
  }

  // Tarjeta reutilizable para pintar los cuartos
  const renderCard = (habitacion) => {
    const esOcupado = habitacion.estado === 'Ocupado'
    return (
      <div key={habitacion.id} className={`p-5 rounded-2xl shadow-sm border bg-white ${esOcupado ? 'border-l-8 border-l-red-500' : 'border-l-8 border-l-emerald-500'}`}>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-slate-800">Cuarto {habitacion.numero}</h3>
            <p className="text-sm text-slate-500 font-medium mt-1">Precio: S/ {habitacion.precioMensual}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${esOcupado ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
            {habitacion.estado}
          </span>
        </div>
        <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end gap-2">
          {esOcupado ? (
            <>
              <button onClick={() => handleRetirarInquilino(habitacion.id, habitacion.numero)} className="text-sm font-bold px-3 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                Retirar Inquilino
              </button>
              <button onClick={() => abrirModalPagos(habitacion)} className="text-sm font-bold px-4 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                Ver Pago / Recibo
              </button>
            </>
          ) : (
            <button onClick={() => abrirRegistroInquilino(habitacion)} className="text-sm font-bold px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors">
              Registrar Inquilino
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 font-sans text-slate-800">
      <header className="mb-6 rounded-2xl bg-blue-600 p-5 text-white shadow-md">
        <h1 className="text-xl font-bold">AlquilerGestor 🏠</h1>
        <p className="text-sm opacity-90">Panel de Control para Papás</p>
      </header>

      <main className="space-y-8">
        {cargando ? (
          <p className="text-center text-slate-500 mt-10 animate-pulse">Cargando habitaciones...</p>
        ) : (
          <>
            <div>
              <h2 className="text-lg font-extrabold mb-3 text-slate-700 flex items-center gap-2">
                <span className="bg-blue-100 text-blue-700 w-7 h-7 rounded-lg flex items-center justify-center text-xs">1º</span>
                Primer Piso
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {habitaciones.filter(h => h.piso === 1).map(renderCard)}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-extrabold mb-3 text-slate-700 flex items-center gap-2">
                <span className="bg-blue-100 text-blue-700 w-7 h-7 rounded-lg flex items-center justify-center text-xs">2º</span>
                Segundo Piso
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {habitaciones.filter(h => h.piso === 2).map(renderCard)}
              </div>
            </div>
          </>
        )}
      </main>

      {/* MODAL 1: REGISTRAR INQUILINO */}
      {modalInquilinoAbierto && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800">Registrar en Cuarto {cuartoSeleccionado?.numero}</h3>
              <button onClick={() => setModalInquilinoAbierto(false)} className="text-slate-400 hover:text-slate-600 text-2xl font-bold">&times;</button>
            </div>
            <form onSubmit={handleGuardarInquilino} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">DNI</label>
                <input type="text" required placeholder="Ej. 71234567" value={dni} onChange={(e) => setDni(e.target.value)} className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">Nombre Completo</label>
                <input type="text" required placeholder="Ej. Juan Pérez" value={nombreCompleto} onChange={(e) => setNombreCompleto(e.target.value)} className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">Celular</label>
                <input type="tel" placeholder="Ej. 987654321" value={celular} onChange={(e) => setCelular(e.target.value)} className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50" />
              </div>
              <div className="pt-2 flex space-x-3">
                <button type="button" onClick={() => setModalInquilinoAbierto(false)} className="w-1/2 py-3 rounded-xl bg-slate-100 font-bold text-slate-600">Cancelar</button>
                <button type="submit" className="w-1/2 py-3 rounded-xl bg-emerald-600 font-bold text-white shadow-md">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: VER PAGO / RECIBO (NUEVO) */}
      {modalPagosAbierto && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
          <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Recibos - Cuarto {cuartoSeleccionado?.numero}</h3>
                <p className="text-xs text-blue-600 font-semibold mt-0.5">
                  Inquilino: {cuartoSeleccionado?.Inquilino ? cuartoSeleccionado.Inquilino.nombreCompleto : 'Cargando...'}
                </p>
              </div>
              <button onClick={() => setModalPagosAbierto(false)} className="text-slate-400 hover:text-slate-600 text-2xl font-bold">&times;</button>
            </div>

            {/* Formulario de Nuevo Pago */}
            <form onSubmit={handleGuardarPago} className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6 space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Registrar Nuevo Mes</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Mes a Pagar</label>
                  <input type="text" required placeholder="Ej. Julio 2026" value={mesPagado} onChange={(e) => setMesPagado(e.target.value)} className="w-full p-2 text-sm rounded-lg border border-slate-200 bg-white" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Monto (S/)</label>
                  <input type="number" required value={montoPago} onChange={(e) => setMontoPago(e.target.value)} className="w-full p-2 text-sm rounded-lg border border-slate-200 bg-white" />
                </div>
              </div>
              <button type="submit" className="w-full py-2 rounded-lg bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-colors shadow-sm">
                Guardar Pago
              </button>
            </form>

            {/* Historial de Recibos */}
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Historial de Pagos</h4>
              {historialPagos.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4 bg-slate-50 rounded-xl border border-dashed">No hay pagos registrados este año.</p>
              ) : (
                <div className="space-y-2">
                  {historialPagos.map((pago) => (
                    <div key={pago.id} className="p-3 bg-white border border-slate-100 rounded-xl shadow-xs flex justify-between items-center text-sm">
                      <div>
                        <p className="font-bold text-slate-800">{pago.mesPagado}</p>
                        <p className="text-xs text-slate-400">Pago: S/ {pago.monto}</p>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-0.5 bg-red-50 text-red-700 text-[10px] font-extrabold rounded-md uppercase tracking-wide block">
                          SUNAT (5%)
                        </span>
                        <p className="font-extrabold text-slate-700 mt-0.5">S/ {pago.impuestoSunat.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App