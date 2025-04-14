"use client"

import { useEffect, useState, useRef } from "react"
import { MessageSquare, X } from "lucide-react"

export default function BotpressEmbedded() {
  const [isOpen, setIsOpen] = useState(false)
  const botpressInitialized = useRef(false)

  // Load the Botpress script and initialize
  useEffect(() => {
    // Only run once
    if (document.getElementById("botpress-script")) return

    // Create and add the script
    const script = document.createElement("script")
    script.id = "botpress-script"
    script.src = "https://cdn.botpress.cloud/webchat/v2.3/inject.js"
    script.async = true
    script.onload = () => {
      // Wait a moment for the script to initialize
      setTimeout(() => {
        if (window.botpress) {
          // Set up event listener first
          window.botpress.on("webchat:ready", () => {
            console.log("Botpress webchat is ready")
            botpressInitialized.current = true

            // If user already clicked to open before initialization completed
            if (isOpen) {
              window.botpress.open()
            }
          })

          // Listen for close events from Botpress
          window.botpress.on("webchat:close", () => {
            console.log("Botpress webchat closed")
            setIsOpen(false)
          })

          // Initialize Botpress with the exact configuration provided
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
            hideWidget: true, // Hide the default widget
          })
        }
      }, 500)
    }
    document.head.appendChild(script)

    return () => {
      // Clean up if component unmounts
      if (document.getElementById("botpress-script")) {
        document.getElementById("botpress-script")?.remove()
      }
    }
  }, [isOpen])

  // Toggle chat open/closed
  const toggleChat = () => {
    const newIsOpen = !isOpen
    setIsOpen(newIsOpen)

    // Only try to control Botpress if it's initialized
    if (botpressInitialized.current && window.botpress) {
      if (newIsOpen) {
        window.botpress.open()
      } else {
        window.botpress.close()
      }
    }
  }

  return (
    <>
      {/* Chat button */}
      <button
        onClick={toggleChat}
        className="chat-toggle-button"
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
          padding: 0,
          overflow: "hidden",
        }}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%", height: "100%" }}>
          {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
        </div>
      </button>

      {/* Custom styles */}
      <style jsx global>{`
        /* Position the Botpress widget properly when open */
        .bp-widget-web {
          position: fixed !important;
          bottom: 20px !important;
          right: 20px !important;
          width: 400px !important;
          height: 600px !important;
          max-width: 90vw !important;
          max-height: 80vh !important;
          border-radius: 10px !important;
          overflow: hidden !important;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2) !important;
          z-index: 9999 !important;
        }
        
        /* Hide the default Botpress button */
        .bp-widget-web .bpw-floating-button {
          display: none !important;
        }
        
        /* Make sure our button doesn't have any unexpected content */
        .chat-toggle-button * {
          pointer-events: none;
        }
        
        /* Hide any Botpress elements that might be causing overlap */
        body > div.bp-widget-widget {
          display: none !important;
        }
      `}</style>
    </>
  )
}
