import React, { useState, useEffect } from 'react'

function App() {
  const [habitaciones, setHabitaciones] = useState([])
  const [todosLosPagos, setTodosLosPagos] = useState([]) // Historial global
  const [cargando, setCargando] = useState(true)
  const [vistaActual, setVistaActual] = useState('cuartos') // 'cuartos' o 'historial'
  
  // Filtros para el historial global
  const [filtroCuarto, setFiltroCuarto] = useState('')
  const [filtroMes, setFiltroMes] = useState('')

  // MODALES
  const [modalInquilinoAbierto, setModalInquilinoAbierto] = useState(false)
  const [modalPagosAbierto, setModalPagosAbierto] = useState(false)
  const [cuartoSeleccionado, setCuartoSeleccionado] = useState(null)

  // Form Inquilino
  const [dni, setDni] = useState('')
  const [nombreCompleto, setNombreCompleto] = useState('')
  const [celular, setCelular] = useState('')

  // Form Pagos
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
      .catch(err => { console.error(err); setCargando(false); })
  }

  const cargarTodosLosPagos = () => {
    fetch('http://localhost:5000/api/pagos')
      .then(res => res.json())
      .then(data => setTodosLosPagos(data))
      .catch(err => console.error(err))
  }

  useEffect(() => {
    cargarHabitaciones()
    cargarTodosLosPagos()
  }, [])

  // Guardar Inquilino
  const handleGuardarInquilino = (e) => {
    e.preventDefault()
    fetch('http://localhost:5000/api/inquilinos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dni, nombreCompleto, celular, idHabitacion: cuartoSeleccionado.id })
    })
    .then(res => {
      if (res.ok) {
        alert('¡Inquilino registrado con éxito! 🎉')
        setModalInquilinoAbierto(false)
        cargarHabitaciones()
      }
    })
  }

  // Guardar Pago
  const handleGuardarPago = (e) => {
    e.preventDefault()
    const nombreInquilinoActual = cuartoSeleccionado?.Inquilino?.nombreCompleto || 'Inquilino Histórico'
    
    fetch('http://localhost:5000/api/pagos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mesPagado,
        monto: parseFloat(montoPago),
        idHabitacion: cuartoSeleccionado.id,
        inquilinoNombre: nombreInquilinoActual // Se pasa el nombre explícito
      })
    })
    .then(res => {
      if (res.ok) {
        alert('¡Recibo de pago guardado! 💰')
        cargarTodosLosPagos() // Actualiza el reporte global
        return fetch(`http://localhost:5000/api/pagos/${cuartoSeleccionado.id}`)
      }
    })
    .then(res => res?.json())
    .then(pagos => { if(pagos) setHistorialPagos(pagos) })
  }

  // Retirar Inquilino
  const handleRetirarInquilino = (idHabitacion, numeroCuarto) => {
    if (!window.confirm(`¿Retirar inquilino del Cuarto ${numeroCuarto}? Esto liberará el cuarto sin borrar los recibos de pago.`)) return
    fetch(`http://localhost:5000/api/inquilinos/habitacion/${idHabitacion}`, { method: 'DELETE' })
    .then(res => {
      if (res.ok) { alert('¡Habitación liberada! 🧼'); cargarHabitaciones(); }
    })
  }

  const abrirModalPagos = (habitacion) => {
    setCuartoSeleccionado(habitacion)
    setMesPagado('')
    setMontoPago(habitacion.precioMensual)
    setHistorialPagos([])
    fetch(`http://localhost:5000/api/pagos/${habitacion.id}`)
      .then(res => res.json())
      .then(pagos => setHistorialPagos(pagos))
    setModalPagosAbierto(true)
  }

  // Lógica de Filtros del Historial Global
  const pagosFiltrados = todosLosPagos.filter(pago => {
    const coincideCuarto = filtroCuarto === '' || pago.Habitacion?.numero === filtroCuarto
    const coincideMes = filtroMes === '' || pago.mesPagado.toLowerCase().includes(filtroMes.toLowerCase())
    return coincideCuarto && coincideMes
  })

  const totalIngresos = pagosFiltrados.reduce((sum, p) => sum + p.monto, 0)
  const totalSunat = pagosFiltrados.reduce((sum, p) => sum + p.impuestoSunat, 0)

  return (
    <div className="min-h-screen bg-slate-100 p-4 font-sans text-slate-800">
      <header className="mb-6 rounded-2xl bg-blue-600 p-5 text-white shadow-md flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold">AlquilerGestor 🏠</h1>
          <p className="text-sm opacity-90">Panel de Control para Papás</p>
        </div>
        {/* Pestañas de Navegación */}
        <div className="bg-blue-700/50 p-1.5 rounded-xl flex gap-2">
          <button onClick={() => setVistaActual('cuartos')} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${vistaActual === 'cuartos' ? 'bg-white text-blue-700 shadow-sm' : 'text-white hover:bg-blue-600/30'}`}>
            Estado de Cuartos
          </button>
          <button onClick={() => setVistaActual('historial')} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${vistaActual === 'historial' ? 'bg-white text-blue-700 shadow-sm' : 'text-white hover:bg-blue-600/30'}`}>
            Historial de Pagos 📊
          </button>
        </div>
      </header>

      {cargando ? (
        <p className="text-center text-slate-500 mt-10 animate-pulse">Cargando datos...</p>
      ) : vistaActual === 'cuartos' ? (
        /* VISTA 1: CONTROL DE HABITACIONES */
        <main className="space-y-8">
          {/* Primer Piso */}
          <div>
            <h2 className="text-sm font-extrabold mb-3 text-slate-500 uppercase tracking-wider flex items-center gap-2">Primer Piso</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {habitaciones.filter(h => h.piso === 1).map(h => (
                <div key={h.id} className={`p-5 rounded-2xl border bg-white flex flex-col justify-between shadow-xs ${h.estado === 'Ocupado' ? 'border-l-8 border-l-red-500' : 'border-l-8 border-l-emerald-500'}`}>
                  <div className="flex justify-between">
                    <div>
                      <h3 className="text-lg font-bold">Cuarto {h.numero}</h3>
                      <p className="text-xs text-slate-500">Precio: S/ {h.precioMensual}</p>
                    </div>
                    <span className={`text-[10px] px-2.5 py-1 font-bold rounded-full h-fit ${h.estado === 'Ocupado' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>{h.estado}</span>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end gap-2">
                    {h.estado === 'Ocupado' ? (
                      <>
                        <button onClick={() => handleRetirarInquilino(h.id, h.numero)} className="text-xs font-bold px-3 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100">Retirar</button>
                        <button onClick={() => abrirModalPagos(h)} className="text-xs font-bold px-4 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200">Ver Pago / Recibo</button>
                      </>
                    ) : (
                      <button onClick={() => { setCuartoSeleccionado(h); setDni(''); setNombreCompleto(''); setCelular(''); setModalInquilinoAbierto(true); }} className="text-xs font-bold px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700">Registrar Inquilino</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Segundo Piso */}
          <div>
            <h2 className="text-sm font-extrabold mb-3 text-slate-500 uppercase tracking-wider flex items-center gap-2">Segundo Piso</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {habitaciones.filter(h => h.piso === 2).map(h => (
                <div key={h.id} className={`p-5 rounded-2xl border bg-white flex flex-col justify-between shadow-xs ${h.estado === 'Ocupado' ? 'border-l-8 border-l-red-500' : 'border-l-8 border-l-emerald-500'}`}>
                  <div className="flex justify-between">
                    <div>
                      <h3 className="text-lg font-bold">Cuarto {h.numero}</h3>
                      <p className="text-xs text-slate-500">Precio: S/ {h.precioMensual}</p>
                    </div>
                    <span className={`text-[10px] px-2.5 py-1 font-bold rounded-full h-fit ${h.estado === 'Ocupado' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>{h.estado}</span>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end gap-2">
                    {h.estado === 'Ocupado' ? (
                      <>
                        <button onClick={() => handleRetirarInquilino(h.id, h.numero)} className="text-xs font-bold px-3 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100">Retirar</button>
                        <button onClick={() => abrirModalPagos(h)} className="text-xs font-bold px-4 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200">Ver Pago / Recibo</button>
                      </>
                    ) : (
                      <button onClick={() => { setCuartoSeleccionado(h); setDni(''); setNombreCompleto(''); setCelular(''); setModalInquilinoAbierto(true); }} className="text-xs font-bold px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700">Registrar Inquilino</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      ) : (
        /* VISTA 2: HISTORIAL GENERAL DE PAGOS */
        <main className="space-y-6">
          {/* Tarjetas de Métricas Acumuladas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl shadow-xs border-t-4 border-t-blue-500">
              <p className="text-xs font-bold text-slate-400 uppercase">Total Ingresos Filtrados</p>
              <p className="text-2xl font-black text-slate-800 mt-1">S/ {totalIngresos.toFixed(2)}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-xs border-t-4 border-t-red-400">
              <p className="text-xs font-bold text-slate-400 uppercase">Impuesto SUNAT Acumulado (5%)</p>
              <p className="text-2xl font-black text-red-600 mt-1">S/ {totalSunat.toFixed(2)}</p>
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-white p-4 rounded-2xl shadow-xs flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[150px]">
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Filtrar por Cuarto</label>
              <select value={filtroCuarto} onChange={e => setFiltroCuarto(e.target.value)} className="w-full p-2 text-sm bg-slate-50 border border-slate-200 rounded-lg">
                <option value="">Todos los cuartos</option>
                {habitaciones.map(h => <option key={h.id} value={h.numero}>Cuarto {h.numero}</option>)}
              </select>
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Buscar por Mes / Texto</label>
              <input type="text" placeholder="Ej. Julio" value={filtroMes} onChange={e => setFiltroMes(e.target.value)} className="w-full p-2 text-sm bg-slate-50 border border-slate-200 rounded-lg" />
            </div>
          </div>

          {/* Tabla de Resultados */}
          <div className="bg-white rounded-2xl shadow-xs overflow-hidden border">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-[10px] text-slate-400 uppercase font-bold border-b">
                  <tr>
                    <th className="p-4">Cuarto</th>
                    <th className="p-4">Inquilino</th>
                    <th className="p-4">Mes Pagado</th>
                    <th className="p-4 text-right">Monto</th>
                    <th className="p-4 text-right">Impuesto SUNAT</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {pagosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-slate-400">No se encontraron registros históricos con esos filtros.</td>
                    </tr>
                  ) : (
                    pagosFiltrados.map(pago => (
                      <tr key={pago.id} className="hover:bg-slate-50/50">
                        <td className="p-4 font-bold text-slate-800">Cuarto {pago.Habitacion?.numero || 'Baja'}</td>
                        <td className="p-4 font-medium">{pago.inquilinoNombre}</td>
                        <td className="p-4 text-slate-500">{pago.mesPagado}</td>
                        <td className="p-4 text-right font-bold text-slate-700">S/ {pago.monto.toFixed(2)}</td>
                        <td className="p-4 text-right font-bold text-red-600 bg-red-50/30">S/ {pago.impuestoSunat.toFixed(2)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      )}

      {/* MODAL 1: REGISTRAR INQUILINO */}
      {modalInquilinoAbierto && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-xl">
            <h3 className="text-base font-bold mb-4">Registrar en Cuarto {cuartoSeleccionado?.numero}</h3>
            <form onSubmit={handleGuardarInquilino} className="space-y-3">
              <input type="text" required placeholder="DNI" value={dni} onChange={e => setDni(e.target.value)} className="w-full p-2.5 text-sm rounded-xl border bg-slate-50" />
              <input type="text" required placeholder="Nombre Completo" value={nombreCompleto} onChange={e => setNombreCompleto(e.target.value)} className="w-full p-2.5 text-sm rounded-xl border bg-slate-50" />
              <input type="tel" placeholder="Celular" value={celular} onChange={e => setCelular(e.target.value)} className="w-full p-2.5 text-sm rounded-xl border bg-slate-50" />
              <div className="pt-2 flex gap-2">
                <button type="button" onClick={() => setModalInquilinoAbierto(false)} className="w-1/2 py-2 text-sm bg-slate-100 rounded-xl font-bold">Cancelar</button>
                <button type="submit" className="w-1/2 py-2 text-sm bg-emerald-600 text-white rounded-xl font-bold">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: VER PAGO DE LA HABITACIÓN */}
      {modalPagosAbierto && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4 border-b pb-2">
              <div>
                <h3 className="font-bold text-slate-800">Recibos - Cuarto {cuartoSeleccionado?.numero}</h3>
                <p className="text-xs text-blue-600 font-bold mt-0.5">Inquilino: {cuartoSeleccionado?.Inquilino?.nombreCompleto || 'Cargando...'}</p>
              </div>
              <button onClick={() => setModalPagosAbierto(false)} className="text-xl font-bold text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            
            <form onSubmit={handleGuardarPago} className="bg-slate-50 p-3 rounded-xl border mb-4 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input type="text" required placeholder="Ej. Julio 2026" value={mesPagado} onChange={e => setMesPagado(e.target.value)} className="p-2 text-xs rounded-lg border bg-white" />
                <input type="number" required value={montoPago} onChange={e => setMontoPago(e.target.value)} className="p-2 text-xs rounded-lg border bg-white" />
              </div>
              <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-lg text-xs font-bold">Guardar Pago</button>
            </form>

            <div className="space-y-1.5">
              {historialPagos.map(p => (
                <div key={p.id} className="p-2.5 bg-slate-50 rounded-xl flex justify-between text-xs items-center border">
                  <div>
                    <p className="font-bold">{p.mesPagado}</p>
                    <p className="text-[10px] text-slate-400">Por: {p.inquilinoNombre}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">S/ {p.monto}</p>
                    <p className="text-[10px] text-red-500 font-semibold">SUNAT: S/ {p.impuestoSunat.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App