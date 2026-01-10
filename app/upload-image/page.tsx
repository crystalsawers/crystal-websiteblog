"use client"

import { useEffect, useState } from "react"
import { getAuth, onAuthStateChanged } from "firebase/auth"
import Image from "next/image"
import { storage } from "@/lib/firebaseConfig"

type StorageFile = {
  name: string
  url: string
}

export default function ExistingFilesPage() {
  const [authed, setAuthed] = useState(false)
  const [checking, setChecking] = useState(true)
  const [files, setFiles] = useState<StorageFile[]>([])
  const [url, setUrl] = useState("")

  useEffect(() => {
    const auth = getAuth()
    const unsub = onAuthStateChanged(auth, (user) => {
      setAuthed(!!user)
      setChecking(false)
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    if (!authed) return

    const fetchFiles = async () => {
      try {
        const res = await fetch("/api/list-images")
        const urls: string[] = await res.json()
        setFiles(urls.map((url) => ({ name: url.split("/").pop()!, url })))
      } catch (err) {
        console.error("Error fetching files:", err)
        setFiles([])
      }
    }

    fetchFiles()
  }, [authed])

  function copyMarkdown() {
    if (!url) return
    const markdown = `![alt text](${url})`
    navigator.clipboard.writeText(markdown)
  }

  if (checking) return null
  if (!authed) return null

return (
  <div style={{ padding: "2rem", width: "100%", margin: "0 auto" }}>

    <h1 className="page-title">Image Upload Library</h1>

    {files.length === 0 && <p className="text-center text-custom-green">Loading...</p>}

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
        gap: "12px",
        marginTop: "1rem",
      }}
    >
      {files.map((file) => {
        const isVideo = file.url.match(/\.(mp4|mov|mkv|webm)$/i)

        if (isVideo) {
          // Video element displays first frame automatically
          return (
            <video
              key={file.name}
              src={file.url}
              controls
              muted
              loop
              style={{
                ...{
                width: "100%",
                height: "150px",
                objectFit: "cover",
                borderRadius: 4,
                cursor: "pointer",
                backgroundColor: "#000",
                },
                border: file.url === url ? "3px solid red" : "none", // selected border
            }}
            onClick={() => setUrl(file.url)}
            onMouseOver={(e) => (e.currentTarget.style.opacity = "0.5")}
            onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
            />
          )
        }

        // Everything else (images + GIFs)
        return (
          <img
            key={file.name}
            src={file.url}
            alt={file.name}
            style={{
            ...{
                width: "100%",
                height: "150px",
                objectFit: "cover",
                borderRadius: 4,
                cursor: "pointer",
            },
            border: file.url === url ? "3px solid red" : "none", // selected border
            }}
            onClick={() => setUrl(file.url)}
            onMouseOver={(e) => (e.currentTarget.style.opacity = "0.5")}
            onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
          />
        )
      })}
    </div>

{/* Copy to clipboard pop-up */}
{url && (
  <div
    onClick={() => setUrl("")} // click outside to close
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      backgroundColor: "rgba(0,0,0,0.6)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
    }}
  >
    <div
  onClick={(e) => e.stopPropagation()}
  style={{
    position: "relative",
    backgroundColor: "#00ffd5",
    padding: "1.5rem",
    borderRadius: 8,
    maxWidth: "600px",
    width: "90%",
    textAlign: "center",
  }}
>
  {/* Top-right container for Close button */}
  <div style={{ display: "flex", justifyContent: "flex-end" }}>
    <button
      onClick={() => setUrl("")}
      style={{
        background: "transparent",
        border: "none",
        fontSize: "1.25rem",
        cursor: "pointer",
        fontWeight: "bold",
        color: "#000",
      }}
      aria-label="Close"
    >
      ✕
    </button>
  </div>
     
      {/* Media Preview */}
      {url.match(/\.(mp4|mov|mkv|webm)$/i) ? (
        <video
          src={url}
          controls
          style={{
            width: "100%",
            maxHeight: "400px",
            borderRadius: 4,
            marginBottom: "1rem",
          }}
        />
      ) : (
        <img
          src={url}
          alt="Selected media"
          style={{
            width: "100%",
            maxHeight: "400px",
            objectFit: "contain",
            borderRadius: 4,
            marginBottom: "1rem",
          }}
        />
      )}

      {/* Markdown */}
      <pre
        style={{
          backgroundColor: "#005c4d",
          padding: "0.75rem",
          borderRadius: 4,
          fontFamily: "monospace",
          fontSize: "0.9rem",
          marginBottom: "1rem",
          overflowX: "auto",
        }}
      >
        {`![alt text](${url})`}
      </pre>

      {/* Copy Button */}
      <button
        onClick={copyMarkdown}
        style={{
          backgroundColor: "#ef4444",
          color: "#fff",
          padding: "0.5rem 1rem",
          border: "none",
          borderRadius: 4,
          cursor: "pointer",
          fontWeight: "bold",
          transition: "0.2s",
        }}
        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#dc2626")}
        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#ef4444")}
      >
        Copy to clipboard
      </button>
    </div>
  </div>
)}


  </div>
)
}
