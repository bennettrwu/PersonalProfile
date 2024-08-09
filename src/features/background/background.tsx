import { useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

import { Engine, IOptions, RecursivePartial } from '@tsparticles/engine';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';

import genParticleConfig from './getParticleConfig';
import ToggleSwitch from '../../components/toggle-switch';

import './background.scss';

export default function Background({ children }: React.PropsWithChildren) {
  const [particleConfig, setParticleConfig] = useState<RecursivePartial<IOptions | undefined>>();

  // default to true if undefined
  const [motionEnabled, _setMotionEnabled] = useState(window.localStorage.getItem('motionEnabled') !== 'false');
  const [particlesEnabled, _setParticlesEnabled] = useState(window.localStorage.getItem('particlesEnabled') !== 'false');

  // Override state update functions to also save to local storage
  const setMotionEnabled = (enabled: boolean) => {
    window.localStorage.setItem('motionEnabled', enabled.toString());

    // Particle config needs to be updated when disabling motion
    setParticleConfig(genParticleConfig(window.innerWidth, window.innerHeight, enabled));
    _setMotionEnabled(enabled);
  };
  const setParticlesEnabled = (enabled: boolean) => {
    window.localStorage.setItem('particlesEnabled', enabled.toString());
    _setParticlesEnabled(enabled);
  };

  // Debounce particle configuration updates
  const updateParticleConfig = useDebouncedCallback(() => {
    const new_config = genParticleConfig(window.innerWidth, window.innerHeight, motionEnabled, particleConfig);
    if (new_config) setParticleConfig(new_config);
  }, 500);
  useEffect(() => {
    // Update particle config on each resize
    window.addEventListener('resize', updateParticleConfig);

    initParticlesEngine(async (engine: Engine) => await loadSlim(engine));
    updateParticleConfig();
  }, [updateParticleConfig]);

  return (
    <>
      <div id='background-gradient'></div>

      {particlesEnabled && <Particles id='tsparticles' options={particleConfig} />}

      <div id='background-particle-config-container'>
        <p>Motion:</p>
        <ToggleSwitch isOn={motionEnabled} onSwitch={setMotionEnabled} />
        <p>Particles:</p>
        <ToggleSwitch isOn={particlesEnabled} onSwitch={setParticlesEnabled} />
      </div>

      <div id='background-content-container'>{children}</div>
    </>
  );
}