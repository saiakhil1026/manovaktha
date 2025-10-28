import React, { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import ManoVakthaIcon from './icons/ManoVakthaIcon';
import { useLanguage } from '../contexts/LanguageContext';

interface IntroAnimationProps {
  onEnter: () => void;
  isExiting: boolean;
}

const IntroAnimation: React.FC<IntroAnimationProps> = ({ onEnter, isExiting }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [uiVisible, setUiVisible] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const timer = setTimeout(() => {
      setUiVisible(true);
    }, 1000);

    const currentMount = mountRef.current;
    if (!currentMount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 9);
    scene.add(camera);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    currentMount.appendChild(renderer.domElement);

    const parameters = {
      count: 250000,
      size: 0.015,
      coreRadius: 1.5,
      jetLength: 8,
      jetRandomness: 3.5,
      insideColor: '#ffb700',
      outsideColor: '#0d1a2f',
    };

    let points: THREE.Points | null = null;

    const generateGalaxy = () => {
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(parameters.count * 3);
      const colors = new Float32Array(parameters.count * 3);
      const colorInside = new THREE.Color(parameters.insideColor);
      const colorOutside = new THREE.Color(parameters.outsideColor);
      const coreGeometry = new THREE.IcosahedronGeometry(parameters.coreRadius, 5);
      const coreVertices = coreGeometry.attributes.position.array;
      const coreVertexCount = coreVertices.length / 3;

      for (let i = 0; i < parameters.count; i++) {
        const i3 = i * 3;
        const randomVertexIndex = Math.floor(Math.random() * coreVertexCount);
        const startVec = new THREE.Vector3(
          coreVertices[randomVertexIndex * 3], 
          coreVertices[randomVertexIndex * 3 + 1], 
          coreVertices[randomVertexIndex * 3 + 2]
        );
        const direction = startVec.clone().normalize();
        const distance = parameters.coreRadius + Math.random() * parameters.jetLength;
        const finalVec = direction.clone().multiplyScalar(distance);
        const randomnessFactor = Math.pow(Math.random(), 2) * (distance / parameters.jetLength);
        const randomX = (Math.random() - 0.5) * parameters.jetRandomness * randomnessFactor;
        const randomY = (Math.random() - 0.5) * parameters.jetRandomness * randomnessFactor;
        const randomZ = (Math.random() - 0.5) * parameters.jetRandomness * randomnessFactor;
        finalVec.add(new THREE.Vector3(randomX, randomY, randomZ));

        if (Math.random() < 0.2) {
          finalVec.multiplyScalar(Math.random());
        }

        positions[i3] = finalVec.x;
        positions[i3 + 1] = finalVec.y;
        positions[i3 + 2] = finalVec.z;

        const distanceFromCenter = finalVec.length();
        const mixedColor = colorInside.clone();
        mixedColor.lerp(colorOutside, distanceFromCenter / (parameters.jetLength + parameters.coreRadius));
        colors[i3] = mixedColor.r;
        colors[i3 + 1] = mixedColor.g;
        colors[i3 + 2] = mixedColor.b;
      }
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      const material = new THREE.PointsMaterial({
        size: parameters.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
      });
      points = new THREE.Points(geometry, material);
      scene.add(points);
    };

    generateGalaxy();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };
    window.addEventListener('resize', handleResize);

    const clock = new THREE.Clock();
    let animationFrameId: number;
    const tick = () => {
      const elapsedTime = clock.getElapsedTime();
      if (points) {
        points.rotation.y = elapsedTime * 0.04;
        points.rotation.x = elapsedTime * 0.01;
      }
      renderer.render(scene, camera);
      animationFrameId = window.requestAnimationFrame(tick);
    };
    tick();

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (currentMount && renderer.domElement.parentNode) {
        currentMount.removeChild(renderer.domElement);
      }
      points?.geometry.dispose();
      (points?.material as THREE.PointsMaterial).dispose();
      renderer.dispose();
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className={`fixed inset-0 bg-black transition-opacity duration-1000 ${isExiting ? 'opacity-0' : 'opacity-100'}`}>
      <div ref={mountRef} className="absolute inset-0" />
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center text-center transition-all duration-1000 ${uiVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}
      >
        <ManoVakthaIcon className="w-24 h-24 text-[#D4AF37]" />
        <h1 className="text-5xl sm:text-6xl font-sanskrit tracking-wider text-white mt-4">Mano Vaktha</h1>
        <p className="text-xl text-amber-200 mt-2">{t('yourWellnessCompanion')}</p>
        
        <div className={`transition-opacity duration-1000 delay-1000 ${uiVisible ? 'opacity-100' : 'opacity-0'}`}>
           <button 
             onClick={onEnter}
             className="mt-12 bg-[#8C5A2A] text-[#FBF5E9] font-bold py-3 px-8 rounded-lg text-xl hover:bg-[#4A2C2A] border border-[#D4AF37] shadow-lg shadow-amber-500/20 transform hover:scale-105 transition-all duration-300"
             aria-label="Enter the application"
           >
             {t('enter')}
           </button>
        </div>
      </div>
    </div>
  );
};

export default IntroAnimation;