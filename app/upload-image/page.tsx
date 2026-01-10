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
    <h1>Media Library</h1>

    {files.length === 0 && <p>No files found in the images folder.</p>}

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
                width: "100%",
                height: "150px",
                objectFit: "cover",
                borderRadius: 4,
                cursor: "pointer",
                backgroundColor: "#000", // optional: shows black before first frame loads
              }}
              onClick={() => setUrl(file.url)}
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
              width: "100%",
              height: "150px",
              objectFit: "cover",
              borderRadius: 4,
              cursor: "pointer",
            }}
            onClick={() => setUrl(file.url)}
          />
        )
      })}
    </div>

    {url && (
      <>
        <p style={{ marginTop: "1rem" }}>Markdown for selected file:</p>
        <pre>{`![alt text](${url})`}</pre>
        <button onClick={copyMarkdown}>Copy to clipboard</button>
      </>
    )}
  </div>
)
}
