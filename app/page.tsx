// app/page.tsx
"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { VRButton } from "three/examples/jsm/webxr/VRButton";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { VRMLoaderPlugin, VRMHumanBoneName } from "@pixiv/three-vrm";
import tmi from "tmi.js";

export default function Home() {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const textContextRef = useRef(null);
  const textTextureRef = useRef(null);
  const utteranceRef = useRef(null);
  const vrmRef = useRef(null);
  const [prompt, setPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1.0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [knownBots, setKnownBots] = useState([
    "Nightbot",
    "Streamlabs",
    "Moobot",
    "Fossabot",
    "WizeBot",
    "Stay_Hydrated_Bot",
    "CommanderRoot",
    "AnkhBot",
  ]);
  const [newBot, setNewBot] = useState("");
  const wsRef = useRef(null);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(prompt);
      setPrompt("");
    } else {
      setAiResponse("Error: WebSocket not connected");
    }
  };

  // Add new bot to knownBots
  const handleAddBot = (e) => {
    e.preventDefault();
    if (newBot && !knownBots.includes(newBot)) {
      setKnownBots([...knownBots, newBot]);
      setNewBot("");
    }
  };

  // Stop TTS
  const stopTTS = () => {
    window.speechSynthesis.cancel();
    utteranceRef.current = null;
    setIsSpeaking(false);
  };

  // Toggle mute
  const toggleMute = () => {
    if (!isMuted) {
      window.speechSynthesis.cancel();
      utteranceRef.current = null;
      setIsSpeaking(false);
    }
    setIsMuted(!isMuted);
  };

  // Handle volume change
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (utteranceRef.current) {
      utteranceRef.current.volume = newVolume;
    }
  };

  // Text wrapping function
  const wrapText = (text, maxWidth, context) => {
    const words = text.split(" ");
    const lines = [];
    let currentLine = words[0];
    context.font = "20px Arial";
    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = context.measureText(currentLine + " " + word).width;
      if (width < maxWidth) {
        currentLine += " " + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines;
  };

  useEffect(() => {
    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1, 3);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    mountRef.current.appendChild(renderer.domElement);
    mountRef.current.appendChild(VRButton.createButton(renderer));

    // Basic environment
    const floorGeometry = new THREE.PlaneGeometry(10, 10);
    const floorMaterial = new THREE.MeshBasicMaterial({
      color: 0x555555,
      side: THREE.DoubleSide,
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = Math.PI / 2;
    floor.position.y = -0.5;
    scene.add(floor);

    // Load VRM avatar
    const loader = new GLTFLoader();
    loader.register((parser) => new VRMLoaderPlugin(parser));
    loader.load(
      "/models/avatar.vrm",
      (gltf) => {
        const vrm = gltf.userData.vrm;
        if (!vrm) {
          console.error("VRM instance not found in gltf.userData");
          // Fallback to cube
          const avatarGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
          const avatarMaterial = new THREE.MeshBasicMaterial({
            color: 0xff0000,
          });
          const avatar = new THREE.Mesh(avatarGeometry, avatarMaterial);
          avatar.position.set(0, 0.5, 0);
          scene.add(avatar);
          return;
        }
        console.log("VRM loaded:", vrm);
        vrmRef.current = vrm;
        const avatar = vrm.scene;
        avatar.position.set(0, 0, 0);
        avatar.scale.set(1, 1, 1);
        scene.add(avatar);
        // Optional: Set up VRM-specific features
        if (vrm.humanoid) {
          try {
            // Set non-T-pose (relaxed arms)
            const leftArm = vrm.humanoid.getBoneNode(
              VRMHumanBoneName.LeftUpperArm
            );
            const rightArm = vrm.humanoid.getBoneNode(
              VRMHumanBoneName.RightUpperArm
            );
            if (leftArm) {
              leftArm.rotation.z = -Math.PI / 2.33; // ~45 degrees downward
            }
            if (rightArm) {
              rightArm.rotation.z = Math.PI / 2.33; // ~45 degrees downward
            }
            // Set head rotation
            const headBone = vrm.humanoid.getBoneNode(VRMHumanBoneName.Head);
            if (headBone) {
              headBone.rotation.x = 0;
            } else {
              console.warn("Head bone not found in VRM model");
            }
            // Set hips rotation
            const hipsBone = vrm.humanoid.getBoneNode(VRMHumanBoneName.Hips);
            if (hipsBone) {
              //return
              //hipsBone.rotation.y = Math.PI * 1;
            }
          } catch (error) {
            console.error("Error setting VRM pose:", error);
          }
        } else {
          console.warn("VRM model lacks humanoid rig");
        }
      },
      (progress) => {
        console.log(
          "Loading VRM model...",
          100.0 * (progress.loaded / progress.total),
          "%"
        );
      },
      (error) => {
        console.error("Error loading VRM:", error);
        // Fallback to cube
        const avatarGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        const avatarMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const avatar = new THREE.Mesh(avatarGeometry, avatarMaterial);
        avatar.position.set(0, 0.5, 0);
        scene.add(avatar);
      }
    );

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 10, 10);
    scene.add(directionalLight);

    // Orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1, 0);
    controls.update();

    // Display AI response (text plane)
    const textCanvas = document.createElement("canvas");
    textCanvas.width = 1024;
    textCanvas.height = 512;
    const textContext = textCanvas.getContext("2d");
    textContextRef.current = textContext;
    const textTexture = new THREE.CanvasTexture(textCanvas);
    textTextureRef.current = textTexture;
    const textMaterial = new THREE.MeshBasicMaterial({
      map: textTexture,
      transparent: true,
    });
    const textGeometry = new THREE.PlaneGeometry(4, 2);
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.name = "textMesh";
    textMesh.position.set(0, 1.5, -2);
    scene.add(textMesh);

    // Update text function
    const updateText = (text) => {
      if (textContextRef.current && textTextureRef.current) {
        textContextRef.current.clearRect(
          0,
          0,
          textCanvas.width,
          textCanvas.height
        );
        textContextRef.current.fillStyle = "black";
        textContextRef.current.fillRect(
          0,
          0,
          textCanvas.width,
          textCanvas.height
        );
        textContextRef.current.fillStyle = "white";
        textContextRef.current.font = "20px Arial";
        const lines = wrapText(
          text,
          textCanvas.width - 20,
          textContextRef.current
        );
        lines.forEach((line, index) => {
          textContextRef.current.fillText(line, 10, 30 + index * 30);
        });
        textTextureRef.current.needsUpdate = true;
      }
    };
    updateText("Enter a prompt or wait for Twitch chat");

    // WebSocket setup
    wsRef.current = new WebSocket("ws://localhost:3001");
    wsRef.current.onopen = () => {
      console.log("WebSocket connected");
    };
    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const response = data.response || data.error || "No response";
      setIsSpeaking(true);
      
      setAiResponse(response);
      handleLipSync(true, vrmRef);
      // updateText(response);
    };
    wsRef.current.onclose = () => {
      console.log("WebSocket disconnected");
      setAiResponse("WebSocket disconnected");
    };
    wsRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
      setAiResponse("WebSocket error");
    };

    // Twitch chat setup
    const twitchClient = new tmi.Client({
      channels: ["your_twitch_channel"], // Replace with your Twitch channel name
    });
    twitchClient.connect().catch((error) => {
      console.error("Twitch connection error:", error);
      setAiResponse("Twitch connection error");
    });
    twitchClient.on("message", (channel, user, message) => {
      const username = user["display-name"];
      // Ignore bot messages
      if (knownBots.includes(username)) {
        console.log(`Ignored bot message from ${username}`);
        return;
      }
      // Ignore command messages starting with '!'
      if (message.startsWith("!")) {
        console.log(`Ignored command message: ${message}`);
        return;
      }
      /*
      Alternative filtering methods (not implemented for simplicity):
      - Check user['badges'] for bot-specific badges (rarely used by bots like Nightbot).
        Example: if (user['badges']?.bot) return;
      - Filter non-regular users via user['user-type'] (e.g., moderator, staff).
        Example: if (user['user-type']) return; // May exclude moderators
      - Dynamic bot list via chat commands (e.g., '!ignorebot <username>').
        Requires state management and command parsing.
      */
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(`${username}: ${message}`);
        updateText(`${username}: ${message}`);
      }
    });

    // Animation loop
    renderer.setAnimationLoop(() => {
      // console.log("vrmRef", vrmRef);
      if (vrmRef && vrmRef.current && vrmRef.current.scene) {
        const avatar = vrmRef.current.scene;
        // Rotate avatar to face camera (Y-axis only)
        const cameraPos = camera.position.clone();
        cameraPos.y = avatar.position.y; // Keep avatar upright
        avatar.lookAt(cameraPos);
        // Lip-sync animation
        
        
      }
      renderer.render(scene, camera);
    });
    // handle lip-sync
    const handleLipSync = (isSpeaking,vrmRef) => {
      console.log("vrmRef", isSpeaking);
      return
      if (isSpeaking && vrmRef.current.expressionManager) {
        console.log("speaking");
        const value = Math.abs(Math.sin(Date.now() * 0.005)) * 0.5; // Oscillate between 0 and 0.5
        if (
          vrmRef.current.expressionManager._expressionMap["oh"] !== undefined
        ) {
          console.log("vrmRef.current.expressionManager._expressionMap", vrmRef.current.expressionManager._expressionMap);
          vrmRef.current.expressionManager._expressionMap["relaxed"].weight = value;
          console.log("Applying lip-sync to blend shape: aa");
        } else {
          console.warn('Blend shape "aa" not found for lip-sync');
        }
        vrmRef.current.update();
      } else if (
        !isSpeaking &&
        vrmRef.current.expressionManager._expressionMap["aa"] !== undefined
      ) {
        console.log("not speaking");
        vrmRef.current.expressionManager.expressionMap["aa"].weight = 0;
        vrmRef.current.update();
      }
    };

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      if (wsRef.current) {
        wsRef.current.close();
      }
      twitchClient.disconnect();
      window.speechSynthesis.cancel();
      mountRef.current.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  // Update text and trigger TTS when aiResponse changes
  useEffect(() => {
    if (
      aiResponse &&
      sceneRef.current &&
      textContextRef.current &&
      textTextureRef.current
    ) {
      const textMesh = sceneRef.current.getObjectByName("textMesh");
      if (textMesh) {
        textContextRef.current.clearRect(0, 0, 1024, 512);
        textContextRef.current.fillStyle = "black";
        textContextRef.current.fillRect(0, 0, 1024, 512);
        textContextRef.current.fillStyle = "white";
        textContextRef.current.font = "20px Arial";
        const lines = wrapText(aiResponse, 1024 - 20, textContextRef.current);
        lines.forEach((line, index) => {
          textContextRef.current.fillText(line, 10, 30 + index * 30);
        });
        textTextureRef.current.needsUpdate = true;
        textMesh.material.map = textTextureRef.current;
        textMesh.material.needsUpdate = true;
        setIsSpeaking(true);
      }

      // Text-to-Speech with lip-sync
      if (!isMuted && vrmRef.current) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(aiResponse);
        utteranceRef.current = utterance;
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = volume;
        const voices = window.speechSynthesis.getVoices();
        const voice = voices.find((v) => v.lang.includes("en")) || voices[0];
        utterance.voice = voice;
        utterance.onstart = () => {
          setIsSpeaking(true);
        };
        utterance.onend = () => {
          setIsSpeaking(false);
        };
        window.speechSynthesis.speak(utterance);
      }
    }
  }, [aiResponse, isMuted, volume]);

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
      <div ref={mountRef} />
      <div style={{ position: "absolute", top: 10, left: 10, zIndex: 10 }}>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter prompt or wait for Twitch chat"
            style={{ padding: "5px", marginRight: "10px" }}
          />
          <button type="submit" style={{ padding: "5px 10px" }}>
            Send
          </button>
        </form>
        <form onSubmit={handleAddBot} style={{ marginTop: "10px" }}>
          <input
            type="text"
            value={newBot}
            onChange={(e) => setNewBot(e.target.value)}
            placeholder="Add bot username to ignore"
            style={{ padding: "5px", marginRight: "10px" }}
          />
          <button type="submit" style={{ padding: "5px 10px" }}>
            Add Bot
          </button>
        </form>
        <div style={{ marginTop: "10px" }}>
          <button
            onClick={stopTTS}
            style={{ padding: "5px 10px", marginRight: "10px" }}
          >
            Stop TTS
          </button>
          <button
            onClick={toggleMute}
            style={{ padding: "5px 10px", marginRight: "10px" }}
          >
            {isMuted ? "Unmute" : "Mute"}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
            style={{ verticalAlign: "middle" }}
          />
          <span style={{ marginLeft: "5px", color: "white" }}>
            Volume: {volume.toFixed(1)}
          </span>
        </div>
        {aiResponse && (
          <div
            style={{
              marginTop: "10px",
              color: "white",
              background: "rgba(0,0,0,0.7)",
              padding: "10px",
            }}
          >
            AI Response: {aiResponse}
          </div>
        )}
      </div>
    </div>
  );
}
