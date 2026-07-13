import React, { useState, useEffect } from 'react'

function App() {
  const [habitaciones, setHabitaciones] = useState([])
  const [todosLosPagos, setTodosLosPagos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [vistaActual, setVistaActual] = useState('cuartos') // 'cuartos' o 'historial'
  
  // Filtros
  const [filtroCuarto, setFiltroCuarto] = useState('')
  const [filtroMes, setFiltroMes] = useState('')

  // Modales
  const [modalInquilinoAbierto, setModalInquilinoAbierto] = useState(false)
  const [modalPagosAbierto, setModalPagosAbierto] = useState(false)
  const [cuartoSeleccionado, setCuartoSeleccionado] = useState(null)

  // Form Inquilino + Tu Plus
  const [dni, setDni] = useState('')
  const [nombreCompleto, setNombreCompleto] = useState('')
  const [celular, setCelular] = useState('')
  const [fechaIngreso, setFechaIngreso] = useState('')
  const [diaPago, setDiaPago] = useState('15')

  // Form Pagos + Tu Plus
  const [historialPagos, setHistorialPagos] = useState([])
  const [mesPagado, setMesPagado] = useState('')
  const [montoPago, setMontoPago] = useState('')
  const [notaInterna, setNotaInterna] = useState('')

  const cargarHabitaciones = () => {
    setCargando(true)
    fetch('http://localhost:5000/api/habitaciones')
      .then(res => res.json())
      .then(data => { setHabitaciones(data); setCargando(false); })
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

  const handleGuardarInquilino = (e) => {
    e.preventDefault()
    fetch('http://localhost:5000/api/inquilinos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dni, nombreCompleto, celular, idHabitacion: cuartoSeleccionado.id, fechaIngreso, diaPago })
    })
    .then(res => {
      if (res.ok) {
        alert('¡Perfil de Inquilino asignado con éxito! 🎉')
        setModalInquilinoAbierto(false)
        cargarHabitaciones()
      }
    })
  }

  const handleGuardarPago = (e) => {
    e.preventDefault()
    const nombreInquilinoActual = cuartoSeleccionado?.Inquilino?.nombreCompleto || 'Inquilino Histórico'
    const dniInquilinoActual = cuartoSeleccionado?.Inquilino?.dni || '00000000'

    fetch('http://localhost:5000/api/pagos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mesPagado,
        monto: parseFloat(montoPago),
        idHabitacion: cuartoSeleccionado.id,
        inquilinoNombre: nombreInquilinoActual,
        inquilinoDni: dniInquilinoActual,
        notaInterna // Guardamos la bitácora secreta
      })
    })
    .then(res => {
      if (res.ok) {
        alert('¡Recibo de pago registrado! 💰')
        setNotaInterna('')
        cargarTodosLosPagos()
        return fetch(`http://localhost:5000/api/pagos/${cuartoSeleccionado.id}`)
      }
    })
    .then(res => res?.json())
    .then(pagos => { if(pagos) setHistorialPagos(pagos) })
  }

  const handleRetirarInquilino = (idHabitacion, numeroCuarto) => {
    if (!window.confirm(`¿Retirar al inquilino del Cuarto ${numeroCuarto}? Se liberará la habitación pero su perfil e historial de pagos quedarán intactos.`)) return
    fetch(`http://localhost:5000/api/inquilinos/habitacion/${idHabitacion}`, { method: 'DELETE' })
    .then(res => { if (res.ok) { alert('¡Habitación liberada! 🧼'); cargarHabitaciones(); } })
  }

  const abrirModalPagos = (habitacion) => {
    setCuartoSeleccionado(habitacion)
    setMesPagado('')
    setMontoPago(habitacion.precioMensual)
    setNotaInterna('')
    setHistorialPagos([])
    fetch(`http://localhost:5000/api/pagos/${habitacion.id}`)
      .then(res => res.json())
      .then(pagos => setHistorialPagos(pagos))
    setModalPagosAbierto(true)
  }

  // TU PLUS: Lógica inteligente para calcular estados de deuda en vivo
  const obtenerAlertaDeuda = (habitacion) => {
    if (habitacion.estado !== 'Ocupado' || !habitacion.diaPago) return null

    const hoy = new Date()
    const diaActual = hoy.getDate()
    const diaDePagoConfigurado = habitacion.diaPago

    if (diaActual > diaDePagoConfigurado) {
      const diasRetraso = diaActual - diaDePagoConfigurado
      return { tipo: 'retrasado', mensaje: `⚠️ Retrasado por ${diasRetraso} días (Debió pagar el ${diaDePagoConfigurado})`, clase: 'bg-red-100 text-red-700 border border-red-300' }
    } else if (diaDePagoConfigurado - diaActual <= 5) {
      return { tipo: 'proximo', mensaje: `⏳ Próximo a vencer (Paga el día ${diaDePagoConfigurado})`, clase: 'bg-amber-100 text-amber-700 border border-amber-300' }
    } else {
      return { tipo: 'aldia', mensaje: `✅ Al día (Próximo pago el ${diaDePagoConfigurado})`, clase: 'bg-emerald-100 text-emerald-700' }
    }
  }

  const pagosFiltrados = todosLosPagos.filter(pago => {
    const coincideCuarto = filtroCuarto === '' || pago.Habitacion?.numero === filtroCuarto
    const coincideMes = filtroMes === '' || pago.mesPagado.toLowerCase().includes(filtroMes.toLowerCase()) || pago.inquilinoNombre.toLowerCase().includes(filtroMes.toLowerCase())
    return coincideCuarto && coincideMes
  })

  const totalIngresos = pagosFiltrados.reduce((sum, p) => sum + p.monto, 0)
  const totalSunat = pagosFiltrados.reduce((sum, p) => sum + p.impuestoSunat, 0)

  return (
    <div className="min-h-screen bg-slate-100 p-4 font-sans text-slate-800">
      <header className="mb-6 rounded-2xl bg-blue-600 p-5 text-white shadow-md flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold">AlquilerGestor Pro 🏠</h1>
          <p className="text-sm opacity-90">Sistema Inteligente con Perfiles y Alertas</p>
        </div>
        <div className="bg-blue-700/50 p-1.5 rounded-xl flex gap-2">
          <button onClick={() => setVistaActual('cuartos')} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${vistaActual === 'cuartos' ? 'bg-white text-blue-700 shadow-sm' : 'text-white hover:bg-blue-600/30'}`}>
            Estado de Cuartos
          </button>
          <button onClick={() => setVistaActual('historial')} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${vistaActual === 'historial' ? 'bg-white text-blue-700 shadow-sm' : 'text-white hover:bg-blue-600/30'}`}>
            Historial Global 📊
          </button>
        </div>
      </header>

      {cargando ? (
        <p className="text-center text-slate-500 mt-10 animate-pulse">Sincronizando base de datos...</p>
      ) : vistaActual === 'cuartos' ? (
        /* VISTA DE HABITACIONES */
        <main className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Renderizar Pisos dinámicamente */}
          {[1, 2].map(pisoId => (
            <div key={pisoId} className="space-y-4">
              <h2 className="text-sm font-extrabold text-slate-500 uppercase tracking-wider">Piso {pisoId}</h2>
              <div className="grid grid-cols-1 gap-4">
                {habitaciones.filter(h => h.piso === pisoId).map(h => {
                  const alerta = obtenerAlertaDeuda(h)
                  return (
                    <div key={h.id} className={`p-5 rounded-2xl border bg-white flex flex-col justify-between shadow-sm transition-all hover:shadow-md ${h.estado === 'Ocupado' ? 'border-l-8 border-l-red-500' : 'border-l-8 border-l-emerald-500'}`}>
                      <div>
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-black text-slate-800">Cuarto {h.numero}</h3>
                            <p className="text-xs font-bold text-slate-500">Precio Base: S/ {h.precioMensual}</p>
                          </div>
                          <span className={`text-[10px] px-3 py-1 font-black rounded-full uppercase tracking-wider ${h.estado === 'Ocupado' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>{h.estado}</span>
                        </div>

                        {/* Si está ocupado, renderizar los datos del perfil actual */}
                        {h.estado === 'Ocupado' && h.Inquilino && (
                          <div className="mt-3 bg-slate-50 p-3 rounded-xl space-y-1 text-xs">
                            <p className="font-bold text-blue-700">👤 {h.Inquilino.nombreCompleto}</p>
                            <p className="text-slate-500">📞 Cel: {h.Inquilino.celular || 'No registrado'}</p>
                            <p className="text-[11px] text-slate-400">📅 Ingreso: {h.fechaIngreso || 'No definida'}</p>
                            {alerta && (
                              <div className={`mt-2 p-2 rounded-lg text-[11px] font-bold ${alerta.clase}`}>
                                {alerta.mensaje}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end gap-2">
                        {h.estado === 'Ocupado' ? (
                          <>
                            <button onClick={() => handleRetirarInquilino(h.id, h.numero)} className="text-xs font-bold px-3 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors">Retirar</button>
                            <button onClick={() => abrirModalPagos(h)} className="text-xs font-bold px-4 py-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">Recibos / Pagar</button>
                          </>
                        ) : (
                          <button onClick={() => { setCuartoSeleccionado(h); setDni(''); setNombreCompleto(''); setCelular(''); setFechaIngreso(''); setModalInquilinoAbierto(true); }} className="text-xs font-bold px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors">Registrar Inquilino</button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </main>
      ) : (
        /* VISTA DE HISTORIAL GLOBAL CON OBSERVACIONES */
        <main className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border shadow-xs border-t-4 border-t-blue-500">
              <p className="text-xs font-bold text-slate-400 uppercase">Ingresos Recaudados</p>
              <p className="text-2xl font-black text-slate-800 mt-1">S/ {totalIngresos.toFixed(2)}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border shadow-xs border-t-4 border-t-red-400">
              <p className="text-xs font-bold text-slate-400 uppercase">Impuesto SUNAT Acumulado</p>
              <p className="text-2xl font-black text-red-600 mt-1">S/ {totalSunat.toFixed(2)}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-xs flex flex-wrap gap-4 items-center border">
            <div className="flex-1 min-w-[150px]">
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Filtrar por Cuarto</label>
              <select value={filtroCuarto} onChange={e => setFiltroCuarto(e.target.value)} className="w-full p-2 text-sm bg-slate-50 border rounded-lg">
                <option value="">Todos los cuartos</option>
                {habitaciones.map(h => <option key={h.id} value={h.numero}>Cuarto {h.numero}</option>)}
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Buscar Inquilino o Mes</label>
              <input type="text" placeholder="Ej: Juan o Julio" value={filtroMes} onChange={e => setFiltroMes(e.target.value)} className="w-full p-2 text-sm bg-slate-50 border rounded-lg" />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xs overflow-hidden border">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-[10px] text-slate-400 uppercase font-bold border-b">
                <tr>
                  <th className="p-4">Cuarto</th>
                  <th className="p-4">Inquilino</th>
                  <th className="p-4">Concepto/Mes</th>
                  <th className="p-4 text-right">Monto</th>
                  <th className="p-4">Bitácora Interna (Solo Papás) 🔒</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {pagosFiltrados.map(pago => (
                  <tr key={pago.id} className="hover:bg-slate-50/50">
                    <td className="p-4 font-bold text-slate-800">Cuarto {pago.Habitacion?.numero}</td>
                    <td className="p-4 font-medium">{pago.inquilinoNombre} <span className="block text-[10px] text-slate-400">DNI: {pago.inquilinoDni}</span></td>
                    <td className="p-4">{pago.mesPagado}</td>
                    <td className="p-4 text-right font-bold text-slate-700">S/ {pago.monto.toFixed(2)}</td>
                    <td className="p-4 text-xs italic text-blue-600 font-medium bg-blue-50/20 max-w-xs truncate">{pago.notaInterna || 'Sin observaciones'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      )}

      {/* MODAL: REGISTRAR INQUILINO CON CONTROL DE FECHAS */}
      {modalInquilinoAbierto && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-xl">
            <h3 className="text-base font-bold text-slate-800 mb-4">Crear Perfil - Cuarto {cuartoSeleccionado?.numero}</h3>
            <form onSubmit={handleGuardarInquilino} className="space-y-3">
              <input type="text" required placeholder="DNI del Inquilino" value={dni} onChange={e => setDni(e.target.value)} className="w-full p-2.5 text-sm rounded-xl border bg-slate-50" />
              <input type="text" required placeholder="Nombre Completo" value={nombreCompleto} onChange={e => setNombreCompleto(e.target.value)} className="w-full p-2.5 text-sm rounded-xl border bg-slate-50" />
              <input type="tel" placeholder="Celular (Opcional)" value={celular} onChange={e => setCelular(e.target.value)} className="w-full p-2.5 text-sm rounded-xl border bg-slate-50" />
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Fecha Ingreso</label>
                  <input type="date" required value={fechaIngreso} onChange={e => setFechaIngreso(e.target.value)} className="w-full p-2 text-xs rounded-lg border bg-slate-50" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Día de Pago Fijo</label>
                  <input type="number" min="1" max="31" required value={diaPago} onChange={e => setDiaPago(e.target.value)} className="w-full p-2 text-xs rounded-lg border bg-slate-50" placeholder="Ej: 15" />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button type="button" onClick={() => setModalInquilinoAbierto(false)} className="w-1/2 py-2 text-sm bg-slate-100 rounded-xl font-bold">Cancelar</button>
                <button type="submit" className="w-1/2 py-2 text-sm bg-emerald-600 text-white rounded-xl font-bold">Ocupar Cuarto</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REGISTRAR PAGOS CON NOTAS INTERNAS */}
      {modalPagosAbierto && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4 border-b pb-2">
              <div>
                <h3 className="font-bold text-slate-800">Recibos - Cuarto {cuartoSeleccionado?.numero}</h3>
                <p className="text-xs text-blue-600 font-bold mt-0.5">👤 {cuartoSeleccionado?.Inquilino?.nombreCompleto}</p>
              </div>
              <button onClick={() => setModalPagosAbierto(false)} className="text-xl font-bold text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            
            <form onSubmit={handleGuardarPago} className="bg-slate-50 p-4 rounded-xl border mb-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <input type="text" required placeholder="Ej: Julio 2026" value={mesPagado} onChange={e => setMesPagado(e.target.value)} className="p-2 text-xs rounded-lg border bg-white" />
                <input type="number" required value={montoPago} onChange={e => setMontoPago(e.target.value)} className="p-2 text-xs rounded-lg border bg-white" />
              </div>
              <input type="text" placeholder="📝 Notas (Ej: Pagó adelantado / S/10 extra luz)" value={notaInterna} onChange={e => setNotaInterna(e.target.value)} className="w-full p-2 text-xs rounded-lg border bg-white" />
              <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700">Procesar Recibo</button>
            </form>

            <div className="space-y-2">
              {historialPagos.map(p => (
                <div key={p.id} className="p-3 bg-slate-50 rounded-xl flex justify-between text-xs items-center border">
                  <div>
                    <p className="font-bold text-slate-700">{p.mesPagado}</p>
                    <p className="text-[10px] text-slate-400">Por: {p.inquilinoNombre}</p>
                    {p.notaInterna && <p className="text-[11px] text-blue-600 mt-1 font-medium bg-blue-50/50 p-1 rounded">📌 {p.notaInterna}</p>}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-800">S/ {p.monto.toFixed(2)}</p>
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