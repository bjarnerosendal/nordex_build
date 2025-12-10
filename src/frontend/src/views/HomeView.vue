<template>
  <div class="home">
    <!-- Hero Carousel Section -->
    <section class="hero-carousel-section  components: {
    HeroCarousel,
    ProductCarousel,
  },5">
      <HeroCarousel
        :hero-items="heroCarouselItems"
        :auto-scroll="true"
      />
    </section>

    <FeaturedContent 
      title="Featured Content"
      :items="featuredItems" 
    />

  
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import HeroCarousel from '../components/Carousel/HeroCarousel.vue';
import ArticleCarousel from '../components/Carousel/ArticleCarousel.vue';
import FeaturedContent from '../components/FeaturedContent.vue';

interface FeaturedItem {
  title: string;
  description: string;
  link: string;
}

interface CarouselItem {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
  link: string;
}

export default defineComponent({
  name: 'HomeView',
  components: {
    HeroCarousel,
    ArticleCarousel,
    FeaturedContent,
  },
  data() {
    return {
      featuredItems: [
        {
          title: 'Article One',
          description: 'This is a wider card with supporting text below as a natural lead-in to additional content.',
          link: '/content/1'
        },
        {
          title: 'Article Two',
          description: 'This card has even longer content than the first to show that equal height action.',
          link: '/content/2'
        },
        {
          title: 'Article Three',
          description: 'This is a wider card with supporting text below as a natural lead-in to additional content.',
          link: '/content/3'
        }
      ] as FeaturedItem[],
      heroCarouselItems: [
        {
          headline: 'Welcome to NordexFood',
          subheading: 'Premium Quality Food Products',
          description: 'Discover our exceptional range of organic and locally sourced food products that bring the best flavors to your table.',
          heroImage: {
            url: 'https://via.placeholder.com/1200x600/2E8B57/white?text=Fresh+Organic+Foods',
            alt: 'Fresh organic foods'
          },
          link: [
            {
              url: '/products',
              name: 'Shop Now',
              target: ''
            },
            {
              url: '/about',
              name: 'Learn More',
              target: ''
            }
          ]
        },
        {
          headline: 'Farm Fresh Ingredients',
          subheading: 'Direct from Our Partners',
          description: 'We work directly with local farmers to bring you the freshest ingredients, supporting sustainable agriculture and community growth.',
          heroImage: {
            url: 'https://via.placeholder.com/1200x600/FF6347/white?text=Farm+Fresh',
            alt: 'Farm fresh ingredients'
          },
          link: [
            {
              url: '/suppliers',
              name: 'Our Partners',
              target: ''
            }
          ]
        },
        {
          headline: 'Sustainable Practices',
          subheading: 'Environment First',
          description: 'Our commitment to sustainability ensures that every product we offer is not only delicious but also environmentally responsible.',
          heroImage: {
            url: 'https://via.placeholder.com/1200x600/32CD32/white?text=Sustainable',
            alt: 'Sustainable practices'
          },
          link: [
            {
              url: '/sustainability',
              name: 'Learn About Sustainability',
              target: ''
            }
          ]
        }
      ],
      carouselItems: [
        {
          id: 1,
          name: 'Premium Coffee Beans',
          price: 24.99,
          description: 'Freshly roasted premium coffee beans from sustainable farms.',
          image: 'https://via.placeholder.com/300x200/8B4513/white?text=Coffee+Beans',
          link: '/products/coffee-beans'
        },
        {
          id: 2,
          name: 'Organic Green Tea',
          price: 18.99,
          description: 'Hand-picked organic green tea leaves with antioxidants.',
          image: 'https://via.placeholder.com/300x200/228B22/white?text=Green+Tea',
          link: '/products/green-tea'
        },
        {
          id: 3,
          name: 'Artisan Chocolate',
          price: 32.99,
          description: 'Handcrafted dark chocolate made with finest cocoa.',
          image: 'https://via.placeholder.com/300x200/8B4513/white?text=Chocolate',
          link: '/products/chocolate'
        },
        {
          id: 4,
          name: 'Honey Varieties',
          price: 16.99,
          description: 'Pure natural honey from local beekeepers.',
          image: 'https://via.placeholder.com/300x200/FFD700/black?text=Honey',
          link: '/products/honey'
        },
        {
          id: 5,
          name: 'Spice Collection',
          price: 28.99,
          description: 'Exotic spices from around the world for culinary adventures.',
          image: 'https://via.placeholder.com/300x200/DC143C/white?text=Spices',
          link: '/products/spices'
        }
      ] as CarouselItem[]
    };
  }
});
</script>

<style lang="scss" scoped>
.home {
  padding-top: 80px; // Account for fixed header
}

.hero-carousel-section {
  margin-bottom: 3rem;
}

.carousel-section {
  h2 {
    text-align: center;
    color: #333;
    font-weight: 600;
    margin-bottom: 2rem;
  }
}

@media (max-width: 768px) {
  .home {
    padding-top: 60px;
  }
  
  .carousel-section {
    padding: 1rem 0;
  }
}
</style>
