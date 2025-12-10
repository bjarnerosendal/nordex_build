<template>
  <div class="carousel-examples">
    <h1>Card Carousel Examples</h1>

    <!-- Basic Example -->
    <section class="example-section">
      <h2>Basic Carousel</h2>
      <CardCarousel 
        :items="basicItems" 
        title="Product Showcase"
        :show-controls="true"
        :show-dots="true"
      >
        <template #slide="{ item, index }">
          <div class="product-card">
            <img :src="item.image" :alt="item.name" class="product-image" />
            <h3>{{ item.name }}</h3>
            <p class="price">${{ item.price }}</p>
            <p>{{ item.description }}</p>
          </div>
        </template>
      </CardCarousel>
    </section>

    <!-- Auto-scroll Example -->
    <section class="example-section">
      <h2>Auto-scroll Carousel</h2>
      <CardCarousel 
        :items="testimonials" 
        title="Customer Testimonials"
        :auto-scroll="true"
        :show-controls="false"
        class="primary"
      >
        <template #slide="{ item }">
          <div class="testimonial-card">
            <blockquote>"{{ item.quote }}"</blockquote>
            <div class="author">
              <img :src="item.avatar" :alt="item.name" class="avatar" />
              <div>
                <h4>{{ item.name }}</h4>
                <p>{{ item.title }}</p>
              </div>
            </div>
          </div>
        </template>
      </CardCarousel>
    </section>

    <!-- Themed Example -->
    <section class="example-section">
      <h2>Themed Carousel</h2>
      <CardCarousel 
        :items="features" 
        title="Key Features"
        class="success"
        :show-dots="true"
      >
        <template #slide="{ item }">
          <div class="feature-card">
            <div class="icon">{{ item.icon }}</div>
            <h3>{{ item.title }}</h3>
            <p>{{ item.description }}</p>
            <ul>
              <li v-for="benefit in item.benefits" :key="benefit">{{ benefit }}</li>
            </ul>
          </div>
        </template>
      </CardCarousel>
    </section>
  </div>
</template>

<script setup>
import CardCarousel from './CardCarousel.vue'

// Sample data
const basicItems = [
  {
    id: 1,
    name: "Wireless Headphones",
    price: 99.99,
    description: "Premium sound quality with noise cancellation",
    image: "https://via.placeholder.com/200x150/007bff/white?text=Headphones"
  },
  {
    id: 2,
    name: "Smart Watch",
    price: 199.99,
    description: "Track your fitness and stay connected",
    image: "https://via.placeholder.com/200x150/28a745/white?text=Watch"
  },
  {
    id: 3,
    name: "Laptop Stand",
    price: 49.99,
    description: "Ergonomic design for better productivity",
    image: "https://via.placeholder.com/200x150/ffc107/white?text=Stand"
  },
  {
    id: 4,
    name: "USB-C Hub",
    price: 79.99,
    description: "Expand your connectivity options",
    image: "https://via.placeholder.com/200x150/dc3545/white?text=Hub"
  }
]

const testimonials = [
  {
    id: 1,
    quote: "This product completely transformed our workflow. Highly recommended!",
    name: "Sarah Johnson",
    title: "Product Manager",
    avatar: "https://via.placeholder.com/50x50/007bff/white?text=SJ"
  },
  {
    id: 2,
    quote: "Excellent customer service and amazing quality. Will buy again!",
    name: "Mike Chen",
    title: "Developer",
    avatar: "https://via.placeholder.com/50x50/28a745/white?text=MC"
  },
  {
    id: 3,
    quote: "Fast delivery and exactly what I was looking for. Perfect!",
    name: "Emily Rodriguez",
    title: "Designer",
    avatar: "https://via.placeholder.com/50x50/ffc107/white?text=ER"
  }
]

const features = [
  {
    id: 1,
    icon: "🚀",
    title: "Fast Performance",
    description: "Lightning-fast load times and smooth interactions",
    benefits: ["Optimized code", "CDN delivery", "Caching enabled"]
  },
  {
    id: 2,
    icon: "🔒",
    title: "Secure & Reliable",
    description: "Bank-level security with 99.9% uptime guarantee",
    benefits: ["SSL encryption", "Regular backups", "24/7 monitoring"]
  },
  {
    id: 3,
    icon: "📱",
    title: "Mobile Responsive",
    description: "Perfect experience across all devices and screen sizes",
    benefits: ["Responsive design", "Touch-friendly", "Cross-browser"]
  },
  {
    id: 4,
    icon: "💡",
    title: "Easy to Use",
    description: "Intuitive interface that anyone can master",
    benefits: ["Clean UI", "Documentation", "Support team"]
  }
]
</script>

<style scoped>
.carousel-examples {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.example-section {
  margin-bottom: 3rem;
}

.example-section h2 {
  margin-bottom: 1rem;
  color: #333;
}

/* Product Card Styles */
.product-card {
  text-align: center;
  padding: 1.5rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-width: 300px;
  margin: 0 auto;
}

.product-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 0.25rem;
  margin-bottom: 1rem;
}

.product-card h3 {
  margin: 0 0 0.5rem;
  color: #333;
  font-size: 1.2rem;
}

.price {
  font-size: 1.5rem;
  font-weight: bold;
  color: #007bff;
  margin: 0 0 0.5rem;
}

.product-card p {
  color: #666;
  margin: 0;
}

/* Testimonial Card Styles */
.testimonial-card {
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  margin: 0 auto;
}

.testimonial-card blockquote {
  font-size: 1.1rem;
  font-style: italic;
  color: #333;
  margin: 0 0 1.5rem;
  line-height: 1.6;
}

.author {
  display: flex;
  align-items: center;
  gap: 1rem;
  justify-content: center;
}

.avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
}

.author h4 {
  margin: 0;
  color: #333;
}

.author p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

/* Feature Card Styles */
.feature-card {
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-width: 350px;
  margin: 0 auto;
}

.icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  margin: 0 0 1rem;
  color: #333;
  font-size: 1.3rem;
}

.feature-card p {
  color: #666;
  margin: 0 0 1rem;
  line-height: 1.5;
}

.feature-card ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.feature-card li {
  color: #28a745;
  margin-bottom: 0.5rem;
  position: relative;
  padding-left: 1rem;
}

.feature-card li::before {
  content: "✓";
  position: absolute;
  left: 0;
  color: #28a745;
  font-weight: bold;
}
</style>
