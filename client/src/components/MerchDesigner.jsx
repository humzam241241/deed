import React, { useRef, useState, useEffect } from 'react'

export default function MerchDesigner(){
  const fileRef = useRef(null)
  const [img, setImg] = useState(null)

  const onUpload = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    const url = URL.createObjectURL(f)
    setImg(url)
  }

  return (
    <div id="designer">
      <div className="card" style={{flex:'1 1 300px'}}>
        <label>Upload your logo / art</label>
        <input type="file" accept="image/*" onChange={onUpload} ref={fileRef} />
        <p style={{color:'#666', fontSize:14}}>PNG with transparent background recommended.</p>
      </div>
      <div className="preview card" style={{flex:'0 0 320px'}}>
        {/* Simple tee outline */}
        <svg viewBox="0 0 300 360" width="100%" height="100%">
          <path d="M150 40c25 0 40-10 60-20l30 40-35 25 0 210c0 15-12 27-27 27H122c-15 0-27-12-27-27V85L60 60l30-40c20 10 35 20 60 20z" fill="#fff" stroke="#ccc"/>
          <rect x="95" y="120" width="110" height="120" rx="8" ry="8" fill="rgba(0,0,0,0.03)" stroke="#ddd" />
        </svg>
        {img && <img src={img} alt="design" />}
      </div>
    </div>
  )
}
