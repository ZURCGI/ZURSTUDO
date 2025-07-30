<template>
  <div ref="containerRef" class="w-full h-full overflow-hidden">
    <!-- 備用圖片顯示 -->
    <img 
      v-if="!threeInitialized" 
      :src="imageSrc" 
      alt="ZUR STUDIO"
      class="w-full h-full object-cover"
      loading="lazy"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  grid: { type: Number, default: 30 },
  mouse: { type: Number, default: 0.1 },
  strength: { type: Number, default: 0.15 },
  relaxation: { type: Number, default: 0.9 },
  imageSrc: { type: String, required: true }
})

const containerRef = ref<HTMLElement | null>(null)
const threeInitialized = ref(false)
const imageAspectRef = ref(1)
let renderer, camera, scene, plane, uniforms, dataTexture, geometry, material

const vertexShader = `
uniform float time;
varying vec2 vUv;
varying vec3 vPosition;
void main() {
  vUv = uv;
  vPosition = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`

const fragmentShader = `
uniform sampler2D uDataTexture;
uniform sampler2D uTexture;
uniform vec4 resolution;
varying vec2 vUv;
void main() {
  vec2 uv = vUv;
  vec4 offset = texture2D(uDataTexture, vUv);
  gl_FragColor = texture2D(uTexture, uv - 0.02 * offset.rg);
}`

onMounted(async () => {
  if (!containerRef.value) {
    console.warn('GridDistortion: Container not found')
    return
  }

  try {
    // 動態導入 Three.js
    const ThreeJS = await import('three')
    const THREE = ThreeJS.default || ThreeJS
    
    console.log('GridDistortion: Three.js loaded successfully')
    
    scene = new THREE.Scene()
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    containerRef.value.appendChild(renderer.domElement)

    camera = new THREE.OrthographicCamera(0, 0, 0, 0, -1000, 1000)
    camera.position.z = 2

    uniforms = {
      time: { value: 0 },
      resolution: { value: new THREE.Vector4() },
      uTexture: { value: null },
      uDataTexture: { value: null }
    }

    const textureLoader = new THREE.TextureLoader()
    textureLoader.load(props.imageSrc, (texture) => {
      texture.minFilter = THREE.LinearFilter
      imageAspectRef.value = texture.image.width / texture.image.height
      uniforms.uTexture.value = texture
      handleResize()
      threeInitialized.value = true
      console.log('GridDistortion: Texture loaded and initialized')
    }, undefined, (error) => {
      console.error('GridDistortion: Failed to load texture:', error)
    })

    const size = props.grid
    const data = new Float32Array(4 * size * size)
    for (let i = 0; i < size * size; i++) {
      data[i * 4] = Math.random() * 255 - 125
      data[i * 4 + 1] = Math.random() * 255 - 125
    }
    dataTexture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat, THREE.FloatType)
    dataTexture.needsUpdate = true
    uniforms.uDataTexture.value = dataTexture

    material = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      uniforms,
      vertexShader,
      fragmentShader
    })
    geometry = new THREE.PlaneGeometry(1, 1, size - 1, size - 1)
    plane = new THREE.Mesh(geometry, material)
    scene.add(plane)

    function handleResize() {
      if (!containerRef.value) return
      const width = containerRef.value.offsetWidth
      const height = containerRef.value.offsetHeight
      const containerAspect = width / height
      const imageAspect = imageAspectRef.value
      renderer.setSize(width, height)
      const scale = Math.max(containerAspect / imageAspect, 1)
      plane.scale.set(imageAspect * scale, scale, 1)
      const frustumHeight = 1
      const frustumWidth = frustumHeight * containerAspect
      camera.left = -frustumWidth / 2
      camera.right = frustumWidth / 2
      camera.top = frustumHeight / 2
      camera.bottom = -frustumHeight / 2
      camera.updateProjectionMatrix()
      uniforms.resolution.value.set(width, height, 1, 1)
    }

    const mouseState = { x: 0, y: 0, prevX: 0, prevY: 0, vX: 0, vY: 0 }
    function handleMouseMove(e) {
      if (!containerRef.value) return
      const rect = containerRef.value.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = 1 - (e.clientY - rect.top) / rect.height
      mouseState.vX = x - mouseState.prevX
      mouseState.vY = y - mouseState.prevY
      Object.assign(mouseState, { x, y, prevX: x, prevY: y })
    }
    function handleMouseLeave() {
      dataTexture.needsUpdate = true
      Object.assign(mouseState, { x: 0, y: 0, prevX: 0, prevY: 0, vX: 0, vY: 0 })
    }

    containerRef.value.addEventListener('mousemove', handleMouseMove)
    containerRef.value.addEventListener('mouseleave', handleMouseLeave)
    window.addEventListener('resize', handleResize)
    handleResize()

    function animate() {
      requestAnimationFrame(animate)
      uniforms.time.value += 0.05
      const data = dataTexture.image.data
      for (let i = 0; i < size * size; i++) {
        data[i * 4] *= props.relaxation
        data[i * 4 + 1] *= props.relaxation
      }
      const gridMouseX = size * mouseState.x
      const gridMouseY = size * mouseState.y
      const maxDist = size * props.mouse
      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          const distance = Math.pow(gridMouseX - i, 2) + Math.pow(gridMouseY - j, 2)
          if (distance < maxDist * maxDist) {
            const index = 4 * (i + size * j)
            const power = Math.min(maxDist / Math.sqrt(distance), 10)
            data[index] += props.strength * 100 * mouseState.vX * power
            data[index + 1] -= props.strength * 100 * mouseState.vY * power
          }
        }
      }
      dataTexture.needsUpdate = true
      renderer.render(scene, camera)
    }
    animate()

    onBeforeUnmount(() => {
      containerRef.value?.removeEventListener('mousemove', handleMouseMove)
      containerRef.value?.removeEventListener('mouseleave', handleMouseLeave)
      window.removeEventListener('resize', handleResize)
      if (renderer) renderer.dispose()
      if (geometry) geometry.dispose()
      if (material) material.dispose()
      if (dataTexture) dataTexture.dispose()
      if (uniforms.uTexture.value) uniforms.uTexture.value.dispose()
    })
  } catch (error) {
    console.error('GridDistortion: Error initializing Three.js:', error)
  }
})
</script> 