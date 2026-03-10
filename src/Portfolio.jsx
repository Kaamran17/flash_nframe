import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

// ─── PASTE YOUR KEYS HERE ────────────────────────────────────
const SUPABASE_URL     = "https://jibynxmzswsjhqigaywd.supabase.co";
const SUPABASE_ANON    = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppYnlueG16c3dzamhxaWdheXdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNzM1NjcsImV4cCI6MjA4ODY0OTU2N30.UH4rZSI4dwbtLHNcxJ0_4QgEeRpqDbzKLX8INE285TM";

// ─────────────────────────────────────────────────────────────

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);
const TAGS = ["All", "Street", "Portrait", "Night", "Nature"];

/* ── CUSTOM CURSOR ──────────────────────────────────────────── */
function Cursor() {
  const dot  = useRef(null);
  const ring = useRef(null);
  const pos  = useRef({ x: 0, y: 0 });
  const rpos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const move = (e) => { pos.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener("mousemove", move);
    let raf;
    const loop = () => {
      rpos.current.x += (pos.current.x - rpos.current.x) * 0.12;
      rpos.current.y += (pos.current.y - rpos.current.y) * 0.12;
      if (dot.current)  dot.current.style.transform  = `translate(${pos.current.x}px,${pos.current.y}px)`;
      if (ring.current) ring.current.style.transform = `translate(${rpos.current.x}px,${rpos.current.y}px)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { window.removeEventListener("mousemove", move); cancelAnimationFrame(raf); };
  }, []);

  return (
    <>
      <div ref={dot}  style={{ position:"fixed",top:"-4px",left:"-4px",width:"8px",height:"8px",borderRadius:"50%",background:"#fff",pointerEvents:"none",zIndex:9999,mixBlendMode:"difference" }} />
      <div ref={ring} style={{ position:"fixed",top:"-18px",left:"-18px",width:"36px",height:"36px",borderRadius:"50%",border:"1px solid rgba(255,255,255,0.6)",pointerEvents:"none",zIndex:9998,mixBlendMode:"difference",transition:"width .25s,height .25s" }} />
    </>
  );
}

/* ── LIGHTBOX ───────────────────────────────────────────────── */
function Lightbox({ photo, photos, onClose, onNav }) {
  const idx = photos.findIndex(p => p.id === photo.id);
  useEffect(() => {
    const fn = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNav(1);
      if (e.key === "ArrowLeft")  onNav(-1);
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose, onNav]);

  return (
    <div onClick={onClose} style={{ position:"fixed",inset:0,zIndex:500,background:"rgba(0,0,0,0.96)",display:"flex",alignItems:"center",justifyContent:"center",animation:"fadeIn .2s ease" }}>
      <button onClick={e=>{e.stopPropagation();onNav(-1);}} style={arrowBtn("left")}>&#8592;</button>
      <div onClick={e=>e.stopPropagation()} style={{ position:"relative",maxWidth:"88vw",maxHeight:"88vh" }}>
        <img src={photo.url} alt={photo.title} style={{ maxWidth:"88vw",maxHeight:"80vh",objectFit:"contain",display:"block" }} />
        <div style={{ position:"absolute",bottom:0,left:0,right:0,padding:"20px 24px",background:"linear-gradient(transparent,rgba(0,0,0,0.85))",display:"flex",justifyContent:"space-between",alignItems:"flex-end" }}>
          <div>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:"1.3rem",letterSpacing:"0.08em",color:"#fff" }}>{photo.title}</div>
            <div style={{ fontFamily:"'DM Mono',monospace",fontSize:"0.6rem",color:"rgba(255,255,255,0.4)",letterSpacing:"0.2em",textTransform:"uppercase",marginTop:"4px" }}>
              {idx+1} / {photos.length} · {photo.tag}
            </div>
          </div>
          <span style={{ fontFamily:"'DM Mono',monospace",fontSize:"0.6rem",color:"rgba(255,255,255,0.3)",letterSpacing:"0.1em" }}>@flash_nframe</span>
        </div>
      </div>
      <button onClick={e=>{e.stopPropagation();onNav(1);}} style={arrowBtn("right")}>&#8594;</button>
      <button onClick={onClose} style={{ position:"absolute",top:"20px",right:"28px",background:"none",border:"none",color:"rgba(255,255,255,0.5)",fontSize:"1.8rem",cursor:"pointer" }}>✕</button>
    </div>
  );
}
const arrowBtn = (side) => ({ position:"absolute",[side]:"16px",background:"none",border:"1px solid rgba(255,255,255,0.15)",color:"rgba(255,255,255,0.5)",width:"44px",height:"44px",fontSize:"1.2rem",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" });

/* ── PHOTO CARD ─────────────────────────────────────────────── */
function PhotoCard({ photo, index, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ breakInside:"avoid",marginBottom:"10px",position:"relative",overflow:"hidden",cursor:"none",animation:`slideUp .6s ${index*.07}s both` }}>
      <img src={photo.url} alt={photo.title} loading="lazy"
        style={{ width:"100%",display:"block",transition:"transform .6s cubic-bezier(.4,0,.2,1),filter .4s",transform:hov?"scale(1.04)":"scale(1)",filter:hov?"brightness(.65) contrast(1.15)":"brightness(.88) contrast(1.05)" }} />
      <div style={{ position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,.8) 0%,transparent 55%)",opacity:hov?1:0,transition:"opacity .35s",display:"flex",flexDirection:"column",justifyContent:"flex-end",padding:"20px 18px" }}>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:"1.15rem",letterSpacing:"0.08em",color:"#fff" }}>{photo.title}</div>
        <div style={{ fontFamily:"'DM Mono',monospace",fontSize:"0.55rem",letterSpacing:"0.2em",color:"rgba(255,255,255,0.45)",textTransform:"uppercase",marginTop:"4px" }}>{photo.tag} · click to view</div>
      </div>
      <div style={{ position:"absolute",top:"12px",left:"12px",fontFamily:"'DM Mono',monospace",fontSize:"0.5rem",letterSpacing:"0.12em",textTransform:"uppercase",color:"rgba(255,255,255,0.5)",background:"rgba(0,0,0,.55)",padding:"4px 8px",backdropFilter:"blur(4px)" }}>{photo.tag}</div>
    </div>
  );
}

/* ── MAIN APP ───────────────────────────────────────────────── */
export default function Portfolio() {
  const [photos,    setPhotos]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [activeTag, setActiveTag] = useState("All");
  const [lightbox,  setLightbox]  = useState(null);
  const [scrollY,   setScrollY]   = useState(0);
  const [flash,     setFlash]     = useState(false);
  const aboutRef = useRef(null);
  const [aboutVis, setAboutVis] = useState(null);

  /* fetch photos */
  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("photos")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error) setPhotos(data || []);
      setLoading(false);
    }
    load();
    /* realtime: new photo uploaded → gallery updates instantly */
    const channel = supabase
      .channel("photos")
      .on("postgres_changes", { event: "*", schema: "public", table: "photos" }, load)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

useEffect(() => {
    async function countVisit() {
      const { data } = await supabase
        .from("counter")
        .select("visits")
        .eq("id", 1)
        .single();
      const newCount = (data?.visits || 0) + 1;
      await supabase
        .from("counter")
        .update({ visits: newCount })
        .eq("id", 1);
      setVisits(newCount);
    }
    countVisit();
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setAboutVis(true); }, { threshold: 0.15 });
    if (aboutRef.current) obs.observe(aboutRef.current);
    return () => obs.disconnect();
  }, []);

  const triggerFlash = () => { setFlash(true); setTimeout(() => setFlash(false), 180); };
  const scroll = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  const filtered = activeTag === "All" ? photos : photos.filter(p => p.tag === activeTag);
  const navToLightbox = (dir) => {
    const idx = filtered.findIndex(p => p.id === lightbox.id);
    setLightbox(filtered[(idx + dir + filtered.length) % filtered.length]);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@300;400&family=DM+Sans:ital,wght@0,300;0,400;1,300&display=swap');
        *,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
        html{scroll-behavior:smooth}
        body{background:#0b0b0b;color:#e8e4df;font-family:'DM Sans',sans-serif;cursor:none}
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-thumb{background:#2a2a2a}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes slideUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes scan{0%{transform:translateY(-100%)}100%{transform:translateY(100vh)}}
        .hover-white:hover{color:#fff!important;border-color:rgba(255,255,255,.5)!important}
        .cta:hover{background:#fff!important;color:#0b0b0b!important}
        @media(max-width:768px){
          .hero-h1{font-size:clamp(4rem,18vw,8rem)!important}
          .gal-grid{columns:1!important}
          .about-flex{flex-direction:column!important}
          .nav-links{display:none!important}
          .footer-row{flex-direction:column!important;gap:16px!important}
        }
      `}</style>

      <Cursor />
      {flash && <div style={{ position:"fixed",inset:0,background:"#fff",zIndex:9000,pointerEvents:"none",opacity:.9,animation:"fadeIn .05s" }} />}

      {/* NAV */}
      <nav style={{ position:"fixed",top:0,left:0,right:0,zIndex:200,padding:scrollY>60?"14px 40px":"24px 40px",display:"flex",alignItems:"center",justifyContent:"space-between",background:scrollY>60?"rgba(11,11,11,.94)":"transparent",backdropFilter:scrollY>60?"blur(16px)":"none",borderBottom:scrollY>60?"1px solid rgba(255,255,255,.06)":"none",transition:"all .35s" }}>
        <div onClick={()=>window.scrollTo({top:0,behavior:"smooth"})} style={{ cursor:"none",display:"flex",alignItems:"center",gap:"10px" }}>
          <div style={{ width:"28px",height:"28px",border:"1px solid rgba(255,255,255,.6)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center" }}>
            <div style={{ width:"8px",height:"8px",background:"#fff",borderRadius:"50%" }} />
          </div>
          <span style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:"1.25rem",letterSpacing:"0.18em",color:"#fff" }}>FLASH N FRAME</span>
        </div>
        <div className="nav-links" style={{ display:"flex",gap:"32px" }}>
          {["work","about","contact"].map(l => (
            <button key={l} onClick={()=>scroll(l)} className="hover-white"
              style={{ background:"none",border:"none",cursor:"none",fontFamily:"'DM Mono',monospace",fontSize:"0.68rem",letterSpacing:"0.2em",textTransform:"uppercase",color:"rgba(255,255,255,.4)" }}>
              {l}
            </button>
          ))}
        </div>
        <a href="https://instagram.com/flash_nframe" target="_blank" rel="noreferrer" className="hover-white"
          style={{ fontFamily:"'DM Mono',monospace",fontSize:"0.65rem",letterSpacing:"0.15em",color:"rgba(255,255,255,.4)",textDecoration:"none",textTransform:"uppercase" }}>
          @flash_nframe
        </a>
      </nav>

      {/* HERO */}
      <section style={{ position:"relative",height:"100vh",overflow:"hidden",display:"flex",flexDirection:"column",alignItems:"flex-start",justifyContent:"flex-end",padding:"0 40px 60px" }}>
        <div style={{ position:"absolute",inset:0 }}>
          {photos[0] && (
            <img src={photos[0].url} alt="hero"
              style={{ width:"100%",height:"100%",objectFit:"cover",filter:"brightness(.3) contrast(1.2) grayscale(20%)",transform:`scale(1.05) translateY(${scrollY*.2}px)` }} />
          )}
          <div style={{ position:"absolute",inset:0,background:"linear-gradient(to top,rgba(11,11,11,1) 0%,rgba(11,11,11,.15) 60%,rgba(11,11,11,.55) 100%)" }} />
        </div>
        {/* scanline */}
        <div style={{ position:"absolute",inset:0,overflow:"hidden",pointerEvents:"none" }}>
          <div style={{ position:"absolute",left:0,right:0,height:"2px",background:"rgba(255,255,255,.025)",animation:"scan 9s linear infinite" }} />
        </div>

        <div style={{ position:"relative",zIndex:2 }}>
          <div style={{ fontFamily:"'DM Mono',monospace",fontSize:"0.62rem",letterSpacing:"0.35em",color:"rgba(255,255,255,.4)",textTransform:"uppercase",marginBottom:"20px",animation:"slideUp 1s .2s both" }}>
            <span style={{ animation:"blink 1.3s infinite",display:"inline-block",marginRight:"8px" }}>●</span>
            Available for shoots · Mysore, India
          </div>
          <h1 className="hero-h1" style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:"clamp(5rem,14vw,13rem)",lineHeight:.88,letterSpacing:"0.03em",color:"#fff",animation:"slideUp 1s .35s both" }}>
            FLASH<br />
            <span style={{ WebkitTextStroke:"1px rgba(255,255,255,.35)",color:"transparent" }}>N</span>
            <span> FRAME</span>
          </h1>
          <div style={{ marginTop:"32px",display:"flex",alignItems:"center",gap:"32px",animation:"slideUp 1s .5s both" }}>
            <button onClick={()=>{triggerFlash();setTimeout(()=>scroll("work"),200);}} className="cta"
              style={{ fontFamily:"'DM Mono',monospace",fontSize:"0.72rem",letterSpacing:"0.2em",textTransform:"uppercase",padding:"14px 32px",background:"transparent",border:"1px solid rgba(255,255,255,.5)",color:"rgba(255,255,255,.7)",cursor:"none",transition:"all .3s" }}>
              View Work →
            </button>
            <span style={{ fontFamily:"'DM Mono',monospace",fontSize:"0.62rem",letterSpacing:"0.15em",color:"rgba(255,255,255,.3)",fontStyle:"italic" }}>
              Street · Portrait · Night
            </span>
          </div>
        </div>

        {/* shutter btn */}
        <button onClick={()=>{triggerFlash();setTimeout(()=>scroll("work"),200);}}
          style={{ position:"absolute",right:"48px",bottom:"60px",zIndex:2,width:"64px",height:"64px",borderRadius:"50%",border:"2px solid rgba(255,255,255,.25)",background:"rgba(255,255,255,.05)",backdropFilter:"blur(8px)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"3px",cursor:"none",transition:"all .3s" }}>
          <div style={{ width:"20px",height:"20px",borderRadius:"50%",border:"2px solid rgba(255,255,255,.6)",display:"flex",alignItems:"center",justifyContent:"center" }}>
            <div style={{ width:"8px",height:"8px",borderRadius:"50%",background:"rgba(255,255,255,.8)" }} />
          </div>
          <div style={{ fontFamily:"'DM Mono',monospace",fontSize:"0.4rem",letterSpacing:"0.1em",color:"rgba(255,255,255,.3)" }}>SHOOT</div>
        </button>
      </section>

      {/* GALLERY */}
      <section id="work" style={{ padding:"100px 40px" }}>
        <div style={{ display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:"48px",flexWrap:"wrap",gap:"16px" }}>
          <div>
            <div style={{ fontFamily:"'DM Mono',monospace",fontSize:"0.6rem",letterSpacing:"0.3em",color:"rgba(255,255,255,.3)",textTransform:"uppercase",marginBottom:"12px" }}>Selected Work</div>
            <h2 style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:"clamp(2.5rem,6vw,5rem)",letterSpacing:"0.05em",color:"#fff",lineHeight:1 }}>THE FRAMES</h2>
          </div>
          <div style={{ display:"flex",gap:"6px",flexWrap:"wrap" }}>
            {TAGS.map(t => (
              <button key={t} onClick={()=>setActiveTag(t)} className="hover-white"
                style={{ fontFamily:"'DM Mono',monospace",fontSize:"0.62rem",letterSpacing:"0.2em",textTransform:"uppercase",padding:"9px 20px",cursor:"none",border:`1px solid ${activeTag===t?"rgba(255,255,255,.4)":"rgba(255,255,255,.12)"}`,background:activeTag===t?"rgba(255,255,255,.12)":"transparent",color:activeTag===t?"#fff":"rgba(255,255,255,.4)",transition:"all .25s" }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign:"center",padding:"80px",fontFamily:"'DM Mono',monospace",fontSize:"0.7rem",letterSpacing:"0.2em",color:"rgba(255,255,255,.2)",textTransform:"uppercase" }}>
            Loading frames...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:"center",padding:"80px" }}>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:"3rem",color:"rgba(255,255,255,.1)",letterSpacing:"0.1em",marginBottom:"16px" }}>NO FRAMES YET</div>
            <div style={{ fontFamily:"'DM Mono',monospace",fontSize:"0.65rem",letterSpacing:"0.2em",color:"rgba(255,255,255,.25)",textTransform:"uppercase" }}>
              Go to /admin to upload your first photo
            </div>
          </div>
        ) : (
          <div className="gal-grid" style={{ columns:"3 280px",gap:"10px" }}>
            {filtered.map((p, i) => (
              <PhotoCard key={p.id} photo={p} index={i} onClick={()=>{triggerFlash();setTimeout(()=>setLightbox(p),180);}} />
            ))}
          </div>
        )}
      </section>

      {/* ABOUT */}
      <section id="about" ref={aboutRef} style={{ padding:"100px 40px",borderTop:"1px solid rgba(255,255,255,.06)" }}>
        <div className="about-flex" style={{ display:"flex",gap:"80px",alignItems:"center",opacity:aboutVis?1:0,transform:aboutVis?"none":"translateY(30px)",transition:"opacity .9s,transform .9s" }}>
          <div style={{ flexShrink:0,width:"320px",position:"relative" }}>
            <img src="https://res.cloudinary.com/dvkmuoisa/image/upload/v1773109698/profile1_szuakf.png" alt="photographer"
              style={{ width:"100%",display:"block",filter:"contrast(1.1) brightness(.85)" }} />
            {["tl","tr","bl","br"].map(c=>(
              <div key={c} style={{ position:"absolute",top:c.startsWith("t")?0:"auto",bottom:c.startsWith("b")?0:"auto",left:c.endsWith("l")?0:"auto",right:c.endsWith("r")?0:"auto",width:"20px",height:"20px",borderTop:c.startsWith("t")?"2px solid rgba(255,255,255,.35)":"none",borderBottom:c.startsWith("b")?"2px solid rgba(255,255,255,.35)":"none",borderLeft:c.endsWith("l")?"2px solid rgba(255,255,255,.35)":"none",borderRight:c.endsWith("r")?"2px solid rgba(255,255,255,.35)":"none" }} />
            ))}
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:"'DM Mono',monospace",fontSize:"0.6rem",letterSpacing:"0.35em",color:"rgba(255,255,255,.3)",textTransform:"uppercase",marginBottom:"20px" }}>About</div>
            <h2 style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:"clamp(2rem,5vw,4.5rem)",letterSpacing:"0.04em",color:"#fff",lineHeight:1,marginBottom:"28px" }}>FREEZE THE<br />MOMENT.</h2>
            <p style={{ fontSize:"1rem",lineHeight:1.85,color:"rgba(255,255,255,.5)",fontWeight:300,marginBottom:"20px",maxWidth:"480px" }}>
              I'm the lens behind <strong style={{ color:"rgba(255,255,255,.8)",fontWeight:400 }}>@flash_nframe</strong> — obsessed with the raw honesty of street life, the quiet power of a portrait, and the electric drama of cities at night.
            </p>
            <p style={{ fontSize:"1rem",lineHeight:1.85,color:"rgba(255,255,255,.38)",fontWeight:300,maxWidth:"480px" }}>
              Every frame is a split-second decision. I live for the ones where light, shadow, and human truth collide in a single shutter click.
            </p>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" style={{ padding:"100px 40px",borderTop:"1px solid rgba(255,255,255,.06)",textAlign:"center" }}>
        <div style={{ fontFamily:"'DM Mono',monospace",fontSize:"0.6rem",letterSpacing:"0.35em",color:"rgba(255,255,255,.3)",textTransform:"uppercase",marginBottom:"20px" }}>Contact</div>
        <h2 style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:"clamp(3rem,8vw,7rem)",letterSpacing:"0.03em",color:"#fff",lineHeight:.9,marginBottom:"32px" }}>LET'S<br />SHOOT</h2>
        <p style={{ fontSize:"1rem",color:"rgba(255,255,255,.4)",maxWidth:"440px",margin:"0 auto 48px",lineHeight:1.8,fontWeight:300 }}>
          Open for collaborations, commissioned shoots, and creative projects.
        </p>
        <div style={{ display:"flex",flexDirection:"column",gap:"14px",maxWidth:"460px",margin:"0 auto 40px" }}>
            <input type="text" id="cname" placeholder="Your name" style={inp} />
            <input type="email" id="cemail" placeholder="Your email" style={inp} />
            <textarea id="cmsg" placeholder="Tell me about your project..." rows={4} style={inp} />
            <button className="cta"
              onClick={() => {
                const name = document.getElementById("cname").value;
                const email = document.getElementById("cemail").value;
                const msg = document.getElementById("cmsg").value;
                window.location.href = `mailto:purvajanbackups@gmail.com?subject=Shoot Enquiry from ${name}&body=${msg}%0A%0AReply to: ${email}`;
              }}
              style={{ fontFamily:"'DM Mono',monospace",fontSize:"0.72rem",letterSpacing:"0.2em",textTransform:"uppercase",padding:"16px",background:"transparent",border:"1px solid rgba(255,255,255,.4)",color:"rgba(255,255,255,.7)",cursor:"pointer",transition:"all .3s" }}>
              Send Message →
            </button>
          </div>
        <div style={{ display:"flex",justifyContent:"center",gap:"12px" }}>
          <a href="https://instagram.com/flash_nframe" target="_blank" rel="noreferrer" className="hover-white"
            style={{ fontFamily:"'DM Mono',monospace",fontSize:"0.65rem",letterSpacing:"0.2em",textTransform:"uppercase",padding:"10px 24px",border:"1px solid rgba(255,255,255,.15)",color:"rgba(255,255,255,.4)",textDecoration:"none",transition:"all .3s" }}>
            Instagram
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding:"28px 40px",borderTop:"1px solid rgba(255,255,255,.05)" }}>
        <div className="footer-row" style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}>
          <span style={{ fontFamily:"'DM Mono',monospace",fontSize:"0.55rem",letterSpacing:"0.15em",color:"rgba(255,255,255,.2)",textTransform:"uppercase" }}>© 2025 Flash N Frame</span>
          <span style={{ fontFamily:"'DM Mono',monospace",fontSize:"0.55rem",letterSpacing:"0.15em",color:"rgba(255,255,255,.2)",textTransform:"uppercase" }}>   Mysore, India · {visits ? `${visits} visits` : "..."} </span>
        </div>
      </footer>

      {lightbox && <Lightbox photo={lightbox} photos={filtered} onClose={()=>setLightbox(null)} onNav={navToLightbox} />}
    </>
  );
}

const inp = { width:"100%",padding:"14px 18px",background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.1)",color:"#e8e4df",fontFamily:"'DM Sans',sans-serif",fontSize:"0.95rem",outline:"none",resize:"vertical" };
