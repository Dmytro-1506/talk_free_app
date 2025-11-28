import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import * as THREE from "three";

const LOGO_URL = "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=200&h=200&fit=crop";

export default function Landing() {
  const [phase, setPhase] = useState("loading"); // loading, slogan, logo, auth
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    // Check if already authenticated
    base44.auth.isAuthenticated().then(isAuth => {
      if (isAuth) {
        window.location.href = "/Home";
      } else {
        setIsCheckingAuth(false);
        startAnimation();
      }
    });

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const startAnimation = () => {
    // Phase timing
    setTimeout(() => setPhase("slogan"), 100);
    setTimeout(() => setPhase("logo"), 3500);
    setTimeout(() => setPhase("auth"), 5000);
  };

  useEffect(() => {
    if (phase !== "loading" && phase !== "auth" && canvasRef.current) {
      initThreeJS();
    }
  }, [phase]);

  const initThreeJS = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Create floating spheres representing languages/words
    const spheres = [];
    const sphereGeometry = new THREE.SphereGeometry(0.3, 32, 32);
    
    const colors = [0x667eea, 0x764ba2, 0x4facfe, 0x00f2fe, 0xf093fb];
    
    for (let i = 0; i < 30; i++) {
      const material = new THREE.MeshPhongMaterial({
        color: colors[Math.floor(Math.random() * colors.length)],
        transparent: true,
        opacity: 0.7,
        shininess: 100
      });
      const sphere = new THREE.Mesh(sphereGeometry, material);
      sphere.position.set(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20
      );
      sphere.userData = {
        speed: Math.random() * 0.02 + 0.01,
        amplitude: Math.random() * 2 + 1,
        offset: Math.random() * Math.PI * 2
      };
      spheres.push(sphere);
      scene.add(sphere);
    }

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0x667eea, 1, 100);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    const pointLight2 = new THREE.PointLight(0x764ba2, 1, 100);
    pointLight2.position.set(-5, -5, 5);
    scene.add(pointLight2);

    camera.position.z = 10;

    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);

      const time = Date.now() * 0.001;

      spheres.forEach(sphere => {
        sphere.position.y += Math.sin(time * sphere.userData.speed * 10 + sphere.userData.offset) * 0.02;
        sphere.position.x += Math.cos(time * sphere.userData.speed * 5 + sphere.userData.offset) * 0.01;
        sphere.rotation.x += 0.01;
        sphere.rotation.y += 0.01;
      });

      camera.position.x = Math.sin(time * 0.2) * 2;
      camera.position.y = Math.cos(time * 0.2) * 2;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
    };
  };

  const handleLogin = () => {
    base44.auth.redirectToLogin("/Home");
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden relative">
      {/* 3D Canvas */}
      {phase !== "auth" && (
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      )}

      {/* Content Overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {phase === "slogan" && (
            <motion.div
              key="slogan"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8 }}
              className="text-center px-6"
            >
              <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
                Now anyone can learn
                <br />
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  a foreign language
                </span>
              </h1>
            </motion.div>
          )}

          {phase === "logo" && (
            <motion.div
              key="logo"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className="w-24 h-24 md:w-32 md:h-32 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-purple-500/50">
                <span className="text-4xl md:text-5xl font-bold text-white">TF</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white">Talk Free</h2>
            </motion.div>
          )}

          {phase === "auth" && (
            <motion.div
              key="auth"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center px-6 w-full max-w-md"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-xl">
                <span className="text-3xl font-bold text-white">TF</span>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Talk Free</h2>
              <p className="text-gray-400 mb-8">Start your language learning journey</p>

              <div className="space-y-4">
                <Button
                  onClick={handleLogin}
                  size="lg"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg py-6"
                >
                  Sign In / Register
                </Button>
              </div>

              <p className="text-gray-500 text-sm mt-8">
                By continuing, you agree to our Terms of Service
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}