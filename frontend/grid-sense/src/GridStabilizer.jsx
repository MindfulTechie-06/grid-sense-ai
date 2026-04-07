import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./App.css";

const translations = {
  en: {
    lang: "English",
    title: "OPERATOR CONTROL PANEL",
    ui: {
      status: "STABILIZER STATUS",
      actions: "ACTION REQUIRED",
      limits: "CONTROL LIMITS",
      outcome: "EXPECTED OUTCOME",
      currentCondition: "CURRENT CONDITION",
      fieldAction: "ACTION FOR FIELD STAFF",
      history: "EVALUATION HISTORY",
      nextEval: "NEXT EVALUATION IN"
    },
    normal: {
      condition: "NORMAL",
      status: "STABILIZING / NOMINAL OPERATION",
      actions: ["Continue active monitoring, no immediate action required.", "System is stable.", "Run routine diagnostic check."],
      limits: "Voltage: 220V ± 5% | Freq: 50Hz ± 0.2Hz",
      outcome: "System fully stabilized. No active threats.",
      fieldAction: "No action required. System is stable."
    },
    fault: {
      condition: "FAULT",
      status: "HARMONIC_STRESS / FAULT DETECTED",
      actions: ["Deploy capacitors immediately.", "Reroute power to stabilize frequency.", "Check physical connections."],
      limits: "Boost voltage above 200V | Target Freq: 49.8Hz",
      outcome: "Voltage levels will return to nominal in 1-2 minutes.",
      fieldAction: "Reduce heavy load appliances in this area. Check transformer for overheating."
    },
    attack: {
      condition: "ATTACK",
      status: "CRITICAL_HEATING / ATTACK DETECTED",
      actions: ["Isolate sector instantly.", "Reduce load on Phase-B by 15%.", "Block unauthenticated grid commands."],
      limits: "Reduce current below 250A | Quarantine active",
      outcome: "Temperature will reduce in 10-15 minutes. Threat isolated.",
      fieldAction: "Check for unauthorized connections. Inform control center immediately."
    }
  },
  hi: {
    lang: "हिंदी (Hindi)",
    title: "ऑपरेटर नियंत्रण कक्ष",
    ui: {
      status: "स्टेबलाइजर स्थिति",
      actions: "आवश्यक कार्रवाई",
      limits: "नियंत्रण सीमा",
      outcome: "अपेक्षित परिणाम",
      currentCondition: "वर्तमान हालात",
      fieldAction: "फील्ड स्टाफ के लिए कार्रवाई",
      history: "मूल्यांकन इतिहास",
      nextEval: "अगला मूल्यांकन"
    },
    normal: {
      condition: "सामान्य",
      status: "स्थिर / सामान्य संचालन",
      actions: ["सक्रिय निगरानी जारी रखें, कोई तत्काल कार्रवाई की आवश्यकता नहीं है।", "सिस्टम स्थिर है।", "रूटीन डायग्नोस्टिक चेक चलाएं।"],
      limits: "वोल्टेज: 220V ± 5% | आवृत्ति: 50Hz ± 0.2Hz",
      outcome: "सिस्टम पूरी तरह से स्थिर है। कोई सक्रिय खतरा नहीं है।",
      fieldAction: "किसी कार्रवाई की आवश्यकता नहीं है। सिस्टम स्थिर है।"
    },
    fault: {
      condition: "त्रुटि",
      status: "हार्मोनिक तनाव / त्रुटि पाई गई",
      actions: ["घटते वोल्टेज को रोकने के लिए तुरंत कैपेसिटर तैनात करें।", "आवृत्ति को स्थिर करने के लिए बिजली को फिर से रूट करें।", "भौतिक कनेक्शन की जाँच करें।"],
      limits: "वोल्टेज को 200V से ऊपर बढ़ाएं | लक्ष्य आवृत्ति: 49.8Hz",
      outcome: "वोल्टेज का स्तर 1-2 मिनट में सामान्य हो जाएगा।",
      fieldAction: "इस क्षेत्र में भारी लोड वाले उपकरणों को कम करें। ट्रांसफार्मर की ओवरहीटिंग की जाँच करें।"
    },
    attack: {
      condition: "हमला",
      status: "गंभीर हीटिंग / संभावित साइबर हमला",
      actions: ["प्रभाव को फैलने से रोकने के लिए सेक्टर को तुरंत अलग करें।", "फेज-B पर लोड को 15% कम करें।", "अनधिकृत ग्रिड कमांड को ब्लॉक करें।"],
      limits: "करंट को 250A से कम करें | क्वारंटाइन सक्रिय",
      outcome: "तापमान 10-15 मिनट में कम हो जाएगा। खतरा अलग कर दिया गया है।",
      fieldAction: "अनधिकृत कनेक्शन की जाँच करें। नियंत्रक कक्ष को तुरंत सूचित करें।"
    }
  },
  bn: {
    lang: "বাংলা (Bengali)",
    title: "অপারেটর কন্ট্রোল প্যানেল",
    ui: {
      status: "স্টেবিলাইজার অবস্থা",
      actions: "প্রয়োজনীয় পদক্ষেপ",
      limits: "নিয়ন্ত্রণ সীমা",
      outcome: "প্রত্যাশিত ফলাফল",
      currentCondition: "বর্তমান পরিস্থিতি",
      fieldAction: "মাঠকর্মীদের জন্য পদক্ষেপ",
      history: "মূল্যায়ন ইতিহাস",
      nextEval: "পরবর্তী মূল্যায়ন"
    },
    normal: {
      condition: "স্বাভাবিক",
      status: "স্থিতিশীল / স্বাভাবিক কার্যকারিতা",
      actions: ["সক্রিয় পর্যবেক্ষণ চালিয়ে যান, কোনো তাৎক্ষণিক পদক্ষেপের প্রয়োজন নেই।", "সিস্টেম স্থিতিশীল।", "রুটিন ডায়াগনস্টিক চেক চালান।"],
      limits: "ভোল্টেজ: 220V ± 5% | ফ্রিকোয়েন্সি: 50Hz ± 0.2Hz",
      outcome: "সিস্টেম সম্পূর্ণ স্থিতিশীল। কোনো সক্রিয় হুমকি নেই।",
      fieldAction: "কোনো পদক্ষেপের প্রয়োজন নেই। সিস্টেম স্থিতিশীল।"
    },
    fault: {
      condition: "ত্রুটি",
      status: "হারমোনিক স্ট্রেস / ত্রুটি ধরা পড়েছে",
      actions: ["অবিলম্বে ক্যাপাসিটর স্থাপন করুন।", "ফ্রিকোয়েন্সি স্থিতিশীল করতে পাওয়ার পুনরায় রুট করুন।", "ভৌত সংযোগ পরীক্ষা করুন।"],
      limits: "ভোল্টেজ ২০০V এর উপরে বাড়ান | লক্ষ্য ফ্রিকোয়েন্সি: ৪৯.৮Hz",
      outcome: "ভোল্টেজ লেভেল ১-২ মিনিটের মধ্যে স্বাভাবিক অবস্থায় ফিরে আসবে।",
      fieldAction: "এই এলাকায় ভারী লোডের যন্ত্রপাতি হ্রাস করুন। অতিরিক্ত গরম হওয়ার জন্য ট্রান্সফরমার পরীক্ষা করুন।"
    },
    attack: {
      condition: "আক্রমণ",
      status: "সমালোচনামূলক উত্তাপ / সাইবার আক্রমণ",
      actions: ["অবিলম্বে সেক্টর বিচ্ছিন্ন করুন।", "ফেজ-B এর লোড ১৫% কমান।", "অননুমোদিত গ্রিড কমান্ড ব্লক করুন।"],
      limits: "কারেন্ট ২৫০A এর নিচে কমান | কোয়ারেন্টাইন সক্রিয়",
      outcome: "১০-১৫ মিনিটের মধ্যে তাপমাত্রা কমে যাবে। হুমকি বিচ্ছিন্ন করা হয়েছে।",
      fieldAction: "অননুমোদিত সংযোগের জন্য পরীক্ষা করুন। অবিলম্বে নিয়ন্ত্রণ কেন্দ্রকে জানান।"
    }
  },
  kn: {
    lang: "ಕನ್ನಡ (Kannada)",
    title: "ಆಪರೇಟರ್ ಕಂಟ್ರೋಲ್ ಪ್ಯಾನಲ್",
    ui: {
      status: "ಸ್ಟೆಬಿಲೈಸರ್ ಸ್ಥಿತಿ",
      actions: "ಅಗತ್ಯವಿರುವ ಕ್ರಮ",
      limits: "ನಿಯಂತ್ರಣ ಮಿತಿಗಳು",
      outcome: "ನಿರೀಕ್ಷಿತ ಫಲಿತಾಂಶ",
      currentCondition: "ಪ್ರಸ್ತುತ ಪರಿಸ್ಥಿತಿ",
      fieldAction: "ಕ್ಷೇತ್ರ ಸಿಬ್ಬಂದಿಗೆ ಕ್ರಮ",
      history: "ಮೌಲ್ಯಮಾಪನ ಇತಿಹಾಸ",
      nextEval: "ಮುಂದಿನ ಮೌಲ್ಯಮಾಪನ"
    },
    normal: {
      condition: "ಸಾಮಾನ್ಯ",
      status: "ಸ್ಥಿರ / ಸಾಮಾನ್ಯ ಕಾರ್ಯಾಚರಣೆ",
      actions: ["ಸಕ್ರಿಯ ಮೇಲ್ವಿಚಾರಣೆ ಮುಂದುವರಿಸಿ, ಯಾವುದೇ ತಕ್ಷಣದ ಕ್ರಮದ ಅಗತ್ಯವಿಲ್ಲ.", "ವ್ಯವಸ್ಥೆ ಸ್ಥಿರವಾಗಿದೆ.", "ವಾಡಿಕೆಯ ರೋಗನಿರ್ಣಯ ಪರೀಕ್ಷೆಯನ್ನು ಚಲಾಯಿಸಿ."],
      limits: "ವೋಲ್ಟೇಜ್: 220V ± 5% | ಆವರ್ತನ: 50Hz ± 0.2Hz",
      outcome: "ವ್ಯವಸ್ಥೆಯು ಸಂಪೂರ್ಣವಾಗಿ ಸ್ಥಿರವಾಗಿದೆ. ಯಾವುದೇ ಸಕ್ರಿಯ ಬೆದರಿಕೆ ಇಲ್ಲ.",
      fieldAction: "ಯಾವುದೇ ಕ್ರಮದ ಅಗತ್ಯವಿಲ್ಲ. ವ್ಯವಸ್ಥೆ ಸ್ಥಿರವಾಗಿದೆ."
    },
    fault: {
      condition: "ದೋಷ",
      status: "ಹಾರ್ಮೋನಿಕ್ ಒತ್ತಡ / ದೋಷ ಪತ್ತೆಯಾಗಿದೆ",
      actions: ["ತಕ್ಷಣ ಕೆಪಾಸಿಟರ್‌ಗಳನ್ನು ನಿಯೋಜಿಸಿ.", "ಆವರ್ತನವನ್ನು ಸ್ಥಿರಗೊಳಿಸಲು ಮಾರ್ಗ ಬದಲಾಯಿಸಿ.", "ಸಂಪರ್ಕಗಳನ್ನು ಪರಿಶೀಲಿಸಿ."],
      limits: "ವೋಲ್ಟೇಜ್ ಅನ್ನು 200V ಮೇಲೆ ಹೆಚ್ಚಿಸಿ | ಗುರಿ ಆವರ್ತನ: 49.8Hz",
      outcome: "ವೋಲ್ಟೇಜ್ ಮಟ್ಟಗಳು 1-2 ನಿಮಿಷಗಳಲ್ಲಿ ಸಹಜ ಸ್ಥಿತಿಗೆ ಮರಳುತ್ತವೆ.",
      fieldAction: "ಈ ಪ್ರದೇಶದಲ್ಲಿ ಹೆಚ್ಚಿನ ಭಾರದ ಉಪಕರಣಗಳನ್ನು ಕಡಿಮೆ ಮಾಡಿ. ಟ್ರಾನ್ಸ್ಫಾರ್ಮರ್ ತಾಪಮಾನವನ್ನು ಪರಿಶೀಲಿಸಿ."
    },
    attack: {
      condition: "ದಾಳಿ",
      status: "ನಿರ್ಣಾಯಕ ತಾಪಮಾನ / ಸೈಬರ್ ದಾಳಿ",
      actions: ["ತಕ್ಷಣ ವಲಯವನ್ನು ಪ್ರತ್ಯೇಕಿಸಿ.", "ಹಂತ-ಬಿ (Phase-B) ಮೇಲಿನ ಭಾರವನ್ನು 15% ರಷ್ಟು ಕಡಿಮೆ ಮಾಡಿ.", "ಅನಧಿಕೃತ ಕಮಾಂಡ್‌ಗಳನ್ನು ನಿರ್ಬಂಧಿಸಿ."],
      limits: "ಪ್ರವಾಹವನ್ನು 250A ಗಿಂತ ಕಡಿಮೆ ಮಾಡಿ | ಕ್ವಾರಂಟೈನ್ ಸಕ್ರಿಯವಾಗಿದೆ",
      outcome: "ತಾಪಮಾನ 10-15 ನಿಮಿಷಗಳಲ್ಲಿ ಕಡಿಮೆಯಾಗುತ್ತದೆ. ಬೆದರಿಕೆ ಪ್ರತ್ಯೇಕಿಸಲಾಗಿದೆ.",
      fieldAction: "ಅನಧಿಕೃತ ಸಂಪರ್ಕಗಳನ್ನು ಪರಿಶೀಲಿಸಿ. ತಕ್ಷಣ ನಿಯಂತ್ರಣ ಕೇಂದ್ರಕ್ಕೆ ತಿಳಿಸಿ."
    }
  }
};

