import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./App.css";

export default function MultiAgent() {
  const [cloudCover, setCloudCover] = useState(false);
  const [highDemand, setHighDemand] = useState(false);
  const [logs, setLogs] = useState([
    "[SYS] Multi-Agent Orchestrator Initialized.",
    "🤖 Orchestrator → Distributed intelligence active.",
    "🏥 Hospital Agent → Protected load registered.",
  ]);

  const [activeStep, setActiveStep] = useState(0);

  const addLog = (msg) => {
    setLogs(prev => [msg, ...prev].slice(0, 50)); 
  };

  
  useEffect(() => {
    if (cloudCover) {
      addLog("☀️ Solar Agent → Output reduced due to cloud");
      addLog("🤖 Orchestrator → Initiating negotiation");
      setActiveStep(1);
      
      setTimeout(() => {
         addLog("🔋 Battery Agent → Providing backup power");
         setActiveStep(2);
      }, 1500);
      
    } else {
      if (!highDemand) setActiveStep(0);
      addLog("☀️ Solar Agent → Nominal Output Restored");
    }
  }, [cloudCover]);

  useEffect(() => {
    if (highDemand) {
      addLog("⚡ Transformer Agent → Alert: Grid constraint detected");
      addLog("🤖 Orchestrator → Initiating load shedding negotiation");
      setActiveStep(3);
      
      setTimeout(() => {
         addLog("🚗 EV Agent → Charging Paused to shed load");
         setActiveStep(4);
      }, 1500);
      
      setTimeout(() => {
         addLog("🏠 Residential Agent → Reducing non-essential load");
         setActiveStep(5);
      }, 3000);
      
      setTimeout(() => {
         addLog("🏥 Hospital Agent → Priority supply maintained");
      }, 4000);
      
    } else {
      if (!cloudCover) setActiveStep(0);
      addLog("⚡ Transformer Agent → Demand stabilized");
      setTimeout(() => addLog("🚗 EV Agent → Resuming optimal charging"), 1000);
      setTimeout(() => addLog("🏠 Residential Agent → Restoring full loads"), 2000);
    }
  }, [highDemand]);

  
  const isCloudy = cloudCover;
  const isStressed = highDemand;
  
  const solarState = isCloudy ? "↓ Output Reduced" : "↑ Nominal Generation";
  const batteryState = isStressed || isCloudy ? "→ Discharging 10kW" : "→ Standby";
  const evState = isStressed ? "→ Charging Paused" : "→ Optimal Charging";
  const residentialState = isStressed ? "→ Non-essential shed" : "→ Standard Load";
  const hospitalState = "→ Supply Maintained";

  return (
    <div className="dashboard-layout" style={{overflowY: 'auto'}}>
      {}
      <aside className="sidebar" style={{position:'sticky', top:'1rem', alignSelf:'flex-start'}}>
        <div className="brand">GRIDSENSE AI</div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '20px', padding: '15px', background: 'rgba(0,255,136,0.05)', borderRadius: '8px', border: '1px solid rgba(0,255,136,0.2)' }}>
            <div style={{width:'50px', height:'50px', background:'rgba(0,255,136,0.1)', border:'2px solid var(--neon-green)', borderRadius:'6px', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--neon-green)', boxShadow: '0 0 10px rgba(0,255,136,0.3)'}}>
              <span role="img" aria-label="operator" style={{fontSize: '1.8rem'}}>🥷</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{fontSize:'1.2rem', color:'var(--neon-green)', fontWeight:900, letterSpacing: '1px', textShadow: '0 0 5px var(--neon-green)'}}>OPERATOR_01</div>
              <div style={{fontSize:'0.85rem', color:'var(--text-muted)', fontWeight:600, letterSpacing: '2px'}}>SECTOR_7G</div>
            </div>
        </div>

        <div className="control-panel" style={{marginTop:'10px'}}>
          <div className="control-title">SIMULATION PANEL</div>
          
          <div className="attack-panel" style={{marginTop:'15px', background:'rgba(0,204,255,0.05)', borderColor:'rgba(0,204,255,0.2)'}}>
            <div style={{fontSize:'0.7rem', color:'var(--text-muted)', fontWeight:700, letterSpacing:'1px', marginBottom:'10px'}}>ENVIRONMENT</div>
            <label className="switch">
              <input type="checkbox" checked={cloudCover} onChange={(e) => setCloudCover(e.target.checked)} />
              <span className="slider"></span>
            </label>
            <div className="attack-title" style={{color: cloudCover ? 'var(--neon-blue)' : 'var(--text-muted)', textShadow: 'none', fontSize:'0.9rem'}}>
               CLOUD OVER SOLAR
            </div>
          </div>

          <div className="attack-panel" style={{marginTop:'15px', background:'rgba(255,51,102,0.05)', borderColor:'rgba(255,51,102,0.2)'}}>
            <div style={{fontSize:'0.7rem', color:'var(--text-muted)', fontWeight:700, letterSpacing:'1px', marginBottom:'10px'}}>GRID STRESS</div>
            <label className="switch">
              <input type="checkbox" checked={highDemand} onChange={(e) => setHighDemand(e.target.checked)} />
              <span className="slider"></span>
            </label>
            <div className="attack-title" style={{color: highDemand ? 'var(--neon-red)' : 'var(--text-muted)', textShadow: 'none', fontSize:'0.9rem'}}>
               HIGH DEMAND EVENT
            </div>
          </div>
        </div>
      </aside>

      {}
      <main className="main-content" style={{overflowY: 'visible'}}>
        
        {}
        <div style={{display:'flex', justifyContent:'space-between', padding:'10px 20px', fontSize:'1.1rem', color:'var(--text-muted)', fontWeight:700, alignItems:'center', background:'rgba(0,0,0,0.2)', borderBottom:'1px solid rgba(0,255,136,0.1)'}}>
          <div style={{display:'flex', gap:'40px', alignItems:'center'}}>
            <Link to="/" style={{color:'var(--text-muted)', textDecoration:'none', padding:'10px 15px', cursor:'pointer', transition:'all 0.3s'}} onMouseOver={e => {e.target.style.color='var(--text-main)'; e.target.style.textShadow='0 0 5px rgba(255,255,255,0.5)'}} onMouseOut={e => {e.target.style.color='var(--text-muted)'; e.target.style.textShadow='none'}}>TELEMETRY</Link>
            <Link to="/multi-agent" style={{color:'var(--neon-green)', textDecoration:'none', borderBottom:'3px solid var(--neon-green)', padding:'10px 15px', cursor:'pointer', textShadow:'0 0 8px var(--neon-green)', boxShadow:'inset 0 -15px 15px -15px var(--neon-green)'}}>MULTI-AGENT</Link>
            <Link to="/grid-stabilizer" style={{color:'var(--text-muted)', textDecoration:'none', padding:'10px 15px', cursor:'pointer', transition:'all 0.3s'}} onMouseOver={e => {e.target.style.color='var(--text-main)'; e.target.style.textShadow='0 0 5px rgba(255,255,255,0.5)'}} onMouseOut={e => {e.target.style.color='var(--text-muted)'; e.target.style.textShadow='none'}}>STABILIZER</Link>
            <span style={{padding:'10px 15px', cursor:'pointer', transition:'all 0.3s'}} onMouseOver={e => {e.target.style.color='var(--text-main)'; e.target.style.textShadow='0 0 5px rgba(255,255,255,0.5)'}} onMouseOut={e => {e.target.style.color='var(--text-muted)'; e.target.style.textShadow='none'}}>ALERTS</span>
          </div>
          <div style={{display:'flex', gap:'25px', color:'var(--neon-green)', fontSize:'1.4rem', cursor:'pointer'}}>
             <span style={{transition:'transform 0.2s', padding:'5px'}} onMouseOver={e => e.target.style.transform='rotate(45deg)'} onMouseOut={e => e.target.style.transform='rotate(0deg)'}>⚙️</span>
             <span style={{transition:'transform 0.2s', padding:'5px'}} onMouseOver={e => e.target.style.transform='scale(1.1)'} onMouseOut={e => e.target.style.transform='scale(1)'}>🔔</span>
          </div>
        </div>

        {}
        <div style={{paddingLeft: '10px', marginTop: '5px', marginBottom:'10px'}}>
           <h1 style={{fontSize:'2.2rem', color:'var(--neon-green)', margin:0, textShadow:'0 0 10px var(--neon-green-dim)', textTransform:'uppercase'}}>Multi-Agent Grid Orchestrator</h1>
           <h2 style={{fontSize:'1rem', color:'var(--text-muted)', margin:'5px 0 0 0', fontWeight:600, letterSpacing:'1px', textTransform:'uppercase'}}>Decentralized Autonomous Grid Intelligence</h2>
        </div>

        <div style={{display:'flex', gap:'1.5rem', flexWrap:'wrap', flex:1}}>
          
          {}
          <div style={{flex: 1.5, display:'flex', flexDirection:'column', gap:'1.5rem', minWidth:'400px'}}>
             
             {}
             <div className="chart-section" style={{flex:2, position:'relative', minHeight:'350px'}}>
               <div className="chart-title mb-4">SWARM TOPOLOGY (6-NODE NETWORK)</div>
               <div style={{position:'absolute', top:'2rem', left:0, right:0, bottom:0, display:'flex', alignItems:'center', justifyContent:'center'}}>
                   
                   {}
                   <svg width="100%" height="100%" style={{position:'absolute', zIndex:0}}>
                      {}
                      {}
                      <line x1="50%" y1="15%" x2="50%" y2="50%" stroke={cloudCover ? 'rgba(100,100,100,0.5)' : 'var(--neon-green)'} strokeWidth="3" strokeDasharray="5,5" className={activeStep===1 ? 'anim-line-svg' : (!cloudCover ? 'anim-line-svg' : '')}/>
                      {}
                      <line x1="85%" y1="35%" x2="50%" y2="50%" stroke={activeStep>=2 ? 'var(--neon-blue)' : 'rgba(100,100,100,0.5)'} strokeWidth="3" strokeDasharray="5,5" className={activeStep>=2 ? 'anim-line-svg' : ''}/>
                      {}
                      <line x1="80%" y1="75%" x2="50%" y2="50%" stroke={activeStep>=4 ? 'var(--neon-red)' : 'var(--neon-green)'} strokeWidth="3" strokeDasharray="5,5" className={activeStep>=4 ? 'anim-line-svg' : 'anim-line-svg'}/>
                      {}
                      <line x1="20%" y1="75%" x2="50%" y2="50%" stroke={activeStep>=5 ? 'var(--neon-red)' : 'var(--neon-green)'} strokeWidth="3" strokeDasharray="5,5" className={activeStep>=5 ? 'anim-line-svg' : 'anim-line-svg'}/>
                      {}
                      <line x1="15%" y1="35%" x2="50%" y2="50%" stroke={'var(--neon-green)'} strokeWidth="4" className={'anim-line-svg'}/>
                   </svg>
                   
                   {}
                   <div className={`agent-node ${cloudCover ? 'warning' : ''}`} style={{top: '15%', left: '50%', transform:'translate(-50%, -50%)', borderColor:activeStep===1?'var(--neon-red)':'var(--neon-green)'}}>
                      ☀️
                      <div style={{position:'absolute', bottom:'-25px', fontSize:'0.7rem', color:'var(--text-main)', whiteSpace:'nowrap', fontWeight:700}}>SOLAR AGENT</div>
                   </div>

                   {}
                   <div className={`agent-node ${activeStep>=2 ? 'discharging' : ''}`} style={{top: '35%', left: '85%', transform:'translate(-50%, -50%)'}}>
                      🔋
                      <div style={{position:'absolute', bottom:'-25px', fontSize:'0.7rem', color:'var(--text-main)', whiteSpace:'nowrap', fontWeight:700}}>BATTERY AGENT</div>
                   </div>

                   {}
                   <div className={`agent-node ${activeStep>=4 ? 'warning' : ''}`} style={{top: '75%', left: '80%', transform:'translate(-50%, -50%)', borderColor:activeStep>=4?'var(--neon-red)':'var(--neon-green)'}}>
                      🚗
                      <div style={{position:'absolute', bottom:'-25px', fontSize:'0.7rem', color:'var(--text-main)', whiteSpace:'nowrap', fontWeight:700}}>EV AGENT</div>
                   </div>

                   {}
                   <div className={`agent-node ${activeStep>=5 ? 'warning' : ''}`} style={{top: '75%', left: '20%', transform:'translate(-50%, -50%)', borderColor:activeStep>=5?'var(--neon-red)':'var(--neon-green)'}}>
                      🏠
                      <div style={{position:'absolute', bottom:'-25px', fontSize:'0.7rem', color:'var(--text-main)', whiteSpace:'nowrap', fontWeight:700}}>RESIDENTIAL AGENT</div>
                   </div>

                   {}
                   <div className={`agent-node`} style={{top: '35%', left: '15%', transform:'translate(-50%, -50%)', border:'3px solid var(--neon-green)', background:'rgba(0,255,136,0.2)', boxShadow:'0 0 20px var(--neon-green)'}}>
                      🏥
                      <div style={{position:'absolute', bottom:'-25px', fontSize:'0.7rem', color:'var(--text-main)', whiteSpace:'nowrap', fontWeight:700}}>HOSPITAL (CRITICAL)</div>
                   </div>

                   {}
                   <div className={`agent-node`} style={{top: '50%', left: '50%', transform:'translate(-50%, -50%)', borderColor:'var(--text-muted)', boxShadow:'none', background:'var(--bg-main)', zIndex:2, width:'80px', height:'80px', fontSize:'2.5rem'}}>
                      ⚡
                      <div style={{position:'absolute', bottom:'-28px', fontSize:'0.8rem', color:'var(--text-main)', whiteSpace:'nowrap', fontWeight:700, textShadow:'0 0 5px #000'}}>TRANSFORMER</div>
                   </div>
               </div>
             </div>

             {}
             <div className="metric-card" style={{padding:'1.5rem', background:'rgba(0,255,136,0.02)', borderLeft:'3px solid var(--neon-green)'}}>
               <div className="chart-title">HOW MULTI-AGENT SYSTEM WORKS</div>
               <p style={{fontSize:'0.85rem', color:'var(--text-main)', lineHeight:1.6, margin:0, marginTop:'10px'}}>
                 This system works like a smart neighborhood. Each agent makes local decisions and negotiates with others to maintain grid stability. Instead of a central controller, intelligence is distributed through priority queuing and consensus logic.
               </p>
             </div>

          </div>

          {}
          <div style={{flex: 1.5, display:'flex', flexDirection:'column', gap:'1.5rem', minWidth:'400px'}}>
             
             {}
             <div style={{display:'flex', gap:'1.5rem'}}>
                 
                 {}
                 <div className="metric-card" style={{flex:1, padding:'1.5rem', background:'rgba(0,0,0,0.2)'}}>
                    <div className="chart-title mb-2">DECISION PRIORITY ENGINE</div>
                    <div style={{display:'flex', flexDirection:'column', gap:'8px', marginTop:'10px'}}>
                       {[
                         {step:1, name:"1. Solar (Primary)", active: activeStep===1, color:'var(--neon-green)'},
                         {step:2, name:"2. Battery (Backup)", active: activeStep>=2, color:'var(--neon-blue)'},
                         {step:3, name:"3. EV Load Adj.", active: activeStep>=3 && activeStep<4, color:'var(--neon-green)'},
                         {step:4, name:"4. EV Shedding", active: activeStep>=4, color:'var(--neon-red)'},
                         {step:5, name:"5. Residential Shedding", active: activeStep>=5, color:'var(--neon-red)'},
                         {step:6, name:"6. Critical Load", active: activeStep>=1, color:'var(--neon-green)'} // Always protected if something happens
                       ].map((item, idx) => (
                           <div key={idx} style={{
                             padding:'8px 12px', 
                             background: item.active ? `rgba(${item.color==='var(--neon-red)'?'255,51,102':'0,255,136'},0.15)` : 'rgba(255,255,255,0.03)', 
                             borderLeft:`4px solid ${item.active ? item.color : 'rgba(255,255,255,0.1)'}`, 
                             color: item.active ? '#fff' : 'var(--text-muted)',
                             fontSize:'0.75rem', fontWeight:item.active?800:600,
                             transition: 'all 0.3s'
                           }}>
                              {item.name}
                           </div>
                       ))}
                    </div>
                 </div>

                 {}
                 <div className="metric-card" style={{flex:1.2, padding:'1.5rem'}}>
                    <div className="chart-title">AGENT DECISION STATE</div>
                    <div style={{display:'flex', flexDirection:'column', gap:'12px', marginTop:'10px'}}>
                       <div style={{background:'rgba(255,255,255,0.02)', padding:'10px', borderLeft:`3px solid ${isCloudy ? 'var(--neon-red)' : 'var(--neon-green)'}`, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                          <span style={{fontSize:'0.8rem', fontWeight:600}}>Solar Agent</span>
                          <span style={{fontSize:'0.75rem', fontWeight:700, color: isCloudy?'var(--neon-red)':'var(--neon-green)'}}>{solarState}</span>
                       </div>
                       <div style={{background:'rgba(255,255,255,0.02)', padding:'10px', borderLeft:`3px solid ${isStressed||isCloudy ? 'var(--neon-blue)' : 'var(--text-muted)'}`, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                          <span style={{fontSize:'0.8rem', fontWeight:600}}>Battery Agent</span>
                          <span style={{fontSize:'0.75rem', fontWeight:700, color: isStressed||isCloudy?'var(--neon-blue)':'var(--text-muted)'}}>{batteryState}</span>
                       </div>
                       <div style={{background:'rgba(255,255,255,0.02)', padding:'10px', borderLeft:`3px solid ${isStressed ? 'var(--neon-red)' : 'var(--neon-green)'}`, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                          <span style={{fontSize:'0.8rem', fontWeight:600}}>EV Agent</span>
                          <span style={{fontSize:'0.75rem', fontWeight:700, color: isStressed?'var(--neon-red)':'var(--neon-green)'}}>{evState}</span>
                       </div>
                       <div style={{background:'rgba(255,255,255,0.02)', padding:'10px', borderLeft:`3px solid ${isStressed ? 'var(--neon-red)' : 'var(--neon-green)'}`, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                          <span style={{fontSize:'0.8rem', fontWeight:600}}>Residential</span>
                          <span style={{fontSize:'0.75rem', fontWeight:700, color: isStressed?'var(--neon-red)':'var(--neon-green)'}}>{residentialState}</span>
                       </div>
                       <div style={{background:'rgba(255,255,255,0.02)', padding:'10px', borderLeft:`3px solid var(--neon-green)`, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                          <span style={{fontSize:'0.8rem', fontWeight:600}}>Hospital</span>
                          <span style={{fontSize:'0.75rem', fontWeight:700, color: 'var(--neon-green)'}}>{hospitalState}</span>
                       </div>
                    </div>
                 </div>

             </div>

             {} 
             <div className="metric-card" style={{flex:1, minHeight:'200px', padding:'1.5rem'}}>
                <div className="chart-title" style={{marginBottom:'15px'}}>LIVE SYSTEM LOG // DECISION TRAP</div>
                <div style={{display:'flex', flexDirection:'column', gap:'8px', height:'180px', overflowY:'auto', paddingRight:'5px'}}>
                   {logs.map((log, i) => (
                      <div key={i} style={{fontSize:'0.8rem', fontFamily:'monospace', color: i===0?'var(--text-main)':'var(--text-muted)', borderBottom:'1px solid rgba(255,255,255,0.05)', paddingBottom:'8px', opacity: Math.max(1 - (i*0.1), 0.3), transition:'opacity 0.3s'}}>
                         <span style={{color:'var(--neon-green)', marginRight:'10px'}}>{new Date().toLocaleTimeString()}</span>
                         {log}
                      </div>
                   ))}
                </div>
             </div>

          </div>
        </div>
      </main>
    </div>
  );
}
