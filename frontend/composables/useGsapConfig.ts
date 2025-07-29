export const useGsapConfig = () => ({
  // info.vue
  aboutSection: {
    from: { opacity: 0, y: 50 },
    to: { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', scrollTrigger: { start: 'top 80%' } }
  },
  heroImg: {
    from: { opacity: 0, scale: 0.95 },
    to: { opacity: 1, scale: 1, duration: 1, ease: 'power3.out' }
  },
  // archive/[...slug].vue
  archiveMedia: {
    from: { opacity: 0, scale: 0.8 },
    to: { opacity: 1, scale: 1, duration: 0.8, ease: 'power1.out' }
  },
  archiveMediaFade: {
    from: { opacity: 0 },
    to: { opacity: 1, duration: 0.8, ease: 'power1.out' }
  },
  // index.vue
  masonryRollback: {
    from: { opacity: 0.3, scale: 0.8 },
    to: { opacity: 1, scale: 1, duration: 0.4, ease: 'power1.out' }
  },
  // MasonryGrid.vue
  masonryIn: {
    to: { scale: 1, opacity: 1, duration: 0.3, ease: 'power2.out' }
  },
  masonryOut: {
    to: { scale: 0.8, opacity: 0.3, duration: 0.3, ease: 'power2.in' }
  },
  // ParallaxImage.vue
  parallax: {
    to: { y: '-30%', ease: 'none', scrollTrigger: { start: 'top bottom', end: 'bottom top', scrub: true } }
  }
}); 