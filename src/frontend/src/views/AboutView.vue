<template>
  <div class="about">
    <h1>About NordexFood</h1>
    <div class="row mt-4">
      <div class="col-md-8">
        <p class="lead">
          NordexFood is a leading company in the food industry, dedicated to providing high-quality products.
        </p>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit 
          arcu sed erat molestie vehicula. Sed auctor neque eu tellus rhoncus ut eleifend nibh porttitor. 
          Ut in nulla enim. Phasellus molestie magna non est bibendum non venenatis nisl tempor.
        </p>
        <p>
          Suspendisse dictum feugiat nisl ut dapibus. Mauris iaculis porttitor posuere. Praesent id metus 
          massa, ut blandit odio. Proin quis tortor orci. Etiam at risus et justo dignissim congue.
        </p>
      </div>
      <div class="col-md-4">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">Contact Us</h5>
            <address>
              <strong>NordexFood, Inc.</strong><br>
              1234 Main Street<br>
              Copenhagen, Denmark<br>
              <abbr title="Phone">P:</abbr> +45 12 34 56 78
            </address>
            <address>
              <strong>Email</strong><br>
              <a href="mailto:info@nordexfood.com">info@nordexfood.com</a>
            </address>
          </div>
        </div>
      </div>
    </div>
    
  </div>
   <div class="mt-4 placeholder-content">
      <div class="alert alert-info">
        This is a placeholder for dynamic content that will be loaded from the Umbraco backend.
        The page would typically display the block grid content configured in the Content Page document type.
      </div>
      
      <div class="card mb-4">
        <div class="card-header">
          <h3>Text and Links Example</h3>
        </div>
        <div class="card-body">
          <h4>Sample Headline</h4>
          <div class="rich-text mb-3">
            <p>This is an example of rich text content that would be managed through Umbraco.</p>
            <p>The content editor would be able to format text, add links, and more.</p>
          </div>
          <div class="links">
            <a href="#" class="btn btn-primary me-2">Link 1</a>
            <a href="#" class="btn btn-outline-primary">Link 2</a>
          </div>
        </div>
      </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'AboutView'
});
</script>
