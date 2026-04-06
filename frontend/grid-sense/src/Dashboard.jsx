import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
import { Link } from "react-router-dom";
import "./App.css";

export default function Dashboard() {
  const [streamData, setStreamData] = useState([]);
  const [waveData, setWaveData] = useState([]); 
  const [result, setResult] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeAlert, setActiveAlert] = useState(null); 

  
  const waveRef = useRef({ prevV: 230, prevF: 50, tick: 0 });

  
  useEffect(() => {
    const generatePoint = (prevPt) => {
        const rand = Math.random();
        let state = prevPt ? prevPt.state : 'normal';
        
       
        if (Math.random() < 0.12) {
            if (rand < 0.60) state = 'normal';
            else if (rand < 0.85) state = 'fault';
            else state = 'attack';
        }

        let voltage, current, frequency;
        
        
        if (state === 'normal') {
            voltage = 220 + Math.random() * 15;
            current = 4.0 + Math.random() * 2.0;
            frequency = 49.8 + Math.random() * 0.4;
        } else if (state === 'fault') {
            voltage = 180 + Math.random() * 30; 
            current = 6.0 + Math.random() * 3.0; 
            frequency = 48.0 + Math.random() * 1.0; 
        } else {
            voltage = 100 + Math.random() * 200; 
            current = 2.0 + Math.random() * 8.0; 
            frequency = 47.0 + Math.random() * 5.0; 
        }
        
        return {
            time: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 1 }),
            voltage: parseFloat(voltage.toFixed(2)),
            current: parseFloat(current.toFixed(2)),
            frequency: parseFloat(frequency.toFixed(2)),
            state: state
        };
    };

    const interval = setInterval(() => {
      setStreamData(prevData => {
        const previousPt = prevData.length > 0 ? prevData[prevData.length - 1] : null;
        const newPoint = generatePoint(previousPt);

        const updated = [...prevData, newPoint];
        if (updated.length > 20) return updated.slice(updated.length - 20);
        return updated;
      });
    }, 600); 
    return () => clearInterval(interval);
  }, []);

  
  useEffect(() => {
    if (streamData.length < 2) return;
    
    const previousState = streamData[streamData.length - 2].state;
    const currentState = streamData[streamData.length - 1].state;

    
    if (previousState !== currentState) {
       let msg = "";
       let alertType = "info";
       if (currentState === "fault") { msg = "⚠ Fault Detected in Grid"; alertType = "warning"; }
       else if (currentState === "attack") { msg = "🚨 Cyber Attack Detected"; alertType = "danger"; }
       else if (currentState === "normal") { msg = "✅ System Stabilized"; alertType = "success"; } 
       
       setActiveAlert({ msg, type: alertType });
       const timer = setTimeout(() => setActiveAlert(null), 3000);
       return () => clearTimeout(timer); 
    }
  }, [streamData]);

  
  useEffect(() => {
    const interval = setInterval(() => {
       const latest = streamData.length > 0 ? streamData[streamData.length - 1] : { voltage: 0, frequency: 50, current: 0, state: "normal" };

       
       const currentV = waveRef.current.prevV + (latest.voltage - waveRef.current.prevV) * 0.15;
       const currentF = waveRef.current.prevF + (latest.frequency - waveRef.current.prevF) * 0.15;

       waveRef.current.prevV = currentV;
       waveRef.current.prevF = currentF;

       setWaveData(prevWave => {
          const newPoints = [];
          for(let i=0; i<4; i++) {
              waveRef.current.tick += 1;
              const t = waveRef.current.tick * 0.05;
              
              
              const noiseMultiplier = latest.state === 'attack' ? 25 : (latest.state === 'fault' ? 4 : 0.5);
              const faultSag = latest.state === 'fault' ? (Math.sin(t*0.5)*25) : 0; // deep low freq sag for fault
              const noise = (Math.random() - 0.5) * (latest.current * 0.8) * noiseMultiplier; // violent spikes for attack
              
              const baseSignal = currentV * Math.sin(t * (currentF / 50)) + faultSag;
              newPoints.push({ time: t.toFixed(2), voltage: baseSignal + noise, blockState: latest.state });
          }
          const updated = [...prevWave, ...newPoints];
          if (updated.length > 180) return updated.slice(updated.length - 180);
          return updated;
       });
    }, 45);
    return () => clearInterval(interval);
  }, [streamData]);

  
  useEffect(() => {
    if (streamData.length < 2) return; 

  
    const voltageData = streamData.map(d => d.voltage);
    const currentData = streamData.map(d => d.current);
    const freqData = streamData[streamData.length - 1].frequency;

    const runAnalysis = async () => {
      try {
        const res = await axios.post("http://localhost:8000/analyze", {
          voltage: voltageData,
          current: currentData,
          frequency: freqData,
        });

        setResult(res.data);
      } catch (e) {
        
      }
    };
    
    
    if (streamData.length % 2 === 0) runAnalysis();
  }, [streamData]);

  
  const currentPt = streamData.length > 0 ? streamData[streamData.length - 1] : { voltage: 0, current: 0, frequency: 0, state: "normal" };
  const currentState = currentPt.state;

  
  const pqMetrics = {
    rmsVoltage: currentPt.voltage, 
    frequency: currentPt.frequency, 
    powerFactor: result?.analysis?.power_factor ?? 0.98,
    thd: currentState === 'attack' ? (35 + Math.random()*25) : currentState === 'fault' ? (8 + Math.random()*4) : (2 + Math.random()*0.5),
    pqIndex: currentState === 'attack' ? (30 + Math.random()*15) : currentState === 'fault' ? (75 + Math.random()*10) : (98 + Math.random()*1.5),
    entropy: result?.analysis?.entropy ?? 0.8842
  };

  const isUnstable = currentState !== "normal";
  const alertType = currentState === 'attack' ? "CRITICAL: SURGE DETECTED" : currentState === 'fault' ? "WARNING: VOLTAGE SAG" : "NOMINAL OPERATION";
  const decision = currentState === 'attack' ? "ISOLATE GRID SECTOR" : currentState === 'fault' ? "DEPLOY CAPACITORS" : "ACTIVE MONITORING";

  const getPqStatus = (val, thresholds) => {
    if (val >= thresholds.criticalMin && val <= thresholds.criticalMax) return 'critical';
    if (val >= thresholds.warningMin && val <= thresholds.warningMax) return 'warning';
    return 'normal';
  };

  const getPqText = (status) => status.charAt(0).toUpperCase() + status.slice(1);

  const volStatus = getPqStatus(pqMetrics.rmsVoltage, { warningMin: 180, warningMax: 219.9, criticalMin: 0, criticalMax: 179.9 });
  const freqStatus = getPqStatus(pqMetrics.frequency, { warningMin: 59.5, warningMax: 59.8, criticalMin: 0, criticalMax: 59.4 });
  const thdStatus = getPqStatus(pqMetrics.thd, { warningMin: 5.0, warningMax: 8.0, criticalMin: 8.1, criticalMax: 100 });
  const indexStatus = getPqStatus(pqMetrics.pqIndex, { warningMin: 70, warningMax: 89.9, criticalMin: 0, criticalMax: 69.9 });

  
  const statusDisplay = currentState === "attack" ? "CYBER ATTACK DETECTED" :
                        currentState === "fault" ? "FAULT DETECTED" :
                        "NORMAL OPERATION";
  
  const statusColor = currentState === "attack" ? "#ff3366" :
                      currentState === "fault" ? "#facc15" :
                      "#00aaff"; 

  const technicalLoss = Math.min((pqMetrics.thd * 0.4) + (currentPt.current * 0.5) + 2, 45); 
  const commercialLoss = Math.min((pqMetrics.entropy * 6) + (isUnstable ? 5 : 1), 35); 
  const totalLoss = technicalLoss + commercialLoss;

  const techLossWidth = (technicalLoss / Math.max(totalLoss, 1)) * 100;
  const commLossWidth = (commercialLoss / Math.max(totalLoss, 1)) * 100;

  return (
    <div className="dashboard-layout" style={{ display: 'flex', flexDirection: 'column' }}>
      
      {}
      <style>{`
        .popup-alert {
          position: fixed;
          top: 30px;
          right: 30px;
          padding: 15px 30px;
          border-radius: 8px;
          font-weight: 800;
          font-size: 1.15rem;
          letter-spacing: 1px;
          z-index: 10000;
          animation: slideInFade 0.3s ease-out forwards, fadeOut 0.3s ease-in 2.7s forwards;
          box-shadow: 0 8px 30px rgba(0,0,0,0.8);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .popup-warning {
          border: 1px solid var(--neon-yellow);
          background: rgba(250, 204, 21, 0.15);
          color: var(--neon-yellow);
        }
        .popup-danger {
          border: 1px solid var(--neon-red);
          background: rgba(255, 51, 102, 0.15);
          color: var(--neon-red);
        }
        .popup-success {
          border: 1px solid #00ff88;
          background: rgba(0, 255, 136, 0.15);
          color: #00ff88;
        }
        @keyframes slideInFade {
          from { opacity: 0; transform: translateY(-30px) translateX(30px); }
          to { opacity: 1; transform: translateY(0) translateX(0); }
        }
        @keyframes fadeOut {
          from { opacity: 1; transform: translateY(0); }
          to { opacity: 0; transform: translateY(-10px); }
        }
      `}</style>

      {}
      {activeAlert && (
        <div className={`popup-alert popup-${activeAlert.type}`}>
           {activeAlert.msg}
        </div>
      )}

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {}
        <aside className="sidebar">
          <div className="sidebar-header">
             <div className="brand">GRIDSENSE AI</div>
             <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
               ☰
             </button>
          </div>
          
          <div className={`sidebar-content ${isMobileMenuOpen ? 'open' : ''}`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '20px', padding: '15px', background: 'rgba(0,170,255,0.05)', borderRadius: '8px', border: '1px solid rgba(0,170,255,0.2)' }}>
                <div style={{width:'50px', height:'50px', background:'rgba(0,170,255,0.1)', border:'2px solid var(--neon-blue)', borderRadius:'6px', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--neon-blue)', boxShadow: '0 0 10px rgba(0,170,255,0.3)'}}>
                  <span role="img" aria-label="operator" style={{fontSize: '1.8rem'}}>🥷</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{fontSize:'1.2rem', color:'var(--neon-blue)', fontWeight:900, letterSpacing: '1px', textShadow: '0 0 5px var(--neon-blue)'}}>OPERATOR_01</div>
                  <div style={{fontSize:'0.85rem', color:'var(--text-muted)', fontWeight:600, letterSpacing: '2px'}}>SECTOR_7G</div>
                </div>
            </div>

            <div className="control-panel" style={{marginTop:'10px'}}>
              <div className="control-title" style={{color: 'var(--neon-blue)'}}>POWER QUALITY METRICS</div>
              
              <div className="pq-metric-card">
                 <div className="pq-info">
                    <span className="pq-label">RMS Voltage</span>
                    <span className="pq-val">{pqMetrics.rmsVoltage.toFixed(1)} V</span>
                 </div>
                 <div className="pq-status" style={{color: volStatus === 'critical' ? 'var(--neon-red)' : volStatus === 'warning' ? 'var(--neon-yellow)' : 'var(--text-muted)'}}>
                   {getPqText(volStatus)}
                   <div className={`indicator-dot dot-${volStatus}`}></div>
                 </div>
              </div>

              <div className="pq-metric-card">
                 <div className="pq-info">
                    <span className="pq-label">Frequency</span>
                    <span className="pq-val">{pqMetrics.frequency.toFixed(2)} Hz</span>
                 </div>
                 <div className="pq-status" style={{color: freqStatus === 'critical' ? 'var(--neon-red)' : freqStatus === 'warning' ? 'var(--neon-yellow)' : 'var(--text-muted)'}}>
                   {getPqText(freqStatus)}
                   <div className={`indicator-dot dot-${freqStatus}`}></div>
                 </div>
              </div>

              <div className="pq-metric-card">
                 <div className="pq-info">
                    <span className="pq-label">Power Factor (PF)</span>
                    <span className="pq-val">{pqMetrics.powerFactor.toFixed(2)}</span>
                 </div>
                 <div className="pq-status" style={{color: currentState !== 'normal' ? 'var(--neon-yellow)' : 'var(--text-muted)'}}>
                   {currentState !== 'normal' ? 'Irregular' : 'Normal'}
                   <div className={`indicator-dot ${currentState !== 'normal' ? 'dot-warning' : 'dot-normal'}`}></div>
                 </div>
              </div>

              <div className="pq-metric-card">
                 <div className="pq-info">
                    <span className="pq-label">THD Level</span>
                    <span className="pq-val">{pqMetrics.thd.toFixed(1)} %</span>
                 </div>
                 <div className="pq-status" style={{color: thdStatus === 'critical' ? 'var(--neon-red)' : thdStatus === 'warning' ? 'var(--neon-yellow)' : 'var(--text-muted)'}}>
                   {getPqText(thdStatus)}
                   <div className={`indicator-dot dot-${thdStatus}`}></div>
                 </div>
              </div>

              <div className="pq-metric-card">
                 <div className="pq-info">
                    <span className="pq-label">PQ Matrix Index</span>
                    <span className="pq-val">{pqMetrics.pqIndex.toFixed(1)}</span>
                 </div>
                 <div className="pq-status" style={{color: indexStatus === 'critical' ? 'var(--neon-red)' : indexStatus === 'warning' ? 'var(--neon-yellow)' : 'var(--text-muted)'}}>
                   {getPqText(indexStatus)}
                   <div className={`indicator-dot dot-${indexStatus}`}></div>
                 </div>
              </div>
            </div>
          </div>
        </aside>

        {}
        <main className="main-content">
          
          {}
          <div style={{display:'flex', justifyContent:'space-between', padding:'10px 20px', fontSize:'1.1rem', color:'var(--text-muted)', fontWeight:700, alignItems:'center', background:'rgba(0,0,0,0.2)', borderBottom:'1px solid rgba(0,170,255,0.1)'}}>
            <div style={{display:'flex', gap:'40px', alignItems:'center'}}>
              <Link to="/" style={{color:'var(--neon-blue)', textDecoration:'none', borderBottom:'3px solid var(--neon-blue)', padding:'10px 15px', cursor:'pointer', textShadow:'0 0 8px var(--neon-blue)', boxShadow:'inset 0 -15px 15px -15px var(--neon-blue)'}}>TELEMETRY</Link>
              <Link to="/multi-agent" style={{color:'var(--text-muted)', textDecoration:'none', padding:'10px 15px', cursor:'pointer', transition:'all 0.3s'}} onMouseOver={e => {e.target.style.color='var(--text-main)'; e.target.style.textShadow='0 0 5px rgba(255,255,255,0.5)'}} onMouseOut={e => {e.target.style.color='var(--text-muted)'; e.target.style.textShadow='none'}}>MULTI-AGENT</Link>
              <span style={{padding:'10px 15px', cursor:'pointer', transition:'all 0.3s'}} onMouseOver={e => {e.target.style.color='var(--text-main)'; e.target.style.textShadow='0 0 5px rgba(255,255,255,0.5)'}} onMouseOut={e => {e.target.style.color='var(--text-muted)'; e.target.style.textShadow='none'}}>NETWORK</span>
              <span style={{padding:'10px 15px', cursor:'pointer', transition:'all 0.3s'}} onMouseOver={e => {e.target.style.color='var(--text-main)'; e.target.style.textShadow='0 0 5px rgba(255,255,255,0.5)'}} onMouseOut={e => {e.target.style.color='var(--text-muted)'; e.target.style.textShadow='none'}}>ALERTS</span>
            </div>
            <div style={{display:'flex', gap:'25px', color:'var(--neon-blue)', fontSize:'1.4rem', cursor:'pointer'}}>
               <span style={{transition:'transform 0.2s', padding:'5px'}} onMouseOver={e => e.target.style.transform='rotate(45deg)'} onMouseOut={e => e.target.style.transform='rotate(0deg)'}>⚙️</span>
               <span style={{transition:'transform 0.2s', padding:'5px'}} onMouseOver={e => e.target.style.transform='scale(1.1)'} onMouseOut={e => e.target.style.transform='scale(1)'}>🔔</span>
            </div>
          </div>

          <div className="center-top">
            {}
            <div className="chart-section" style={{ position: 'relative' }}>
              <div className="chart-title">
                LIVE SEQUENCE: HIGH-ENTROPY STOCHASTIC GENERATION
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-start', marginTop: '6px' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <div style={{ width: '8px', height: '8px', background: '#00aaff', borderRadius: '50%', boxShadow: '0 0 5px #00aaff' }}></div>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>NORMAL</span>
                   </div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <div style={{ width: '8px', height: '8px', background: '#facc15', borderRadius: '50%', boxShadow: '0 0 5px #facc15' }}></div>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>FAULT</span>
                   </div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <div style={{ width: '8px', height: '8px', background: '#ff3366', borderRadius: '50%', boxShadow: '0 0 5px #ff3366' }}></div>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>ATTACK</span>
                   </div>
                </div>
              </div>
              
              <div className="chart-bg" style={{ position: 'relative', overflow: 'hidden' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={waveData}>
                    <defs>
                      <linearGradient id="waveFadeSplit" x1="0" y1="0" x2="1" y2="0">
                        {waveData.map((d, index) => {
                           const offsetStr = `${(index / Math.max(1, waveData.length - 1)) * 100}%`;
                           const colorCode = d.blockState === 'attack' ? '#ff3366' : d.blockState === 'fault' ? '#facc15' : '#00aaff';
                           
                           
                           const fadeZone = waveData.length * 0.15;
                           const alpha = index < fadeZone ? (index / fadeZone) : 1;
                           
                           return <stop key={index} offset={offsetStr} stopColor={colorCode} stopOpacity={alpha} />
                        })}
                      </linearGradient>
                    </defs>
                    
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.08)" vertical={true} horizontal={true} />
                    <YAxis domain={[-350, 350]} hide={false} stroke="var(--text-muted)" tick={{fontSize: 10}} tickLine={false} axisLine={false} />
                    <XAxis dataKey="time" hide={true} />
                    
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(5,15,20,0.9)', border: `1px solid ${statusColor}`, color: '#fff', borderRadius: '4px' }}
                      itemStyle={{ color: statusColor, fontWeight: 'bold' }}
                      labelStyle={{ color: 'var(--text-muted)' }}
                      formatter={(value) => [`${value.toFixed(2)}V`, 'Inst. Voltage']}
                      labelFormatter={() => `Real-time Scan`}
                    />

                    <Line 
                      type="monotone" 
                      dataKey="voltage" 
                      stroke="url(#waveFadeSplit)" 
                      strokeWidth={2.8} 
                      dot={false} 
                      isAnimationActive={false} 
                      style={{filter: `drop-shadow(0 0 6px ${statusColor})`}}
                    />
                  </LineChart>
                </ResponsiveContainer>

                <div style={{position:'absolute', top:'50%', left:'50%', transform:'translate(-50%, -50%)', fontSize:'clamp(1.5rem, 3.5vw, 3.5rem)', color:'rgba(255,255,255,0.04)', fontWeight:900, pointerEvents:'none', letterSpacing:'15px', textAlign:'center', zIndex: 0}}>
                  {statusDisplay}
                </div>
              </div>
              
            </div>

            {}
            <div className="metrics-section" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1.2 }}>
               {}
               <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '10px' }}>
                 <div className="metric-card border-glow-blue" style={{ padding: '1rem', minHeight: '100px', borderLeft: `3px solid var(--neon-blue)` }}>
                   <div className="metric-label" style={{ fontSize: '0.75rem' }}>ENTROPY SCORE</div>
                   <div className="metric-val" style={{ fontSize: '1.8rem', marginTop: '5px' }}>{typeof pqMetrics.entropy === 'number' ? pqMetrics.entropy.toFixed(4) : "0.0000"}</div>
                 </div>

                 <div className={`metric-card border-glow-${currentState==='attack' ? 'red' : currentState==='fault' ? 'yellow' : 'blue'}`} style={{ padding: '1rem', minHeight: '100px', borderLeft: `3px solid ${statusColor}` }}>
                   <div className="metric-label" style={{ fontSize: '0.75rem' }}>FREQ. STATUS</div>
                   <div className="metric-val" style={{ fontSize: '1.4rem', marginTop: '5px', color: isUnstable ? 'var(--neon-red)' : 'var(--text-main)' }}>
                      {isUnstable ? "UNSTABLE" : "STABLE"}
                   </div>
                 </div>

                 <div className={`metric-card border-glow-${currentState==='attack' ? 'red' : currentState==='fault' ? 'yellow' : 'blue'}`} style={{ padding: '1rem', minHeight: '100px', borderLeft: `3px solid ${statusColor}` }}>
                   <div className="metric-label" style={{ fontSize: '0.75rem' }}>ALERT TYPE</div>
                   <div className="metric-val" style={{ fontSize: '1rem', marginTop: '10px', color: statusColor, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{alertType}</div>
                 </div>

                 <div className={`metric-card border-glow-${currentState==='attack' ? 'red' : currentState==='fault' ? 'yellow' : 'blue'}`} style={{ padding: '1rem', minHeight: '100px', background: currentState==='attack' ? 'rgba(255, 51, 102, 0.02)' : currentState==='fault' ? 'rgba(250, 204, 21, 0.02)' : 'rgba(0,170,255,0.02)', borderLeft: `3px solid ${statusColor}` }}>
                   <div className="metric-label" style={{ fontSize: '0.75rem' }}>AI DECISION</div>
                   <div className="metric-val" style={{ fontSize: '1.1rem', marginTop: '10px' }}>{decision}</div>
                 </div>
               </div>

               {}
               <div className="metric-card" style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', background: 'rgba(20, 25, 40, 0.4)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)', minHeight: '220px' }}>
                  <div className="chart-title" style={{ marginBottom: '15px' }}>AT&C LOSS ATTRIBUTION</div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '15px', marginBottom: '20px' }}>
                     <div style={{ background: 'rgba(255, 51, 102, 0.05)', border: '1px solid rgba(255, 51, 102, 0.2)', padding: '15px', borderRadius: '6px', textAlign: 'center', boxShadow: '0 0 10px rgba(255, 51, 102, 0.1)' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Technical Loss</div>
                        <div style={{ fontSize: '2.2rem', color: 'var(--neon-red)', fontWeight: 800, margin: '5px 0', textShadow: '0 0 8px rgba(255, 51, 102, 0.5)' }}>{technicalLoss.toFixed(1)}%</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Heat / Harmonic Loss</div>
                     </div>
                     
                     <div style={{ background: 'rgba(250, 204, 21, 0.05)', border: '1px solid rgba(250, 204, 21, 0.2)', padding: '15px', borderRadius: '6px', textAlign: 'center', boxShadow: '0 0 10px rgba(250, 204, 21, 0.1)' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Commercial Loss</div>
                        <div style={{ fontSize: '2.2rem', color: 'var(--neon-yellow)', fontWeight: 800, margin: '5px 0', textShadow: '0 0 8px rgba(250, 204, 21, 0.5)' }}>{commercialLoss.toFixed(1)}%</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Theft / Unmetered Usage</div>
                     </div>
                  </div>

                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 700 }}>
                        <span style={{ color: 'var(--text-main)' }}>Total Aggregate Loss: {totalLoss.toFixed(1)}%</span>
                        <span style={{ color: 'var(--text-muted)' }}>100% SCALE</span>
                     </div>
                     <div style={{ height: '12px', display: 'flex', width: '100%', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border-color)', background: 'var(--bg-main)' }}>
                        <div style={{ width: `${techLossWidth}%`, background: 'var(--neon-red)', boxShadow: '0 0 10px var(--neon-red)', transition: 'width 0.3s' }}></div>
                        <div style={{ width: `${commLossWidth}%`, background: 'var(--neon-yellow)', boxShadow: '0 0 10px var(--neon-yellow)', transition: 'width 0.3s' }}></div>
                     </div>
                  </div>
               </div>
            </div>
          </div>

          {}
          <div className="bottom-alerts">
            <div className="alert-card">
              <div className={`alert-icon ${currentState==='fault' ? 'icon-red' : 'icon-blue'}`} style={{color: currentState==='fault'? 'var(--neon-red)' : 'var(--neon-blue)'}}>⚡</div>
              <div>
                <div className="alert-text-title" style={{color: currentState==='fault' ? 'var(--neon-red)' : 'var(--neon-blue)'}}>VOLTAGE INSTABILITY</div>
                <div className="alert-text-sub">{currentState==='fault' ? 'DIPS DETECTED IN FEED' : 'ZERO OCCURRENCES IN STREAM'}</div>
              </div>
            </div>

            <div className="alert-card">
              <div className={`alert-icon ${currentState==='attack' ? 'icon-red' : 'icon-blue'}`}>{currentState==='normal' ? '✓' : '⚠️'}</div>
              <div>
                <div className="alert-text-title" style={{color: currentState==='attack' ? 'var(--neon-red)' : 'var(--text-main)'}}>FREQUENCY ANOMALY</div>
                <div className="alert-text-sub">{currentState==='attack' ? 'PATTERN: RAPID SPIKE/DROP' : 'NORMAL RANGE REGISTRATIONS'}</div>
              </div>
            </div>

            <div className="alert-card">
               <div className={`alert-icon ${currentState==='attack' ? 'icon-red' : 'icon-blue'}`}>∿</div>
              <div>
                <div className="alert-text-title" style={{color: currentState==='attack' ? 'var(--neon-red)' : 'var(--neon-blue)'}}>NOISE SPIKE</div>
                <div className="alert-text-sub">{currentState==='attack' ? 'HIGH BROADBAND INTERFERENCE' : 'BROADBAND INTERFERENCE NORMAL'}</div>
              </div>
            </div>
          </div>
        </main>
      </div>
      
      {}
      <div style={{ borderTop: `1px dashed ${statusColor}`, background: 'rgba(5, 5, 10, 0.95)', padding: '8px 20px', fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', zIndex: 100, position: 'relative' }}>
         <div>
            <span style={{color: statusColor, fontWeight: 'bold'}}>[STATE: {currentState.toUpperCase()}]</span> 
            <span style={{margin: '0 10px'}}>|</span> 
            [VOLTAGE: <span style={{color:'#fff'}}>{currentPt.voltage.toFixed(2)} V</span>] 
            <span style={{margin: '0 10px'}}>|</span> 
            [FREQ: <span style={{color:'#fff'}}>{currentPt.frequency.toFixed(2)} Hz</span>] 
            <span style={{margin: '0 10px'}}>|</span> 
            [CURRENT: <span style={{color:'#fff'}}>{currentPt.current.toFixed(2)} A</span>] 
         </div>
         <div>[FLUID STOCHASTIC TIDE - INFINITE LOOP]</div>
      </div>

    </div>
  );
}