import { useEffect, useRef, useState, type ReactNode } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { HDRLoader } from 'three/examples/jsm/loaders/HDRLoader.js'
import { cn } from '../../lib/cn'

export const meta = {
  title: 'Lunar Gravity Card',
  description:
    'A black Inzeedo hero card with a photoreal moon, a 60,000-particle gravity ring and a drifting asteroid belt. Drag to orbit and click the moon to release the ring.',
  category: 'cards',
  fullWidth: true,
  thumbnail: true,
}

const MOON_TEXTURE = new URL('./assets/lunar/moon.jpg', import.meta.url).href
const CITY_HDR = new URL('./assets/lunar/city.hdr', import.meta.url).href

const PARTICLE_COUNT = 60_000
const ASTEROID_COUNT = 75

type LunarGravityCardProps = {
  className?: string
  /** Compact rendering used by gallery thumbnails. */
  thumbnail?: boolean
  title?: ReactNode
  description?: string
}

type Asteroid = {
  angle: number
  baseRadius: number
  radialAmplitude: number
  radialSpeed: number
  phase: number
  zOffset: number
  speed: number
  rx: number
  ry: number
  rz: number
  rsx: number
  rsy: number
  rsz: number
  scale: number
}

/** A slightly flattened disc of coloured dust. */
function createParticleField() {
  const positions = new Float32Array(PARTICLE_COUNT * 3)
  const colors = new Float32Array(PARTICLE_COUNT * 3)
  const randoms = new Float32Array(PARTICLE_COUNT)

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const angle = Math.random() * Math.PI * 2
    const spread = Math.pow(Math.random(), 1.5)
    const radius = 2.2 + spread * 2.2
    const thickness = 0.4 - spread * 0.2
    const y = (Math.random() + Math.random() + Math.random() - 1.5) * thickness

    positions[i * 3] = Math.cos(angle) * radius
    positions[i * 3 + 1] = y
    positions[i * 3 + 2] = Math.sin(angle) * radius

    const fade = 1 - spread
    const tint = Math.random()
    let r: number
    let g: number
    let b: number

    if (tint < 0.8) {
      r = 0.25
      g = 0.3
      b = 0.35
    } else if (tint < 0.92) {
      r = 0
      g = 0.6
      b = 0.8
    } else {
      r = 0.6
      g = 0.2
      b = 0.8
    }

    r = Math.min(1, Math.max(0, r + (Math.random() - 0.5) * 0.1))
    g = Math.min(1, Math.max(0, g + (Math.random() - 0.5) * 0.1))
    b = Math.min(1, Math.max(0, b + (Math.random() - 0.5) * 0.1))

    // A handful of brighter sparks keep the ring from looking flat.
    const spark = Math.random() > 0.95 ? 2.5 : 1
    colors[i * 3] = r * fade * spark
    colors[i * 3 + 1] = g * fade * spark
    colors[i * 3 + 2] = b * fade * spark
    randoms[i] = Math.random()
  }

  return { positions, colors, randoms }
}

function createAsteroids(count: number): Asteroid[] {
  const asteroids: Asteroid[] = []

  for (let i = 0; i < count; i++) {
    const baseRadius = 2.8 + Math.random() * 2
    const radialAmplitude = 0.5 + Math.random() * 1.5
    const radialSpeed = 0.15 + Math.random() * 0.25
    const phase = Math.random() * Math.PI * 2
    const angle = Math.random() * Math.PI * 2
    const zOffset = (Math.random() - 0.5) * 0.8
    const speed = (0.04 + Math.random() * 0.08) * (Math.random() > 0.5 ? 1 : -1)
    const spin = () => (Math.random() - 0.5) * 0.05

    asteroids.push({
      angle,
      baseRadius,
      radialAmplitude,
      radialSpeed,
      phase,
      zOffset,
      speed,
      rx: Math.random() * Math.PI,
      ry: Math.random() * Math.PI,
      rz: Math.random() * Math.PI,
      rsx: spin(),
      rsy: spin(),
      rsz: spin(),
      scale: 0.02 + Math.pow(Math.random(), 4) * 0.18,
    })
  }

  return asteroids.sort((a, b) => b.scale - a.scale)
}

