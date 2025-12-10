<template>
  <div class="counter-block py-4 ">

    <div class="container ">
      <div class="row justify-content-center ">
        <div class="col-12">
          <div class="bg-green text-brown rounded-edges ">
            <div class="row">
        <div 
          v-for="(item, index) in counterItems" 
          :key="index"
          :class="getColumnClass(counterItems.length)"
          class=" my-4 pb-2 "
        >
          <div class="mb-2 pt-2 counter-item text-center h-100 d-flex flex-column justify-content-center">
            <div class="counter-number-wrapper">
              <span 
                class="counter-number color-brown font-weight-black "
                :data-target="item.number"
                ref="counterNumbers"
              >
                0
              </span>
            </div>
            <h4 class="counter-text color-brown text-uppercase mb-0">{{ item.title }}</h4>
          </div>
        </div>
        </div></div></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'

interface CounterItem {
  number: number
  title: string
}

interface Props {
  title?: string
  counterItems?: CounterItem[]
}

const props = withDefaults(defineProps<Props>(), {
  counterItems: () => []
})

const counterNumbers = ref<HTMLElement[]>([])

const getColumnClass = (itemCount: number): string => {
  if (itemCount === 1) {
    return 'col-12'
  } else if (itemCount <= 4) {
    return 'col-lg-3 col-md-6 col-sm-6'
  } else {
    return 'col-lg-3 col-md-4 col-sm-6'
  }
}

const animateCounter = (element: HTMLElement, target: number, duration: number = 2000) => {
  let start = 0
  const startTime = performance.now()
  
  const animate = (currentTime: number) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    
    // Easing function for smooth animation
    const easeOutQuart = 1 - Math.pow(1 - progress, 4)
    const current = Math.floor(start + (target - start) * easeOutQuart)
    
    element.textContent = current.toLocaleString()
    
    if (progress < 1) {
      requestAnimationFrame(animate)
    } else {
      element.textContent = target.toLocaleString()
    }
  }
  
  requestAnimationFrame(animate)
}

const startCounterAnimation = () => {
  nextTick(() => {
    counterNumbers.value.forEach((element, index) => {
      if (element && props.counterItems[index]) {
        const target = props.counterItems[index].number
        // Stagger the animations slightly
        setTimeout(() => {
          animateCounter(element, target)
        }, index * 200)
      }
    })
  })
}

const isInViewport = (element: HTMLElement): boolean => {
  const rect = element.getBoundingClientRect()
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  )
}

const handleScroll = () => {
  const firstCounter = counterNumbers.value[0]
  if (firstCounter && isInViewport(firstCounter)) {
    startCounterAnimation()
    window.removeEventListener('scroll', handleScroll)
  }
}

onMounted(() => {
  nextTick(() => {
    // Check if counters are already in viewport
    const firstCounter = counterNumbers.value[0]
    if (firstCounter && isInViewport(firstCounter)) {
      startCounterAnimation()
    } else {
      // Wait for scroll to trigger animation
      window.addEventListener('scroll', handleScroll)
    }
  })
})
</script>
<style lang="scss" scoped>
.counter-number {
  font-size: 3.4375rem; // 55px = 55/16 = 3.4375rem
}
.counter-text {
  font-size: 0.875rem; // 14px = 14/16 = 0.875rem
  color: var(--nordex-brown);
  font-weight: 500;
}
</style>