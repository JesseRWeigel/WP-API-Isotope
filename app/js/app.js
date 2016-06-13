/* jshint esversion: 6 */
var images = {};
$(function() {

  var $container = $('.isotope-container'),
  selector;

  function isotopeize() {
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
  }

  function isotopeizeInit() {

    isotopeize();

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

  //More button on post cards
  function expandCard() {
  $('.expand-card').click(function(){

    $(this).parent().parent().find('.full-content').appendTo('#post-modal .modal-content');
    $('#post-modal .modal-content h4').text($(this).parent().parent().find('.card-title').text());
    $('#post-modal .full-content').show();
    $('#post-modal').openModal();
    });
  }

//API Calls
  	var i, t,
    categories = {},
    tags = {},
    // images = {},
    posts, postTitle, postContent, postCatagories, postTags, categoryName, categoryID, categorySlug, tagName, tagID, tagSlug, catName,
    wpURL = 'https://test1.jesseweigel.com/demo/';



    // Get Categories
    $.ajax( {
      url: wpURL + 'wp-json/wp/v2/categories?per_page=100',
      success: function ( data ) {

        $.each(data, function(i, category){
          categories[category.id] = category.name;
          $( '.filters' ).append( `<option value=".${category.id}" catID="${category.id}">${category.name}</option>` );
        });

         $('select').material_select();
      },
      cache: false
    } ).then(

    // Get Tags
    $.ajax( {
      url: wpURL + 'wp-json/wp/v2/tags?per_page=100',
      success: function ( data ) {

        $.each(data, function(i, tag){
          tags[tag.id] = tag.name;
        });
      },
      cache: false
    } )
  ).then(
    getPosts()
  );

    // Get Posts
    function getPosts(filterOpts='', perPage=100, isotopeInit=true) {
      $.ajax( {
        url: `${wpURL}wp-json/wp/v2/posts?${filterOpts}per_page=${perPage}`,
        success: function ( data ) {
          //TODO: Separate out the creation of the dom elements into a another function
         $.each(data, function(i, post){

           $( '.isotope-container' ).append(
             `<div class="card isotope-item ${post.categories}">
                <div class="card-content" post-id=${post.id}>
                  <div class="card-title">${post.title.rendered}</div>
                  <div class="content excerpt">${post.excerpt.rendered}</div>
                  <div class="content full-content">${post.content.rendered}</div>
                </div>
                <div class="card-action">
                  <a class="expand-card">More</a>
                </div>
              </div>` );

           //Attach Category names to cards
           $.each(post.categories, function(i, category){
             $(`div[post-id="${post.id}"] .content`).prepend(`<div class="cat-name" data-filter=".${category}">${categories[category]}</div>`);
           });

           //Attach Tag names to cards
           $.each(post.tags, function(i, tag){
             $(`div[post-id="${post.id}"] .content`).append(`<span class="tag-name" data-filter=".t${tag}">${tags[tag]} </span>`);

             //Add tag IDs as classes for filtering
             $(`div[post-id="${post.id}"]`).parent().addClass(`t${tag}`);

           });

           if (i === data.length - 1) {
             expandCard();
             $('.full-content').hide();

             if (isotopeInit === true) {
              isotopeizeInit();

             } else {
               $container.isotope('destroy');
               isotopeizeInit();
             }


           }
         });


        },
        cache: false
      } );
    }


    // Get Tags
    $.ajax({
      url: wpURL + 'wp-json/wp/v2/media?per_page=100',
      success: function ( data ) {

        $.each(data, function(i, item){
          if(item.media_type === "image") {
            images[item.id] = {
              thumb: item.media_details.sizes.thumbnail.source_url,
              medium: item.media_details.sizes.medium.source_url,
              'medium-large': item.media_details.sizes.medium_large.source_url,
              large: item.media_details.sizes.large.source_url,
              'post-thumb': item.media_details.sizes['post-thumbnail'].source_url,
              full: item.media_details.sizes.full.source_url
            };
          }

        });
      },
      cache: false
    });



  //Search input
  // adapted from https://github.com/bearded-avenger/wp-live-search/blob/master/public/assets/js/wp-live-search.js

  var postList = $('#post-list'),
    results = $('#results'),
    helper = $('#helper'),
    input = $('#search'),
    timer;

    $('#close-search').click(function() {
      input.val('');
      $(this).removeClass('active');
      $(this).siblings('label').removeClass('active');
    });

  $(input).on('keyup keypress', function(e) {

    // clear the previous timer
		clearTimeout(timer);

    let key = e.which,
      val = $.trim($(this).val()),
      valEqual = val == $(this).val(),
      notEmpty = '' !== val,
      total = 100,
      searchURL = `${wpURL}wp-json/wp/v2/posts?filter[s]=${val}&per_page=${total}`;

    // 600ms delay so we dont exectute excessively
    timer = setTimeout(function(){
      console.log('timer');
      // don't proceed if the value is empty or not equal to itself
				if ( !valEqual && !notEmpty )
					return false;
          console.log(val);
				// what if the user only types two characters?
				if ( val.length == 2 && !$(helper).length ) {
          console.log('2chars');
					// $( input ).after( helperSpan );
        }

        // if we have more than 3 characters
        if ( val.length >= 3 || val.length >= 3 && 13 == key ) {
          //TODO: after the || should be >= 1 maybe? want search to work with less than 3 on enter
console.log('3chars');
          // dont run on escape or arrow keys
					if( blacklistedKeys( key ) )
						return false;

            //TODO: Add as loader in the html and link classes
          // // show loader
					// $( loader ).removeClass('wpls--hide').addClass('wpls--show');
          // TODO: figure out what the helpers are
					// // remove any helpers
					// $( helper ).fadeOut().remove();
          // TODO: see function below
					// // remove the close
					// destroyClose();
console.log('hi');
          // make the search request
          $('.isotope-container').html('');
          getPosts(`filter[s]=${val}&`, total, false);

        }

    }, 600);

  });

		/**
		* 	Blacklisted keys - dont allow search on escape or arrow keys
		*	@since 0.9
		*/
		function blacklistedKeys( key ){

			return 27 == key || 37 == key || 38 == key || 39 == key || 40 == key;

		}

});
