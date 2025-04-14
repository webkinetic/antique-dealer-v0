"use client"

import { useEffect, useState, useRef } from "react"
import { MessageSquare, X } from "lucide-react"

export default function BotpressEmbedded() {
  const [isOpen, setIsOpen] = useState(false)
  const initAttempts = useRef(0)
  const botpressInitialized = useRef(false)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // Function to initialize Botpress
  const initializeBotpress = () => {
    if (!window.botpress || botpressInitialized.current) return

    try {
      // Initialize Botpress
      window.botpress.init({
        botId: "e0d700ee-44b3-4f63-bbd6-a19c23ceac32",
        configuration: {
          composerPlaceholder: "how can i help you today?",
          botName: "Kevin Marshall",
          botAvatar: "https://files.bpcontent.cloud/2025/04/05/14/20250405142755-IHDH81BW.jpeg",
          website: {},
          email: {
            title: "kevinmarshall@antiquedealer.co.uk",
            link: "kevinmarshall@antiquedealer.co.uk",
          },
          phone: {
            title: "07803 759820",
            link: "07803 759820",
          },
          termsOfService: {},
          privacyPolicy: {},
          color: "#00563F",
          variant: "solid",
          themeMode: "light",
          fontFamily: "inter",
          radius: 1,
        },
        clientId: "6dc4fa0f-913d-4f14-bce7-753ec60ed172",
        selector: "#webchat",
      })

      // Mark as initialized
      botpressInitialized.current = true

      // Set up event listeners
      window.botpress.on("webchat:ready", () => {
        console.log("Botpress webchat is ready")
        if (isOpen) {
          setTimeout(() => window.botpress.open(), 100)
        }
      })

      console.log("Botpress initialized successfully")
    } catch (error) {
      console.error("Error initializing Botpress:", error)
    }
  }

  // Load the Botpress script
  useEffect(() => {
    // Only load the script once
    if (document.getElementById("botpress-script")) return

    const script = document.createElement("script")
    script.id = "botpress-script"
    script.src = "https://cdn.botpress.cloud/webchat/v2.3/inject.js"
    script.async = true
    script.defer = true

    script.onload = () => {
      console.log("Botpress script loaded")
      // Try to initialize immediately
      initializeBotpress()

      // Also set up a retry mechanism
      const initInterval = setInterval(() => {
        if (botpressInitialized.current) {
          clearInterval(initInterval)
          return
        }

        if (initAttempts.current >= 10) {
          clearInterval(initInterval)
          console.error("Failed to initialize Botpress after multiple attempts")
          return
        }

        console.log(`Attempt ${initAttempts.current + 1} to initialize Botpress`)
        initAttempts.current += 1
        initializeBotpress()
      }, 1000)

      return () => clearInterval(initInterval)
    }

    script.onerror = () => {
      console.error("Failed to load Botpress script")
    }

    document.body.appendChild(script)

    // Cleanup
    return () => {
      if (document.getElementById("botpress-script")) {
        document.getElementById("botpress-script")?.remove()
      }
    }
  }, [])

  // Handle open/close state changes
  useEffect(() => {
    if (!window.botpress || !botpressInitialized.current) return

    if (isOpen) {
      window.botpress.open()
    } else {
      window.botpress.close()
    }
  }, [isOpen])

  // Toggle chat open/closed
  const toggleChat = () => {
    setIsOpen((prev) => !prev)
  }

  return (
    <>
      {/* Chat container */}
      <div
        ref={chatContainerRef}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          width: "400px",
          height: "600px",
          maxWidth: "90vw",
          maxHeight: "80vh",
          zIndex: 9999,
          borderRadius: "10px",
          overflow: "hidden",
          boxShadow: "0 5px 15px rgba(0, 0, 0, 0.2)",
          display: isOpen ? "block" : "none",
          backgroundColor: "white", // Add background to prevent transparency issues
        }}
      >
        <div id="webchat" style={{ width: "100%", height: "100%" }}></div>
      </div>

      {/* Chat button */}
      <button
        onClick={toggleChat}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          backgroundColor: "#00563F",
          color: "white",
          border: "none",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
          cursor: "pointer",
          zIndex: 9998,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          transition: "transform 0.2s ease, background-color 0.2s ease",
          transform: isOpen ? "scale(0.9)" : "scale(1)",
        }}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>

      {/* Custom styles */}
      <style jsx global>{`
        #webchat .bpWebchat {
          position: unset !important;
          width: 100% !important;
          height: 100% !important;
          max-height: 100% !important;
          max-width: 100% !important;
        }

        #webchat .bpFab {
          display: none !important;
        }
        
        /* Ensure the chat container doesn't get hidden */
        #webchat {
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
        }
      `}</style>
    </>
  )
}
