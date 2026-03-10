import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

// ─── PASTE YOUR KEYS HERE ────────────────────────────────────
const SUPABASE_URL     = "https://jibynxmzswsjhqigaywd.supabase.co";
const SUPABASE_ANON    = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppYnlueG16c3dzamhxaWdheXdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNzM1NjcsImV4cCI6MjA4ODY0OTU2N30.UH4rZSI4dwbtLHNcxJ0_4QgEeRpqDbzKLX8INE285TM";
const CLOUDINARY_NAME  = "dvkmuoisa";
const CLOUDINARY_PRESET = "lyukznee";   // unsigned preset
const ADMIN_PASSWORD   = "flashnframe2025";        // ← change this!
// ─────────────────────────────────────────────────────────────

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);
const TAGS = ["Street", "Portrait", "Night", "Nature"];

export default function Admin() {
  const [authed,    setAuthed]    = useState(false);
  const [password,  setPassword]  = useState("");
  const [pwError,   setPwError]   = useState(false);

  const [photos,    setPhotos]    = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress,  setProgress]  = useState(0);
  const [dragOver,  setDragOver]  = useState(false);
  const [toast,     setToast]     = useState(null);

  const [form, setForm] = useState({ title: "", tag: "Street" });
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview,      setPreview]      = useState(null);
  const fileRef = useRef(null);

  /* check session */
  useEffect(() => {
    if (sessionStorage.getItem("fnf_admin") === "true") setAuthed(true);
  }, []);

  /* fetch photos */
  useEffect(() => {
    if (!authed) return;
    loadPhotos();
  }, [authed]);

  async function loadPhotos() {
    const { data } = await supabase.from("photos").select("*").order("created_at", { ascending: false });
    setPhotos(data || []);
  }

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  }

  function login() {
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem("fnf_admin", "true");
      setAuthed(true);
    } else {
      setPwError(true);
      setTimeout(() => setPwError(false), 1200);
    }
  }

  function pickFile(file) {
    if (!file || !file.type.startsWith("image/")) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);
    if (!form.title) setForm(f => ({ ...f, title: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ") }));
  }

  async function upload() {
    if (!selectedFile) return showToast("Please choose a photo first", "error");
    if (!form.title.trim()) return showToast("Please add a title", "error");
    setUploading(true);
    setProgress(0);

    try {
      /* 1 ── upload to Cloudinary */
      const fd = new FormData();
      fd.append("file",   selectedFile);
      fd.append("upload_preset", CLOUDINARY_PRESET);
      fd.append("folder", "flash_nframe");

      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 80));
      };

      const cloudRes = await new Promise((res, rej) => {
        xhr.onload  = () => res(JSON.parse(xhr.responseText));
        xhr.onerror = rej;
        xhr.open("POST", `https://api.cloudinary.com/v1_1/${CLOUDINARY_NAME}/image/upload`);
        xhr.send(fd);
      });

      if (!cloudRes.secure_url) throw new Error("Cloudinary upload failed");
      setProgress(85);

      /* 2 ── save to Supabase */
      const { error } = await supabase.from("photos").insert({
        url:   cloudRes.secure_url,
        title: form.title.trim(),
        tag:   form.tag,
        public_id: cloudRes.public_id,
      });
      if (error) throw error;
      setProgress(100);

      showToast(`"${form.title}" uploaded successfully! ✓`);
      setSelectedFile(null);
      setPreview(null);
      setForm({ title: "", tag: "Street" });
      loadPhotos();
    } catch (err) {
      console.error(err);
      showToast("Upload failed — check your keys in the code", "error");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }

  async function deletePhoto(photo) {
    if (!window.confirm(`Delete "${photo.title}"? This cannot be undone.`)) return;
    await supabase.from("photos").delete().eq("id", photo.id);
    showToast(`"${photo.title}" deleted`);
    loadPhotos();
  }

  /* ── LOGIN SCREEN ── */
  if (!authed) return (
    <div style={{ minHeight:"100vh",background:"#0b0b0b",display:"flex",alignItems:"center",justifyContent:"center" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@300;400&display=swap');
        *{margin:0;padding:0;box-sizing:border-box}
        body{background:#0b0b0b}
        @keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-8px)}40%,80%{transform:translateX(8px)}}
      `}</style>
      <div style={{ textAlign:"center",padding:"48px",border:"1px solid rgba(255,255,255,.08)",maxWidth:"380px",width:"90%",animation: pwError ? "shake .4s ease" : "none" }}>
        <div style={{ width:"48px",height:"48px",border:"2px solid rgba(255,255,255,.3)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 24px" }}>
          <div style={{ width:"16px",height:"16px",background:"rgba(255,255,255,.7)",borderRadius:"50%" }} />
        </div>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:"2rem",letterSpacing:"0.15em",color:"#fff",marginBottom:"8px" }}>ADMIN ACCESS</div>
        <div style={{ fontFamily:"'DM Mono',monospace",fontSize:"0.6rem",letterSpacing:"0.2em",color:"rgba(255,255,255,.3)",textTransform:"uppercase",marginBottom:"32px" }}>Flash N Frame</div>
        <input
          type="password" placeholder="Enter password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === "Enter" && login()}
          style={{ width:"100%",padding:"14px 18px",background:"rgba(255,255,255,.04)",border:`1px solid ${pwError?"rgba(255,80,80,.6)":"rgba(255,255,255,.12)"}`,color:"#e8e4df",fontFamily:"'DM Mono',monospace",fontSize:"0.85rem",outline:"none",marginBottom:"16px",textAlign:"center",letterSpacing:"0.2em" }}
        />
        {pwError && <div style={{ fontFamily:"'DM Mono',monospace",fontSize:"0.6rem",color:"rgba(255,80,80,.8)",letterSpacing:"0.1em",marginBottom:"16px" }}>Wrong password</div>}
        <button onClick={login}
          style={{ width:"100%",padding:"14px",background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.2)",color:"rgba(255,255,255,.7)",fontFamily:"'DM Mono',monospace",fontSize:"0.7rem",letterSpacing:"0.2em",textTransform:"uppercase",cursor:"pointer",transition:"all .25s" }}>
          Enter →
        </button>
      </div>
    </div>
  );

  /* ── ADMIN DASHBOARD ── */
  return (
    <div style={{ minHeight:"100vh",background:"#0b0b0b",color:"#e8e4df" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@300;400&family=DM+Sans:wght@300;400&display=swap');
        *{margin:0;padding:0;box-sizing:border-box}
        body{background:#0b0b0b;font-family:'DM Sans',sans-serif}
        @keyframes fadeIn{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .del-btn:hover{background:rgba(255,60,60,.15)!important;border-color:rgba(255,60,60,.4)!important;color:rgba(255,100,100,.9)!important}
        .upload-btn:hover{background:rgba(255,255,255,.15)!important}
        input::placeholder,textarea::placeholder{color:rgba(255,255,255,.25)}
        input:focus,select:focus{border-color:rgba(255,255,255,.3)!important;outline:none}
      `}</style>

      {/* TOAST */}
      {toast && (
        <div style={{ position:"fixed",top:"24px",right:"24px",zIndex:999,padding:"14px 24px",background: toast.type==="error"?"rgba(180,40,40,.95)":"rgba(30,30,30,.97)",border:`1px solid ${toast.type==="error"?"rgba(255,80,80,.4)":"rgba(255,255,255,.15)"}`,fontFamily:"'DM Mono',monospace",fontSize:"0.7rem",letterSpacing:"0.1em",color:"#fff",animation:"fadeIn .3s ease",backdropFilter:"blur(12px)",maxWidth:"340px" }}>
          {toast.msg}
        </div>
      )}

      {/* HEADER */}
      <header style={{ padding:"20px 40px",borderBottom:"1px solid rgba(255,255,255,.07)",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
        <div style={{ display:"flex",alignItems:"center",gap:"12px" }}>
          <div style={{ width:"28px",height:"28px",border:"1px solid rgba(255,255,255,.5)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center" }}>
            <div style={{ width:"8px",height:"8px",background:"#fff",borderRadius:"50%" }} />
          </div>
          <div>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:"1.2rem",letterSpacing:"0.15em",color:"#fff" }}>FLASH N FRAME</div>
            <div style={{ fontFamily:"'DM Mono',monospace",fontSize:"0.55rem",letterSpacing:"0.2em",color:"rgba(255,255,255,.3)",textTransform:"uppercase" }}>Admin Panel</div>
          </div>
        </div>
        <div style={{ display:"flex",alignItems:"center",gap:"16px" }}>
          <span style={{ fontFamily:"'DM Mono',monospace",fontSize:"0.6rem",letterSpacing:"0.15em",color:"rgba(255,255,255,.3)" }}>{photos.length} photos</span>
          <a href="/" target="_blank" rel="noreferrer"
            style={{ fontFamily:"'DM Mono',monospace",fontSize:"0.6rem",letterSpacing:"0.15em",textTransform:"uppercase",color:"rgba(255,255,255,.4)",textDecoration:"none",padding:"8px 16px",border:"1px solid rgba(255,255,255,.12)",transition:"all .2s" }}>
            View Site ↗
          </a>
          <button onClick={()=>{sessionStorage.removeItem("fnf_admin");setAuthed(false);}}
            style={{ fontFamily:"'DM Mono',monospace",fontSize:"0.6rem",letterSpacing:"0.15em",textTransform:"uppercase",color:"rgba(255,255,255,.3)",background:"none",border:"1px solid rgba(255,255,255,.08)",padding:"8px 16px",cursor:"pointer" }}>
            Logout
          </button>
        </div>
      </header>

      <div style={{ maxWidth:"1200px",margin:"0 auto",padding:"48px 40px",display:"grid",gridTemplateColumns:"400px 1fr",gap:"40px",alignItems:"start" }}>

        {/* ── UPLOAD PANEL ── */}
        <div style={{ border:"1px solid rgba(255,255,255,.08)",padding:"36px",animation:"slideUp .5s ease both" }}>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:"1.6rem",letterSpacing:"0.1em",color:"#fff",marginBottom:"28px" }}>UPLOAD PHOTO</div>

          {/* DROP ZONE */}
          <div
            onDragOver={e=>{e.preventDefault();setDragOver(true);}}
            onDragLeave={()=>setDragOver(false)}
            onDrop={e=>{e.preventDefault();setDragOver(false);pickFile(e.dataTransfer.files[0]);}}
            onClick={()=>fileRef.current?.click()}
            style={{ border:`2px dashed ${dragOver?"rgba(255,255,255,.5)":preview?"rgba(255,255,255,.2)":"rgba(255,255,255,.1)"}`,padding:"0",marginBottom:"24px",cursor:"pointer",transition:"border-color .25s",position:"relative",overflow:"hidden",minHeight:"200px",display:"flex",alignItems:"center",justifyContent:"center",background:dragOver?"rgba(255,255,255,.03)":"transparent" }}>
            {preview ? (
              <img src={preview} alt="preview" style={{ width:"100%",display:"block",maxHeight:"260px",objectFit:"cover",opacity:.85 }} />
            ) : (
              <div style={{ textAlign:"center",padding:"40px 20px" }}>
                <div style={{ fontSize:"2.5rem",marginBottom:"12px",opacity:.4 }}>⊕</div>
                <div style={{ fontFamily:"'DM Mono',monospace",fontSize:"0.65rem",letterSpacing:"0.15em",color:"rgba(255,255,255,.35)",textTransform:"uppercase",marginBottom:"8px" }}>
                  Drop photo here
                </div>
                <div style={{ fontFamily:"'DM Mono',monospace",fontSize:"0.55rem",letterSpacing:"0.1em",color:"rgba(255,255,255,.2)" }}>
                  or click to browse
                </div>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={e=>pickFile(e.target.files[0])} />

          {/* FORM FIELDS */}
          <div style={{ marginBottom:"16px" }}>
            <label style={{ display:"block",fontFamily:"'DM Mono',monospace",fontSize:"0.58rem",letterSpacing:"0.2em",textTransform:"uppercase",color:"rgba(255,255,255,.3)",marginBottom:"8px" }}>Photo Title</label>
            <input type="text" placeholder="e.g. Rush Hour" value={form.title}
              onChange={e=>setForm(f=>({...f,title:e.target.value}))}
              style={{ width:"100%",padding:"12px 16px",background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.1)",color:"#e8e4df",fontFamily:"'DM Sans',sans-serif",fontSize:"0.95rem",outline:"none" }} />
          </div>

          <div style={{ marginBottom:"28px" }}>
            <label style={{ display:"block",fontFamily:"'DM Mono',monospace",fontSize:"0.58rem",letterSpacing:"0.2em",textTransform:"uppercase",color:"rgba(255,255,255,.3)",marginBottom:"8px" }}>Category</label>
            <select value={form.tag} onChange={e=>setForm(f=>({...f,tag:e.target.value}))}
              style={{ width:"100%",padding:"12px 16px",background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.1)",color:"#e8e4df",fontFamily:"'DM Sans',sans-serif",fontSize:"0.95rem",outline:"none",cursor:"pointer" }}>
              {TAGS.map(t=><option key={t} value={t} style={{ background:"#1a1a1a" }}>{t}</option>)}
            </select>
          </div>

          {/* PROGRESS BAR */}
          {uploading && (
            <div style={{ marginBottom:"20px" }}>
              <div style={{ height:"2px",background:"rgba(255,255,255,.08)",marginBottom:"8px",overflow:"hidden" }}>
                <div style={{ height:"100%",background:"#fff",width:`${progress}%`,transition:"width .3s" }} />
              </div>
              <div style={{ fontFamily:"'DM Mono',monospace",fontSize:"0.58rem",letterSpacing:"0.15em",color:"rgba(255,255,255,.35)",textTransform:"uppercase" }}>
                {progress < 80 ? "Uploading to Cloudinary..." : progress < 100 ? "Saving to database..." : "Done!"}
              </div>
            </div>
          )}

          <button onClick={upload} disabled={uploading} className="upload-btn"
            style={{ width:"100%",padding:"16px",background:"rgba(255,255,255,.1)",border:"1px solid rgba(255,255,255,.25)",color:uploading?"rgba(255,255,255,.35)":"rgba(255,255,255,.8)",fontFamily:"'DM Mono',monospace",fontSize:"0.72rem",letterSpacing:"0.2em",textTransform:"uppercase",cursor:uploading?"not-allowed":"pointer",transition:"all .3s" }}>
            {uploading ? `Uploading ${progress}%...` : "Upload Photo →"}
          </button>

          {selectedFile && !uploading && (
            <button onClick={()=>{setSelectedFile(null);setPreview(null);setForm({title:"",tag:"Street"});}}
              style={{ width:"100%",marginTop:"10px",padding:"10px",background:"transparent",border:"1px solid rgba(255,255,255,.06)",color:"rgba(255,255,255,.25)",fontFamily:"'DM Mono',monospace",fontSize:"0.6rem",letterSpacing:"0.15em",textTransform:"uppercase",cursor:"pointer" }}>
              Clear
            </button>
          )}
        </div>

        {/* ── PHOTO GRID ── */}
        <div>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:"1.6rem",letterSpacing:"0.1em",color:"#fff",marginBottom:"28px" }}>
            YOUR PHOTOS
            <span style={{ fontFamily:"'DM Mono',monospace",fontSize:"0.65rem",letterSpacing:"0.15em",color:"rgba(255,255,255,.3)",marginLeft:"16px",textTransform:"uppercase",fontStyle:"normal" }}>
              {photos.length} total
            </span>
          </div>

          {photos.length === 0 ? (
            <div style={{ padding:"60px",border:"1px dashed rgba(255,255,255,.07)",textAlign:"center" }}>
              <div style={{ fontFamily:"'DM Mono',monospace",fontSize:"0.65rem",letterSpacing:"0.2em",color:"rgba(255,255,255,.2)",textTransform:"uppercase" }}>No photos yet — upload your first frame!</div>
            </div>
          ) : (
            <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:"8px" }}>
              {photos.map((p, i) => (
                <div key={p.id} style={{ position:"relative",overflow:"hidden",animation:`slideUp .4s ${i*.05}s both` }}>
                  <img src={p.url} alt={p.title} style={{ width:"100%",aspectRatio:"1",objectFit:"cover",display:"block",filter:"brightness(.8)" }} />
                  <div style={{ position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,.85) 0%,transparent 55%)",display:"flex",flexDirection:"column",justifyContent:"flex-end",padding:"10px 10px" }}>
                    <div style={{ fontFamily:"'DM Mono',monospace",fontSize:"0.58rem",color:"#fff",letterSpacing:"0.05em",marginBottom:"2px",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{p.title}</div>
                    <div style={{ fontFamily:"'DM Mono',monospace",fontSize:"0.5rem",letterSpacing:"0.1em",color:"rgba(255,255,255,.4)",textTransform:"uppercase" }}>{p.tag}</div>
                  </div>
                  <button className="del-btn" onClick={()=>deletePhoto(p)}
                    style={{ position:"absolute",top:"8px",right:"8px",width:"28px",height:"28px",background:"rgba(0,0,0,.7)",border:"1px solid rgba(255,255,255,.15)",color:"rgba(255,255,255,.5)",fontSize:"0.8rem",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s" }}>
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
