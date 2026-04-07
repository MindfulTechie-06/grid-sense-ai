import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./App.css";

export default function GridNetwork() {
  const [networkData, setNetworkData] = useState({
    active_nodes: [],
    isolated_nodes: [],
    fault_node: null,
    impact: { isolated_houses: 0, active_houses: 0 }
  });
  const [resetting, setResetting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const isSimulatingRef = useRef(false);
  const simulatedNodeRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:8000/grid-network-status");
        let data = res.data;
        
        if (isSimulatingRef.current && simulatedNodeRef.current) {
             const simId = simulatedNodeRef.current;
             const allNodes = [...data.active_nodes, ...data.isolated_nodes];
             const updatedActive = allNodes.filter(n => n.node_id !== simId).map(n => ({...n, status: 'ACTIVE'}));
             const targetNode = allNodes.find(n => n.node_id === simId) || { node_id: simId, voltage: 145, entropy: 0.95, microgrid_id: 'MICROGRID_ALPHA' };
             const isolated = [{...targetNode, status: 'ISOLATED', entropy: 0.95, voltage: 145}];
             data = {
                 active_nodes: updatedActive,
                 isolated_nodes: isolated,
                 fault_node: simId,
                 impact: { active_houses: updatedActive.length * 416, isolated_houses: isolated.length * 416 }
             };
        }
        
        setNetworkData(data);
      } catch (e) {
        console.error("Failed to fetch grid network status", e);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 1000);
    return () => clearInterval(interval);
  }, []);

  const totalHouses = networkData.impact.active_houses + networkData.impact.isolated_houses;
  const activePercent = totalHouses === 0 ? 100 : ((networkData.impact.active_houses / totalHouses) * 100).toFixed(1);
  const faultNode = networkData.isolated_nodes.length > 0 ? networkData.isolated_nodes[0] : null;
  const systemSafe = !faultNode || faultNode.entropy < 0.6 || isSimulatingRef.current;

  // Microgrid logic
  const allNodesList = [...networkData.active_nodes, ...networkData.isolated_nodes].sort((a,b) => a.node_id.localeCompare(b.node_id));
  const microgrids = {
    "MICROGRID_ALPHA": [],
    "MICROGRID_BETA": [],
    "MICROGRID_GAMMA": [],
    "MICROGRID_DELTA": []
  };

  allNodesList.forEach(node => {
     if (node.microgrid_id && microgrids[node.microgrid_id]) {
        microgrids[node.microgrid_id].push(node);
     }
  });

  const affectedMicrogridId = faultNode ? faultNode.microgrid_id : null;
  const severityLevel = faultNode ? (faultNode.entropy > 0.8 ? "CRITICAL" : "MEDIUM") : "LOW";

  const handleReset = () => {
    isSimulatingRef.current = false;
    simulatedNodeRef.current = null;
    setResetting(true);
    setToastMessage("Grid restoring... Relays closing.");
    setTimeout(() => {
        setResetting(false);
        setToastMessage(null);
    }, 2000);
  };
  
  const handleSimulate = () => {
    isSimulatingRef.current = true;
    const all = [...networkData.active_nodes, ...networkData.isolated_nodes];
    if (all.length === 0) return;
    const target = all[Math.floor(Math.random() * all.length)];
    simulatedNodeRef.current = target.node_id;
    
    setToastMessage(`CRITICAL FAULT DETECTED: ${target.node_id.replace('_TRANSFORMER', '')}`);
    setTimeout(() => setToastMessage(null), 4000);
    
    setNetworkData(prev => {
        const updatedActive = all.filter(n => n.node_id !== target.node_id).map(n => ({...n, status: 'ACTIVE'}));
        return {
            active_nodes: updatedActive,
            isolated_nodes: [{...target, status: 'ISOLATED', entropy: 0.95, voltage: 145}],
            fault_node: target.node_id,
            impact: { active_houses: updatedActive.length * 416, isolated_houses: 416 }
        };
    });
  };

  return (
    <div className="dashboard-layout" style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      
      {/* GLOBAL NAVIGATION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 20px', fontSize: '1.1rem', color: 'var(--text-muted)', fontWeight: 700, alignItems: 'center', background: 'rgba(0,0,0,0.2)', borderBottom: `1px solid rgba(0,170,255,0.1)` }}>
        <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
          <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', padding: '10px 15px', cursor: 'pointer', transition: 'all 0.3s' }} onMouseOver={e => {e.target.style.color='var(--text-main)'; e.target.style.textShadow='0 0 5px rgba(255,255,255,0.5)'}} onMouseOut={e => {e.target.style.color='var(--text-muted)'; e.target.style.textShadow='none'}}>TELEMETRY</Link>
          <Link to="/multi-agent" style={{ color: 'var(--text-muted)', textDecoration: 'none', padding: '10px 15px', cursor: 'pointer', transition: 'all 0.3s' }} onMouseOver={e => {e.target.style.color='var(--text-main)'; e.target.style.textShadow='0 0 5px rgba(255,255,255,0.5)'}} onMouseOut={e => {e.target.style.color='var(--text-muted)'; e.target.style.textShadow='none'}}>MULTI-AGENT</Link>
          <Link to="/grid-stabilizer" style={{ color: 'var(--text-muted)', textDecoration: 'none', padding: '10px 15px', cursor: 'pointer', transition: 'all 0.3s' }} onMouseOver={e => {e.target.style.color='var(--text-main)'; e.target.style.textShadow='0 0 5px rgba(255,255,255,0.5)'}} onMouseOut={e => {e.target.style.color='var(--text-muted)'; e.target.style.textShadow='none'}}>STABILIZER</Link>
          <Link to="/grid-network" style={{ color: 'var(--neon-blue)', textDecoration: 'none', borderBottom: '3px solid var(--neon-blue)', padding: '10px 15px', cursor: 'pointer', textShadow: '0 0 8px var(--neon-blue)', boxShadow: 'inset 0 -15px 15px -15px var(--neon-blue)' }}>GRID NETWORK</Link>
        </div>
        <div style={{ display: 'flex', gap: '25px', color: 'var(--neon-blue)', fontSize: '1.4rem', cursor: 'pointer' }}>
           <span style={{ transition: 'transform 0.2s', padding: '5px' }} onMouseOver={e => e.target.style.transform='rotate(45deg)'} onMouseOut={e => e.target.style.transform='rotate(0deg)'}>⚙️</span>
           <span style={{ transition: 'transform 0.2s', padding: '5px' }} onMouseOver={e => e.target.style.transform='scale(1.1)'} onMouseOut={e => e.target.style.transform='scale(1)'}>🔔</span>
        </div>
      </div>

      {toastMessage && (
        <div style={{ position: 'fixed', top: '80px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(255,51,102,0.9)', color: '#fff', padding: '15px 30px', borderRadius: '8px', zIndex: 1000, fontWeight: 900, letterSpacing: '1px', boxShadow: '0 0 20px var(--neon-red)', animation: 'slideDown 0.5s ease-out' }}>
           ⚠ {toastMessage}
        </div>
      )}

      <div style={{ display: 'flex', flex: 1, padding: '20px', gap: '20px' }}>
         
         <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="chart-title">PRECISION ISLANDING TOPOLOGY MAP</div>
                <div style={{ display: 'flex', gap: '15px' }}>
                     <button onClick={handleSimulate} style={{ background: 'rgba(255,51,102,0.1)', border: '1px solid var(--neon-red)', color: 'var(--neon-red)', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 800, textShadow: '0 0 5px var(--neon-red)', transition: 'all 0.3s' }} onMouseOver={e => {e.target.style.background='rgba(255,51,102,0.3)'; e.target.style.boxShadow='0 0 10px var(--neon-red)'}} onMouseOut={e => {e.target.style.background='rgba(255,51,102,0.1)'; e.target.style.boxShadow='none'}}>
                       ⚡ SIMULATE FAULT
                     </button>
                     <button onClick={handleReset} style={{ background: 'rgba(0,255,136,0.1)', border: '1px solid var(--neon-green)', color: 'var(--neon-green)', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 800, textShadow: '0 0 5px var(--neon-green)', transition: 'all 0.3s' }} onMouseOver={e => {e.target.style.background='rgba(0,255,136,0.3)'; e.target.style.boxShadow='0 0 10px var(--neon-green)'}} onMouseOut={e => {e.target.style.background='rgba(0,255,136,0.1)'; e.target.style.boxShadow='none'}}>
                       🔄 RESTORE GRID
                     </button>
                </div>
            </div>
            
            <div style={{ flex: 1, background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', width: '100%' }}>
                    {Object.entries(microgrids).map(([mgId, nodes]) => {
                         const isAffected = mgId === affectedMicrogridId;
                         return (
                              <div key={mgId} style={{ 
                                   border: isAffected ? '2px solid #ff7700' : '1px dashed var(--border-color)',
                                   background: isAffected ? 'rgba(255,119,0,0.05)' : 'rgba(0,0,0,0.2)',
                                   padding: '20px', 
                                   borderRadius: '8px',
                                   boxShadow: isAffected ? '0 0 15px rgba(255,119,0,0.1)' : 'none',
                                   transition: 'all 0.3s'
                              }}>
                                   <div style={{ fontSize: '0.9rem', color: isAffected ? '#ff7700' : 'var(--text-muted)', marginBottom: '15px', fontWeight: 800, textShadow: isAffected ? '0 0 5px #ff7700' : 'none' }}>
                                        {mgId.replace('_', ' ')} {isAffected && '[ AFFECTED ]'}
                                   </div>
                                   <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                                        {nodes.map((node, i) => {
                                            const isIsolated = node.status === 'ISOLATED';
                                            const color = isIsolated ? 'var(--neon-red)' : 'var(--neon-green)';
                                            const bgParams = isIsolated ? '255,51,102' : '0,255,136';
                                            
                                            return (
                                               <div key={node.node_id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                                                  <div style={{
                                                    width: '50px', height: '50px', borderRadius: '50%',
                                                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                                                    border: `2px solid ${color}`,
                                                    background: `rgba(${bgParams}, 0.1)`,
                                                    boxShadow: isIsolated ? `0 0 20px rgba(${bgParams}, 0.8)` : `0 0 10px rgba(${bgParams}, 0.3)`,
                                                    transition: 'all 0.3s ease',
                                                    animation: isIsolated ? 'pulseRed 1.5s infinite' : 'none'
                                                  }}>
                                                    <span style={{ color: color, fontSize: '1rem', fontWeight: 900 }}>{node.node_id.replace('STREET_', '').replace('_TRANSFORMER', '')}</span>
                                                  </div>
                                                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, textAlign: 'center', minHeight: '30px' }}>
                                                     {node.node_id.replace('_TRANSFORMER', '')}
                                                  </div>
                                               </div>
                                            )
                                        })}
                                   </div>
                              </div>
                         )
                    })}
                </div>
            </div>

            <style>{`
                @keyframes pulseRed {
                   0% { box-shadow: 0 0 10px var(--neon-red); }
                   50% { box-shadow: 0 0 30px var(--neon-red); transform: scale(1.05); }
                   100% { box-shadow: 0 0 10px var(--neon-red); }
                }
                @keyframes slideDown {
                   from { top: -50px; opacity: 0; }
                   to { top: 80px; opacity: 1; }
                }
            `}</style>
         </div>

         <div style={{ flex: 1.2, display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="metric-card border-glow-blue" style={{ flex: 0.6, borderLeft: '3px solid var(--neon-blue)', padding: '1.5rem 2rem' }}>
               <div className="chart-title" style={{ marginBottom: '20px' }}>IMPACT METRICS</div>
               
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                     <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 800 }}>ACTIVE HOUSES</span>
                     <span style={{ fontSize: '2.5rem', color: 'var(--neon-green)', fontWeight: 900, textShadow: '0 0 10px var(--neon-green)' }}>{networkData.impact.active_houses}</span>
                  </div>
                  
                  <div style={{ width: '1px', background: 'var(--border-color)', height: '60px' }}></div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'flex-end' }}>
                     <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 800 }}>ISOLATED HOUSES</span>
                     <span style={{ fontSize: '2.5rem', color: faultNode ? 'var(--neon-red)' : 'var(--text-muted)', fontWeight: 900, textShadow: faultNode ? '0 0 10px var(--neon-red)' : 'none' }}>{networkData.impact.isolated_houses}</span>
                  </div>
               </div>

               <div style={{ marginTop: '30px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 700 }}>
                     <span style={{ color: 'var(--text-main)' }}>GRID OPERATIONAL CAPACITY</span>
                     <span style={{ color: faultNode ? 'var(--neon-yellow)' : 'var(--neon-green)' }}>{activePercent}% ONLINE</span>
                  </div>
                  <div style={{ height: '12px', width: '100%', borderRadius: '6px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                     <div style={{ height: '100%', width: `${activePercent}%`, background: 'var(--neon-green)', boxShadow: '0 0 10px var(--neon-green)', transition: 'width 0.5s ease' }}></div>
                  </div>
               </div>
            </div>

            <div className={`metric-card ${faultNode ? 'border-glow-red' : 'border-glow-green'}`} style={{ flex: 1, borderLeft: `3px solid ${faultNode ? 'var(--neon-red)' : 'var(--neon-green)'}`, padding: '2rem' }}>
               <div className="chart-title" style={{ color: faultNode ? 'var(--neon-red)' : 'var(--neon-green)' }}>FORENSIC EVENT REPORT</div>
               
               {faultNode ? (
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
                    <div style={{ padding: '15px', background: 'rgba(255,51,102,0.1)', border: '1px solid rgba(255,51,102,0.3)', borderRadius: '6px' }}>
                       <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>FAULTY NODE ID</div>
                       <div style={{ fontSize: '1.4rem', color: '#fff', fontWeight: 800, marginTop: '5px' }}>{faultNode.node_id}</div>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                       <div style={{ padding: '15px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ENTROPY VALUE</div>
                          <div style={{ fontSize: '1.2rem', color: 'var(--text-main)', fontWeight: 800, marginTop: '5px' }}>{faultNode.entropy.toFixed(3)}</div>
                       </div>
                       <div style={{ padding: '15px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>VOLTAGE OBSERVED</div>
                          <div style={{ fontSize: '1.2rem', color: faultNode.voltage < 180 ? 'var(--neon-red)' : 'var(--text-main)', fontWeight: 800, marginTop: '5px' }}>{faultNode.voltage.toFixed(1)} V</div>
                       </div>
                    </div>

                    <div style={{ padding: '15px', background: 'transparent', border: '1px dashed var(--neon-red)', borderRadius: '6px', textAlign: 'center' }}>
                       <div style={{ fontSize: '1.2rem', color: 'var(--neon-red)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', animation: 'blink 1.5s infinite' }}>[ LOCAL RELAY OPENED ]</div>
                       <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '5px' }}>Node decoupled to prevent cascade failure.</div>
                    </div>

                    {/* RAPID RESPONSE PANEL */}
                    <div style={{ marginTop: '5px', padding: '15px', border: '1px solid #ff7700', borderRadius: '6px', background: 'rgba(255,119,0,0.05)' }}>
                       <div style={{ fontSize: '0.9rem', color: '#ff7700', fontWeight: 800, marginBottom: '10px' }}>RAPID RESPONSE ACTIONS</div>
                       <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ padding: '8px 10px', background: 'rgba(0,0,0,0.3)', borderLeft: '3px solid #ff7700', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                              • Isolate transformer {faultNode.node_id.replace('_TRANSFORMER', '')}
                          </div>
                          <div style={{ padding: '8px 10px', background: 'rgba(0,0,0,0.3)', borderLeft: '3px solid #ff7700', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                              • Reduce load in <span style={{color:'#ff7700', fontWeight: 700}}>{affectedMicrogridId}</span> by 20%
                          </div>
                          <div style={{ padding: '8px 10px', background: 'rgba(0,0,0,0.3)', borderLeft: '3px solid #ff7700', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                              {faultNode.entropy > 0.9 ? "• Check unauthorized connections (ATTACK SUSPECTED)" : "• Inspect feeder line for voltage sag"}
                          </div>
                       </div>
                       <div style={{ marginTop: '15px', fontSize: '0.8rem', color: 'var(--neon-blue)', fontWeight: 700, textAlign: 'right' }}>
                          <span style={{ animation: 'blink 2s infinite' }}>⏱ EST. RESPONSE WINDOW: &lt; 2 MINUTES</span>
                       </div>
                    </div>
                    
                    <style>{`
                         @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } }
                    `}</style>

                    <button 
                       disabled={!systemSafe || resetting}
                       onClick={handleReset}
                       style={{ 
                          width: '100%', padding: '15px', marginTop: '10px', 
                          background: systemSafe && !resetting ? 'rgba(0,255,136,0.1)' : 'rgba(255,255,255,0.05)', 
                          border: `1px solid ${systemSafe && !resetting ? 'var(--neon-green)' : 'rgba(255,255,255,0.2)'}`, 
                          borderRadius: '6px', cursor: systemSafe && !resetting ? 'pointer' : 'not-allowed',
                          color: systemSafe && !resetting ? 'var(--neon-green)' : 'var(--text-muted)',
                          fontSize: '1rem', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase',
                          transition: 'all 0.3s'
                       }}>
                       {resetting ? 'Re-engaging Relay...' : (systemSafe ? 'REMOTE RESET ENABLED' : 'RESET DISABLED: SIGNAL UNSTABLE')}
                    </button>
                    
                 </div>
               ) : (
                 <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '20px', marginTop: '20px', flex: 1, minHeight: '300px' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(0,255,136,0.1)', border: '2px solid var(--neon-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px var(--neon-green)' }}>
                       <span style={{ fontSize: '2rem' }}>✓</span>
                     </div>
                    <div style={{ fontSize: '1.5rem', color: 'var(--neon-green)', fontWeight: 900, letterSpacing: '2px', textShadow: '0 0 10px var(--neon-green)' }}>SYSTEM NOMINAL</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', maxWidth: '300px' }}>
                        All sectors actively reporting clean sinewave metrics. No isolation deployed.<br/><br/>
                        <span style={{ color: 'var(--neon-green)' }}>100% components operational.</span>
                    </div>
                 </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
}
