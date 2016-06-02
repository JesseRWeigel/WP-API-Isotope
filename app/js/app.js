$(function() {


  function isotopeize() {
      var $container = $('.isotope-container'),
      selector;

      $container.isotope({
        itemSelector: '.card',
        layoutMode: 'packery',
        packery: {
          gutter: 20,
          isFitWidth: true
        },
          filter: '*',
          animationOptions: {
              duration: 750,
              easing: 'linear',
              queue: false
          }
      });

      // Category filter
      $('div.filters').change(function(){
          $('.filters .current').removeClass('current');
          $(this).addClass('current');

          selector = $('select').val();


          $container.isotope({
              filter: selector,
              animationOptions: {
                  duration: 750,
                  easing: 'linear',
                  queue: false
              }
          });
          return false;
      });

      // Tag filter
      $('div.tagFilters').change(function(){
          $('.filters .current').removeClass('current');
          $(this).addClass('current');

          selector = $('select').val();

          $container.isotope({
              filter: selector,
              animationOptions: {
                  duration: 750,
                  easing: 'linear',
                  queue: false
              }
          });
          return false;
      });
    }

  	var i, t,
    categories, tags, posts, postTitle, postContent, postCatagories, postTags, categoryName, categoryID, categorySlug, tagName, tagID, tagSlug,
    wpURL = 'https://test1.jesseweigel.com/demo/';

    // Get Categories
    $.ajax( {
      url: wpURL + 'wp-json/wp/v2/categories?per_page=100',
      success: function ( data ) {

        $.each(data, function(i, category){
          $( '.filters' ).append( `<option value=".${category.id}">${category.name}</option>` );
        });

         $('select').material_select();
      },
      cache: false
    } );

    // Get Tags
    $.ajax( {
      url: wpURL + 'wp-json/wp/v2/tags?per_page=100',
      success: function ( data ) {
        tags = data;
        tagName = tags[i].name;
        tagID = tags[i].id;
        tagSlug = tags[i].slug;

        for (i = 0; i < tags.length; i++) {


       }
      },
      cache: false
    } );

    // Get Posts
    function getPosts() {
      $.ajax( {
        url: wpURL + 'wp-json/wp/v2/posts?per_page=100',
        success: function ( data ) {
          posts = data;

          for (i = 0; i < posts.length; i++) {
            postTitle = posts[i].title.rendered;
            postContent = posts[i].content.rendered;
            postCatagories = posts[i].categories;
            postTags = posts[i].tags;

            $( '.isotope-container' ).append( `<div class="card isotope-item ${postCatagories}"><div class="card-content"><div class="card-title" id="post-${i}-title">${postTitle}</div><div class="content" id="post-${i}-content">${postContent}</div></div></div>` );

            for (t = 0; t < postTags.length; t++) {
              $(`#post-${i}-title`).parent().parent().addClass(`tag-${postTags[t]}`);
            }

  	        if (i === posts.length - 1) {
  	          isotopeize();
  	        }
  	     }

        },
        cache: false
      } );
    }
getPosts();

});
