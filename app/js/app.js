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

      // Category filter (dropdown)
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

      // Category filter (in card)
      $('.cat-name').click(function(){

         var selector = $(this).attr('data-filter');
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

      // Tag filter (in card)
      $('.tag-name').click(function(){

         var selector = $(this).attr('data-filter');
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
    categories, tags, posts, postTitle, postContent, postCatagories, postTags, categoryName, categoryID, categorySlug, tagName, tagID, tagSlug, catName,
    wpURL = 'https://test1.jesseweigel.com/demo/';

    // Get Categories
    $.ajax( {
      url: wpURL + 'wp-json/wp/v2/categories?per_page=100',
      success: function ( data ) {

        $.each(data, function(i, category){
          $( '.filters' ).append( `<option value=".${category.id}" catID="${category.id}">${category.name}</option>` );
        });

         $('select').material_select();
      },
      cache: false
    } );

    // Get Tags
    $.ajax( {
      url: wpURL + 'wp-json/wp/v2/tags?per_page=100',
      success: function ( data ) {

        $.each(data, function(i, tag){
          $('#tag-container').append(`<span tagID="${tag.id}" data-filter=".${tag.id}">${tag.name}</span`);
        });
      },
      cache: false
    } );

    // Get Posts
    function getPosts() {
      $.ajax( {
        url: wpURL + 'wp-json/wp/v2/posts?per_page=100',
        success: function ( data ) {

         $.each(data, function(i, post){

           $( '.isotope-container' ).append( `<div class="card isotope-item ${post.categories}"><div class="card-content" post-id=${post.id}><div class="card-title">${post.title.rendered}</div><div class="content">${post.content.rendered}</div></div></div>` );

           //Attach Category names to cards
           $.each(post.categories, function(i, category){
             catName = $(`option[catID="${category}"]`).text();
             $(`div[post-id="${post.id}"] .content`).prepend(`<div class="cat-name" data-filter=".${category}">${catName}</div>`);
           });

           //Attach Tag names to cards
           $.each(post.tags, function(i, tag){
             tagName = $(`#tag-container span[tagid="${tag}"]`).text();
             $(`div[post-id="${post.id}"] .content`).append(`<span class="tag-name" data-filter=".t${tag}">${tagName} </span>`);

             //Add tag IDs as classes for filtering
             $(`div[post-id="${post.id}"]`).parent().addClass(`t${tag}`);

           });

           if (i === data.length - 1) {
             isotopeize();
           }
         });


        },
        cache: false
      } );
    }
getPosts();

});