export default function GridStabilizer() {
  const [lang, setLang] = useState('en');
  const [dataHistory, setDataHistory] = useState([]);
  const [countdown, setCountdown] = useState(120);
  const [flash, setFlash] = useState(false);
  const CYCLE_TIME = 120; // 2 minutes

  const evaluateCondition = () => {
    const rand = Math.random();
    let newState = 'normal';
    let v_rms = 220, i_rms = 100, thd = 2, entropy = 0.5, temp = 45;

    // Simulate varying conditions prioritizing stability initially, with random drift
    if (rand > 0.8) {
        newState = 'attack';
        v_rms = parseFloat((120 + Math.random() * 20).toFixed(1));
        i_rms = parseFloat((350 + Math.random() * 50).toFixed(1));
        thd = parseFloat((8 + Math.random() * 5).toFixed(1));
        entropy = parseFloat((0.05 + Math.random() * 0.04).toFixed(3));
        temp = parseFloat((85 + Math.random() * 10).toFixed(1));
    } else if (rand > 0.45) {
        newState = 'fault';
        v_rms = parseFloat((180 + Math.random() * 20).toFixed(1));
        i_rms = parseFloat((200 + Math.random() * 40).toFixed(1));
        thd = parseFloat((6 + Math.random() * 4).toFixed(1));
        entropy = parseFloat((0.5 + Math.random() * 0.2).toFixed(3));
        temp = parseFloat((65 + Math.random() * 10).toFixed(1));
    } else {
        newState = 'normal';
        v_rms = parseFloat((220 + Math.random() * 5).toFixed(1));
        i_rms = parseFloat((100 + Math.random() * 20).toFixed(1));
        thd = parseFloat((2 + Math.random() * 2).toFixed(1));
        entropy = parseFloat((0.2 + Math.random() * 0.1).toFixed(3));
        temp = parseFloat((45 + Math.random() * 5).toFixed(1));
    }

    setDataHistory(prev => {
        const updated = [...prev, { state: newState, v_rms, i_rms, thd, entropy, temp, time: new Date().toLocaleTimeString() }];
        return updated.length > 4 ? updated.slice(updated.length - 4) : updated;
    });

    setFlash(true);
    setTimeout(() => setFlash(false), 1000); // Visual flash timeout
  };

  useEffect(() => {
    // Initial Evaluation
    evaluateCondition();

    const timer = setInterval(() => {
      setCountdown(prev => {
         if (prev <= 1) {
            evaluateCondition();
            return CYCLE_TIME;
         }
         return prev - 1;
      });
    }, 1000); 

    return () => clearInterval(timer);
  }, []);

  const currentPt = dataHistory.length > 0 ? dataHistory[dataHistory.length - 1] : { state: "normal", v_rms: 220, i_rms: 100, thd: 2, entropy: 0.3, temp: 45 };
  const currentState = currentPt.state;
  
  const dict = translations[lang];
  const tState = dict[currentState];
  const ui = dict.ui;

  const stateColors = {
      normal: 'var(--neon-green)',
      fault: 'var(--neon-yellow)',
      attack: 'var(--neon-red)'
  };
  const activeColor = stateColors[currentState];

  return (
    <div className="dashboard-layout" style={{ overflowY: 'auto' }}>
      <aside className="sidebar" style={{ position: 'sticky', top: '1rem', alignSelf: 'flex-start' }}>
        <div className="brand">GRID 7.1</div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '20px', padding: '15px', background: 'rgba(0,170,255,0.1)', borderRadius: '8px', border: '1px solid rgba(0,170,255,0.4)', boxShadow: '0 0 15px rgba(0,170,255,0.1)' }}>
            <div style={{width:'50px', height:'50px', background:'rgba(0,170,255,0.2)', border:'2px solid var(--neon-blue)', borderRadius:'6px', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--neon-blue)', boxShadow: '0 0 15px var(--neon-blue)'}}>
              <span role="img" aria-label="operator" style={{fontSize: '1.8rem'}}>🥷</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{fontSize:'1.0rem', color:'#fff', fontWeight:900, letterSpacing: '1px', textShadow: '0 0 8px var(--neon-blue)'}}>GRID_CONTROLLER_ALPHA</div>
              <div style={{fontSize:'0.85rem', color:'var(--neon-blue)', fontWeight:700, letterSpacing: '2px'}}>ZONE_7G</div>
            </div>
        </div>

        <div style={{ marginTop: '40px', padding: '20px', background: 'rgba(20,25,40,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '1px', marginBottom: '10px' }}>{ui.nextEval}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
               <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--neon-blue)', textShadow: '0 0 10px rgba(0,170,255,0.5)', fontVariantNumeric: 'tabular-nums' }}>
                  {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
               </div>
               <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(countdown / CYCLE_TIME) * 100}%`, background: 'var(--neon-blue)', transition: 'width 1s linear' }}></div>
               </div>
            </div>
            
            <button 
                onClick={() => { setCountdown(CYCLE_TIME); evaluateCondition(); }}
                style={{ marginTop: '15px', width: '100%', background: 'rgba(0,170,255,0.1)', border: '1px solid var(--neon-blue)', color: 'var(--neon-blue)', padding: '8px', borderRadius: '4px', cursor: 'pointer', fontWeight: 700, transition: 'all 0.3s' }}
                onMouseOver={(e) => e.target.style.background = 'rgba(0,170,255,0.2)'}
                onMouseOut={(e) => e.target.style.background = 'rgba(0,170,255,0.1)'}
            >
               FORCE EVALUATION ⚡
            </button>
        </div>
      </aside>

      <main className="main-content" style={{ overflowY: 'visible', display: 'flex', flexDirection: 'column' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 20px', fontSize: '1.1rem', color: 'var(--text-muted)', fontWeight: 700, alignItems: 'center', background: 'rgba(0,0,0,0.2)', borderBottom: `1px solid rgba(0,170,255,0.1)` }}>
          <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
            <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', padding: '10px 15px', cursor: 'pointer', transition: 'all 0.3s' }} onMouseOver={e => {e.target.style.color='var(--text-main)'; e.target.style.textShadow='0 0 5px rgba(255,255,255,0.5)'}} onMouseOut={e => {e.target.style.color='var(--text-muted)'; e.target.style.textShadow='none'}}>TELEMETRY</Link>
            <Link to="/multi-agent" style={{ color: 'var(--text-muted)', textDecoration: 'none', padding: '10px 15px', cursor: 'pointer', transition: 'all 0.3s' }} onMouseOver={e => {e.target.style.color='var(--text-main)'; e.target.style.textShadow='0 0 5px rgba(255,255,255,0.5)'}} onMouseOut={e => {e.target.style.color='var(--text-muted)'; e.target.style.textShadow='none'}}>MULTI-AGENT</Link>
            <Link to="/grid-stabilizer" style={{ color: 'var(--neon-blue)', textDecoration: 'none', borderBottom: '3px solid var(--neon-blue)', padding: '10px 15px', cursor: 'pointer', textShadow: '0 0 8px var(--neon-blue)', boxShadow: 'inset 0 -15px 15px -15px var(--neon-blue)' }}>STABILIZER</Link>
          </div>
          <div style={{ display: 'flex', gap: '25px', alignItems: 'center' }}>
             
             <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.2rem' }}>🌐</span>
                <select 
                   value={lang} 
                   onChange={(e) => setLang(e.target.value)}
                   style={{
                       background: 'rgba(0,170,255,0.1)', color: 'var(--neon-blue)', border: '1px solid var(--neon-blue)', 
                       padding: '8px 12px', borderRadius: '4px', fontSize: '0.9rem', fontWeight: 'bold', 
                       cursor: 'pointer', outline: 'none', boxShadow: '0 0 10px rgba(0,170,255,0.2)'
                   }}
                >
                    <option value="en">English</option>
                    <option value="hi">हिंदी (Hindi)</option>
                    <option value="bn">বাংলা (Bengali)</option>
                    <option value="kn">ಕನ್ನಡ (Kannada)</option>
                </select>
             </div>
             
             <span style={{ color: 'var(--neon-blue)', fontSize: '1.4rem', cursor: 'pointer', transition: 'transform 0.2s', padding: '5px' }} onMouseOver={e => e.target.style.transform='rotate(45deg)'} onMouseOut={e => e.target.style.transform='rotate(0deg)'}>⚙️</span>
          </div>
        </div>

        <div style={{ paddingLeft: '10px', marginTop: '10px', marginBottom: '20px' }}>
           <h1 style={{ fontSize: '2.2rem', color: 'var(--neon-blue)', margin: 0, textShadow: '0 0 10px rgba(0,170,255,0.5)', textTransform: 'uppercase' }}>
              {dict.title}
           </h1>
           <h2 style={{ fontSize: '1rem', color: 'var(--text-muted)', margin: '5px 0 0 0', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>
              TIME-BASED DECISION ENGINE & FIELD INSTRUCTIONS
           </h2>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', flex: 1 }}>
           
           <div className="metric-card" style={{ flex: 1, minWidth: '400px', display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '2rem', background: flash ? `rgba(${currentState === 'attack' ? '255,51,102' : currentState === 'fault' ? '250,204,21' : '0,255,136'}, 0.15)` : 'rgba(20,25,40,0.5)', border: `2px solid ${activeColor}`, boxShadow: `inset 0 0 30px rgba(${currentState === 'attack' ? '255,51,102' : currentState === 'fault' ? '250,204,21' : '0,255,136'}, 0.1)`, transition: 'background 0.5s ease' }}>
              
              <div style={{ display: 'flex', gap: '20px' }}>
                  <div style={{ flex: 1, background: `rgba(${currentState === 'attack' ? '255,51,102' : currentState === 'fault' ? '250,204,21' : '0,255,136'}, 0.1)`, border: `2px solid ${activeColor}`, borderRadius: '8px', padding: '20px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxShadow: flash ? `0 0 20px ${activeColor}` : 'none', transition: 'box-shadow 0.5s ease' }}>
                    <div style={{ color: 'var(--text-main)', fontSize: '1rem', fontWeight: 800, letterSpacing: '2px', marginBottom: '10px', textTransform: 'uppercase' }}>
                        {ui.currentCondition}
                    </div>
                    <div style={{ fontSize: '3rem', color: activeColor, fontWeight: 900, textShadow: `0 0 15px ${activeColor}`, letterSpacing: '2px' }}>
                        {tState.condition}
                    </div>
                  </div>

                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '20px' }}>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '2px', marginBottom: '8px', textTransform: 'uppercase' }}>
                        {ui.status}
                      </div>
                      <div style={{ fontSize: '1.3rem', color: activeColor, fontWeight: 700, textShadow: `0 0 8px ${activeColor}` }}>
                        {tState.status}
                      </div>
                  </div>
              </div>

              <div style={{ background: 'rgba(0,170,255,0.05)', border: `2px solid var(--neon-blue)`, borderRadius: '8px', padding: '20px' }}>
                 <div style={{ color: 'var(--neon-blue)', fontSize: '1rem', fontWeight: 800, letterSpacing: '2px', marginBottom: '15px', textTransform: 'uppercase' }}>
                     {ui.fieldAction}
                 </div>
                 <div style={{ color: 'var(--text-main)', fontSize: '1.4rem', fontWeight: 600, lineHeight: '1.5', textShadow: '0 0 5px rgba(255,255,255,0.3)' }}>
                     {tState.fieldAction}
                 </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)', gap: '20px' }}>
                  <div style={{ background: 'rgba(0,0,0,0.3)', border: `1px solid ${activeColor}`, borderRadius: '6px', padding: '20px' }}>
                     <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 700, letterSpacing: '2px', marginBottom: '15px', textTransform: 'uppercase' }}>
                         {ui.actions}
                     </div>
                     <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text-main)', fontSize: '1.1rem', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {tState.actions.map((action, idx) => (
                            <li key={idx}><strong>{action}</strong></li>
                        ))}
                     </ul>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      <div style={{ flex: 1, background: 'rgba(0,170,255,0.03)', border: '1px dashed var(--neon-blue)', padding: '15px', borderRadius: '6px' }}>
                          <div style={{ color: 'var(--neon-blue)', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '1px', marginBottom: '8px', textTransform: 'uppercase' }}>{ui.limits}</div>
                          <div style={{ fontSize: '1rem', color: 'var(--text-main)', fontWeight: 600 }}>{tState.limits}</div>
                      </div>
                      <div style={{ flex: 1, background: 'rgba(0,255,136,0.03)', border: '1px dashed var(--neon-green)', padding: '15px', borderRadius: '6px' }}>
                          <div style={{ color: 'var(--neon-green)', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '1px', marginBottom: '8px', textTransform: 'uppercase' }}>{ui.outcome}</div>
                          <div style={{ fontSize: '1rem', color: 'var(--text-main)', fontWeight: 600 }}>{tState.outcome}</div>
                      </div>
                  </div>
              </div>

           </div>

           <div className="metric-card" style={{ flex: 0.3, minWidth: '250px', background: 'rgba(20,25,40,0.5)', border: '1px solid rgba(255,255,255,0.1)', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
               <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 700, letterSpacing: '2px', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px', textTransform: 'uppercase' }}>
                   {ui.history}
               </div>
               
               <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                   {dataHistory.slice().reverse().map((pt, idx) => {
                       const ptColor = stateColors[pt.state];
                       const ptDict = translations[lang][pt.state];
                       return (
                          <div key={idx} style={{ padding: '10px', background: 'rgba(0,0,0,0.3)', borderLeft: `4px solid ${ptColor}`, borderRadius: '4px', opacity: idx === 0 ? 1 : 0.6 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                 <span style={{ color: ptColor, fontWeight: 800, fontSize: '1rem' }}>{ptDict.condition}</span>
                                 <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{pt.time}</span>
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-main)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
                                 <span>V: {pt.v_rms}V</span>
                                 <span>I: {pt.i_rms}A</span>
                                 <span>THD: {pt.thd}%</span>
                                 <span>T: {pt.temp}°C</span>
                              </div>
                          </div>
                       );
                   })}
               </div>
           </div>

        </div>
      </main>
    </div>
  );
}