export default function LunarGravityCard({
  className,
  thumbnail = false,
  title,
  description = "Inzeedo renders real-time astrophysics straight into your product. Zero configuration, fully interactive, and flawlessly smooth.",
}: LunarGravityCardProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const engineRef = useRef<{ reset: () => void } | null>(null)
  const [activated, setActivated] = useState(false)

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    let disposed = false

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFShadowMap
    renderer.domElement.style.display = 'block'
    renderer.domElement.style.width = '100%'
    renderer.domElement.style.height = '100%'
    renderer.domElement.style.touchAction = 'none'
    renderer.domElement.style.cursor = 'grab'
    container.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
    camera.position.set(0, 4, 10)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableZoom = false
    controls.enablePan = false
    controls.autoRotate = false
    controls.enableDamping = true

    scene.add(new THREE.AmbientLight(0xffffff, 0.02))

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.5)
    keyLight.position.set(8, 5, 5)
    keyLight.castShadow = true
    keyLight.shadow.mapSize.set(2048, 2048)
    keyLight.shadow.camera.near = 0.5
    keyLight.shadow.camera.far = 40
    keyLight.shadow.camera.left = -7
    keyLight.shadow.camera.right = 7
    keyLight.shadow.camera.top = 7
    keyLight.shadow.camera.bottom = -7
    scene.add(keyLight)

    const rimLight = new THREE.DirectionalLight(0x4a90e2, 0.15)
    rimLight.position.set(-5, -3, -5)
    scene.add(rimLight)

    // A city HDRI is bundled locally so the lighting stays identical offline.
    const environmentLoader = new HDRLoader()
    environmentLoader.load(CITY_HDR, (hdr) => {
      if (disposed) {
        hdr.dispose()
        return
      }
      hdr.mapping = THREE.EquirectangularReflectionMapping
      const pmrem = new THREE.PMREMGenerator(renderer)
      scene.environment = pmrem.fromEquirectangular(hdr).texture
      hdr.dispose()
      pmrem.dispose()
    })

    const textureLoader = new THREE.TextureLoader()
    const moonTexture = textureLoader.load(MOON_TEXTURE)
    moonTexture.colorSpace = THREE.SRGBColorSpace
    moonTexture.anisotropy = renderer.capabilities.getMaxAnisotropy()

    const world = new THREE.Group()
    world.rotation.x = Math.PI / 8
    scene.add(world)

    // --- Moon ---------------------------------------------------------------

    const moon = new THREE.Mesh(
      new THREE.SphereGeometry(2, 64, 64),
      new THREE.MeshStandardMaterial({
        map: moonTexture,
        bumpMap: moonTexture,
        bumpScale: 0.02,
        roughness: 0.8,
        metalness: 0.1,
      }),
    )
    moon.castShadow = true
    moon.receiveShadow = true
    world.add(moon)

    // --- Particle ring ------------------------------------------------------

    const { positions, colors, randoms } = createParticleField()
    const particleGeometry = new THREE.BufferGeometry()
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    particleGeometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1))

    const particleUniforms = {
      uProgress: { value: 0 },
      uAsteroids: { value: new Float32Array(ASTEROID_COUNT * 4) },
      time: { value: 0 },
    }

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.008,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })

    particleMaterial.onBeforeCompile = (shader) => {
      shader.uniforms.uProgress = particleUniforms.uProgress
      shader.uniforms.uAsteroids = particleUniforms.uAsteroids
      shader.uniforms.time = particleUniforms.time

      shader.vertexShader = `
        uniform float uProgress;
        uniform vec4 uAsteroids[${ASTEROID_COUNT}];
        uniform float time;
        attribute float aRandom;
        varying float vProgress;
        ${shader.vertexShader}
      `

      shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        /* glsl */ `
        vec3 transformed = vec3(position);

        float angle = atan(transformed.x, transformed.z);
        float normalizedAngle = abs(angle) / 3.14159265359;
        float spawnThreshold = 1.0 - normalizedAngle;

        float progressValue = (uProgress * 1.4) - spawnThreshold;
        float particleProgress = smoothstep(0.0, 0.4, progressValue);
        vProgress = particleProgress;

        transformed.y += sin(angle * 10.0 + time) * 0.05 * aRandom;

        if (uProgress > 0.5) {
          for (int i = 0; i < ${ASTEROID_COUNT}; i++) {
            vec4 astData = uAsteroids[i];
            vec3 delta = transformed - astData.xyz;
            float dist = length(delta);

            float rad = astData.w * 2.0 + 0.15;

            if (dist < rad) {
              float force = pow((rad - dist) / rad, 2.0);
              transformed += normalize(delta) * force * 0.4;
              transformed.y += force * 0.20 * (aRandom - 0.5);
            }
          }
        }

        float swirl = (1.0 - particleProgress) * 4.0;
        float s = sin(swirl);
        float c = cos(swirl);
        transformed.xz = mat2(c, -s, s, c) * transformed.xz;

        transformed.y += (1.0 - particleProgress) * (transformed.y >= 0.0 ? 1.0 : -1.0);

        vec3 moonSurface = normalize(transformed) * 2.1;
        transformed = mix(moonSurface, transformed, particleProgress);
      `,
      )

      shader.fragmentShader = `
        varying float vProgress;
        ${shader.fragmentShader}
      `

      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <color_fragment>',
        /* glsl */ `
        #include <color_fragment>
        diffuseColor.a *= vProgress;
      `,
      )
    }

    const particles = new THREE.Points(particleGeometry, particleMaterial)
    particles.rotation.x = -Math.PI / 2
    world.add(particles)

    // --- Asteroid belt ------------------------------------------------------

    const asteroids = createAsteroids(ASTEROID_COUNT)
    const asteroidGeometry = new THREE.DodecahedronGeometry(1, 0)
    const asteroidMaterial = new THREE.MeshStandardMaterial({
      map: moonTexture,
      bumpMap: moonTexture,
      bumpScale: 0.08,
      color: 0xffffff,
      roughness: 0.7,
      metalness: 0.1,
    })
    const asteroidMesh = new THREE.InstancedMesh(
      asteroidGeometry,
      asteroidMaterial,
      ASTEROID_COUNT,
    )
    asteroidMesh.castShadow = true
    asteroidMesh.receiveShadow = true
    asteroidMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    asteroidMesh.visible = false
    world.add(asteroidMesh)

    // --- Interaction --------------------------------------------------------

    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()
    const dummy = new THREE.Object3D()
    const scratch = new THREE.Vector3()
    const inverseParticles = new THREE.Matrix4()

    let ringActivated = false
    let ringProgress = 0
    let asteroidScale = 0
    let pointerDown: { x: number; y: number } | null = null
    let dragging = false

    const activate = () => {
      if (ringActivated) return
      ringActivated = true
      setActivated(true)
    }

    engineRef.current = {
      reset: () => {
        ringActivated = false
        ringProgress = 0
        setActivated(false)
      },
    }

    const setPointer = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect()
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(pointer, camera)
    }

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return
      pointerDown = { x: event.clientX, y: event.clientY }
      dragging = false
      renderer.domElement.style.cursor = 'grabbing'
    }

    const onPointerUp = (event: PointerEvent) => {
      const start = pointerDown
      pointerDown = null
      renderer.domElement.style.cursor = 'grab'
      if (!start) return
      const moved = Math.hypot(event.clientX - start.x, event.clientY - start.y)
      if (moved > 6) return
      setPointer(event)
      if (raycaster.intersectObject(moon, false).length > 0) activate()
    }

    const onPointerMove = (event: PointerEvent) => {
      if (pointerDown) {
        const moved = Math.hypot(event.clientX - pointerDown.x, event.clientY - pointerDown.y)
        if (moved > 6) dragging = true
      }
      if (dragging || ringActivated) {
        renderer.domElement.style.cursor = dragging ? 'grabbing' : 'grab'
        return
      }
      setPointer(event)
      const overMoon = raycaster.intersectObject(moon, false).length > 0
      renderer.domElement.style.cursor = overMoon ? 'pointer' : 'grab'
    }

    const onPointerLeave = () => {
      if (!pointerDown) renderer.domElement.style.cursor = 'grab'
    }

    renderer.domElement.addEventListener('pointerdown', onPointerDown)
    renderer.domElement.addEventListener('pointerup', onPointerUp)
    renderer.domElement.addEventListener('pointermove', onPointerMove)
    renderer.domElement.addEventListener('pointerleave', onPointerLeave)

    // --- Resize -------------------------------------------------------------

    const resize = () => {
      const width = container.clientWidth
      const height = container.clientHeight
      if (!width || !height) return
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    }

    const observer = new ResizeObserver(resize)
    observer.observe(container)
    resize()

    // --- Loop ---------------------------------------------------------------

    const startedAt = performance.now()
    let lastFrame = startedAt
    let frame = 0

    const animate = (now: number) => {
      frame = requestAnimationFrame(animate)
      const delta = Math.min((now - lastFrame) / 1000, 1 / 20)
      const elapsed = (now - startedAt) / 1000
      lastFrame = now

      moon.rotation.y += delta * 0.05
      controls.update()

      if (ringActivated) {
        ringProgress = Math.min(1, ringProgress + delta * 0.35)
      } else {
        ringProgress = 0
      }
      particleUniforms.uProgress.value = ringProgress
      particleUniforms.time.value = elapsed

      // Ring dust slowly turns; the asteroid uniforms are converted back into
      // the particle mesh's local space so impacts line up with the asteroids.
      particles.rotation.y -= delta * 0.02
      particles.updateMatrix()
      inverseParticles.copy(particles.matrix).invert()

      const asteroidPositions = particleUniforms.uAsteroids.value

      const targetScale = ringActivated ? 1 : 0
      const scaleSpeed = ringActivated ? 2 : 5
      asteroidScale += (targetScale - asteroidScale) * Math.min(1, delta * scaleSpeed)

      if (asteroidScale < 0.01) {
        asteroidMesh.visible = false
      } else {
        asteroidMesh.visible = true
        for (let i = 0; i < asteroids.length; i++) {
          const asteroid = asteroids[i]
          asteroid.angle += asteroid.speed * delta
          asteroid.phase += asteroid.radialSpeed * delta

          let radius = asteroid.baseRadius + Math.sin(asteroid.phase) * asteroid.radialAmplitude
          if (radius < 2.15) radius = 2.15 + (2.15 - radius) * 0.85

          const x = Math.cos(asteroid.angle) * radius
          const y = Math.sin(asteroid.angle) * radius

          dummy.position.set(x, y, asteroid.zOffset)
          asteroid.rx += asteroid.rsx * delta * 60
          asteroid.ry += asteroid.rsy * delta * 60
          asteroid.rz += asteroid.rsz * delta * 60
          dummy.rotation.set(asteroid.rx, asteroid.ry, asteroid.rz)
          dummy.scale.setScalar(asteroid.scale * asteroidScale)
          dummy.updateMatrix()
          asteroidMesh.setMatrixAt(i, dummy.matrix)

          scratch.set(x, y, asteroid.zOffset).applyMatrix4(inverseParticles)
          asteroidPositions[i * 4] = scratch.x
          asteroidPositions[i * 4 + 1] = scratch.y
          asteroidPositions[i * 4 + 2] = scratch.z
          asteroidPositions[i * 4 + 3] = asteroid.scale
        }
        asteroidMesh.instanceMatrix.needsUpdate = true
      }

      renderer.render(scene, camera)
    }

    frame = requestAnimationFrame(animate)

    return () => {
      disposed = true
      cancelAnimationFrame(frame)
      observer.disconnect()
      controls.dispose()
      renderer.domElement.removeEventListener('pointerdown', onPointerDown)
      renderer.domElement.removeEventListener('pointerup', onPointerUp)
      renderer.domElement.removeEventListener('pointermove', onPointerMove)
      renderer.domElement.removeEventListener('pointerleave', onPointerLeave)
      engineRef.current = null

      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Points) {
          object.geometry.dispose()
          const materials = Array.isArray(object.material) ? object.material : [object.material]
          for (const material of materials) material.dispose()
        }
      })
      scene.environment?.dispose()
      moonTexture.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [])

  return (
    <div className={cn('mx-auto w-full max-w-[1000px]', className)}>
      <div
        className={cn(
          'relative flex w-full overflow-hidden border border-white/[0.08] bg-black shadow-[0_30px_100px_rgba(0,0,0,0.4)]',
          thumbnail
            ? 'h-[210px] min-h-0 flex-row rounded-[1.6rem]'
            : 'min-h-[700px] flex-col rounded-[2.5rem] md:min-h-0 md:h-[540px] md:flex-row',
        )}
      >
        <div
          className={cn(
            'pointer-events-none absolute z-10 bg-gradient-to-b from-black via-black/90 to-transparent',
            thumbnail
              ? 'inset-y-0 left-0 w-[60%] bg-gradient-to-r'
              : 'top-0 left-0 h-[60%] w-full md:inset-y-0 md:left-0 md:h-full md:w-[60%] md:bg-gradient-to-r',
          )}
        />

        <div
          className={cn(
            'pointer-events-none relative z-20 flex flex-col justify-center',
            thumbnail ? 'w-1/2 px-7 py-0' : 'w-full px-10 py-12 md:w-[45%] md:p-0 md:pl-16',
          )}
        >
          <h2
            className={cn(
              'font-bold tracking-tighter',
              thumbnail
                ? 'mb-2 text-[2.15rem] leading-[0.9]'
                : 'mb-6 text-[clamp(3.2rem,7.4vw,5.5rem)] leading-[0.9]',
            )}
          >
            {title ?? (
              <>
                <span className="text-zinc-50 drop-shadow-sm">Inzeedo</span>
                <br />
                <span className="bg-gradient-to-b from-white via-zinc-400 to-zinc-800 bg-clip-text text-transparent drop-shadow-md">
                  Gravity.
                </span>
              </>
            )}
          </h2>

          <p
            className={cn(
              'font-medium text-zinc-400',
              thumbnail
                ? 'line-clamp-2 max-w-[220px] text-[10px] leading-4'
                : 'max-w-[340px] text-base leading-relaxed md:text-lg',
            )}
          >
            {description}
          </p>

          {!thumbnail && (
            <div className="mt-8 hidden items-center gap-2 text-[11px] font-medium tracking-wide text-zinc-500 md:flex">
              <span
                className={cn(
                  'size-1.5 rounded-full',
                  activated ? 'bg-emerald-400' : 'animate-pulse bg-zinc-400',
                )}
              />
              {activated ? 'Gravity ring active · drag to orbit' : 'Click the moon to release the ring'}
            </div>
          )}
        </div>

        <div
          className={cn(
            'z-0 flex items-center justify-center',
            thumbnail
              ? 'absolute top-0 right-0 h-full w-[62%]'
              : 'relative h-[450px] w-full md:absolute md:top-0 md:right-0 md:h-full md:w-[65%]',
          )}
        >
          <div ref={mountRef} className="absolute inset-0 size-full" aria-hidden="true" />
        </div>

        <button
          type="button"
          onClick={() => engineRef.current?.reset()}
          aria-label="Reset the gravity ring"
          title="Reset the gravity ring"
          className={cn(
            'absolute z-30 flex items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50 backdrop-blur-md transition-all hover:scale-110 hover:bg-white/10 hover:text-white',
            thumbnail ? 'top-3 right-3 size-7' : 'top-6 right-6 size-10 md:top-8 md:right-8',
          )}
        >
          <svg
            width={thumbnail ? 13 : 18}
            height={thumbnail ? 13 : 18}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            <path d="M2 12h20" />
          </svg>
        </button>

        {!thumbnail && (
          <a
            href="https://inzeedo.lk"
            target="_blank"
            rel="noreferrer"
            className="absolute right-7 bottom-6 z-30 font-mono text-[10px] tracking-[0.22em] text-white/25 uppercase transition hover:text-white/60"
          >
            inzeedo.lk
          </a>
        )}
      </div>
    </div>
  )
}
