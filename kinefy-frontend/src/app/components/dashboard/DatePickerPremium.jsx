import React, { useState } from 'react';

export const CustomCalendar = ({ selectedDate, onSelectDate }) => {
    const [viewDate, setViewDate] = useState(selectedDate ? new Date(selectedDate) : new Date());
    
    const month = viewDate.getMonth();
    const year = viewDate.getFullYear();
    
    const changeMonth = (offset) => {
        setViewDate(new Date(year, month + offset, 1));
    };
    
    const days = [];
    const firstDayOfMonth = new Date(year, month, 1);
    const startDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7; // Lunes = 0, Domingo = 6
    
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Rellenar días vacíos antes del primer día del mes
    for (let i = 0; i < startDayOfWeek; i++) {
        days.push(null);
    }
    
    // Rellenar todos los días del mes
    for (let d = 1; d <= totalDaysInMonth; d++) {
        days.push(new Date(year, month, d));
    }
    
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const weekDays = ["L", "M", "X", "J", "V", "S", "D"];
    
    return (
        <article style={{ background: '#FFFFFF', borderRadius: '20px', border: '1.5px solid #E2E8F0', padding: '1.2rem', width: '100%', boxSizing: 'border-box' }} className="animate-in">
            {/* Cabecera del Mes */}
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <button 
                    type="button" 
                    onClick={() => changeMonth(-1)} 
                    style={{ background: '#F4FAF8', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--color-brand)', fontWeight: '800', fontSize: '1rem' }}
                >
                    ‹
                </button>
                <strong style={{ fontSize: '0.95rem', color: '#1A2E35', fontWeight: '700' }}>
                    {monthNames[month]} {year}
                </strong>
                <button 
                    type="button" 
                    onClick={() => changeMonth(1)} 
                    style={{ background: '#F4FAF8', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--color-brand)', fontWeight: '800', fontSize: '1rem' }}
                >
                    ›
                </button>
            </header>
            
            {/* Días de la Semana */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.4rem', textAlign: 'center', marginBottom: '0.5rem' }}>
                {weekDays.map((wd, i) => (
                    <span key={i} style={{ fontSize: '0.7rem', fontWeight: '700', color: '#7A8C8E', textTransform: 'uppercase' }}>{wd}</span>
                ))}
            </div>
            
            {/* Grilla de Números de Días */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.4rem' }}>
                {days.map((day, idx) => {
                    if (!day) return <div key={idx} />;
                    
                    // Ajustar zona horaria local para comparar fechas
                    const offsetDate = new Date(day.getTime() - (day.getTimezoneOffset() * 60000));
                    const isoStr = offsetDate.toISOString().split('T')[0];
                    
                    const isSelected = selectedDate === isoStr;
                    const isPast = isoStr < todayStr;
                    const isToday = todayStr === isoStr;
                    
                    return (
                        <button
                            key={idx}
                            type="button"
                            disabled={isPast}
                            onClick={() => onSelectDate(isoStr)}
                            style={{
                                height: '36px',
                                border: 'none',
                                borderRadius: '10px',
                                background: isSelected ? 'var(--color-brand)' : isToday ? '#E2F1EC' : 'transparent',
                                color: isSelected ? '#FFFFFF' : isPast ? '#CBD5E1' : '#1A2E35',
                                fontWeight: isSelected || isToday ? '800' : '600',
                                fontSize: '0.8rem',
                                cursor: isPast ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                opacity: isPast ? 0.5 : 1
                            }}
                            className={isSelected || isPast ? "" : "hover-light-mint"}
                        >
                            {day.getDate()}
                        </button>
                    );
                })}
            </div>
        </article>
    );
};

export const CustomTimePicker = ({ selectedTime, onSelectTime }) => {
    const [h, m] = (selectedTime || "10:00").split(":");
    
    const setTime = (newH, newM) => {
        onSelectTime(`${newH}:${newM}`);
    };
    
    const hours = Array.from({ length: 13 }, (_, i) => String(i + 8).padStart(2, '0')); // 08:00 a 20:00
    const minutes = ["00", "15", "30", "45"];
    
    return (
        <div style={{ display: 'flex', gap: '0.8rem', width: '100%', boxSizing: 'border-box' }} className="animate-in">
            <div style={{ flex: 1 }}>
                <label className="meta-label--mini" style={{ marginBottom: '0.3rem', display: 'block', fontWeight: '700', fontSize: '0.7rem', color: '#7A8C8E' }}>Hora</label>
                <select 
                    value={h} 
                    onChange={e => setTime(e.target.value, m)}
                    className="input-clinical"
                    style={{ padding: '0 0.8rem', height: '48px', borderRadius: '12px', width: '100%', boxSizing: 'border-box', border: '1.5px solid #E2E8F0', background: '#F9FBFB', fontWeight: '600', color: '#1A2E35' }}
                >
                    {hours.map(hr => <option key={hr} value={hr}>{hr} hs</option>)}
                </select>
            </div>
            <div style={{ flex: 1 }}>
                <label className="meta-label--mini" style={{ marginBottom: '0.3rem', display: 'block', fontWeight: '700', fontSize: '0.7rem', color: '#7A8C8E' }}>Minutos</label>
                <select 
                    value={m} 
                    onChange={e => setTime(h, e.target.value)}
                    className="input-clinical"
                    style={{ padding: '0 0.8rem', height: '48px', borderRadius: '12px', width: '100%', boxSizing: 'border-box', border: '1.5px solid #E2E8F0', background: '#F9FBFB', fontWeight: '600', color: '#1A2E35' }}
                >
                    {minutes.map(mn => <option key={mn} value={mn}>{mn} min</option>)}
                </select>
            </div>
        </div>
    );
};
