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
    function getPosts(filterOpts='', perPage=100, isotopeInit=true) {
      $.ajax( {
        url: `${wpURL}wp-json/wp/v2/posts?${filterOpts}per_page=${perPage}`,
        success: function ( data ) {

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
             expandCard();
             $('.full-content').hide();
             $('#tag-container').remove();
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
  getPosts();



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

          // $.getJSON( searchURL, function( response ) {
          //
          //   // remove current list of posts
          //   $(postList).children().remove();
          //   $(postList).removeClass('wpls--full').addClass('wpls--empty');
          //
          //   // show results
          //   $(results).parent().removeClass('wpls--hide').addClass('wpls--show');
          //
          //   // TODO: add loader to html
          //   // // hide loader
          //   // $(loader).removeClass('wpls--show').addClass('wpls--hide');
          //
          //   // count results and show
          //   if ( response.length === 0 ) {
          //
          //     // results are empty int
          //     $(results).text('0').closest( main ).addClass('wpls--no-results');
          //
          //     // clear any close buttons
          //     destroyClose();
          //
          //   } else {
          //
          //     // again, dont run on escape or arrow keys
          //     if( blacklistedKeys( key ) )
          //       return false;
          //
          //     // append close button
          //     if ( !$( clearItem ).length ) {
          //
          //       $(input).after( clear );
          //     }
          //
          //     // show how many results we have
          //     $(results).text( response.length ).closest( main ).removeClass('wpls--no-results');
          //
          //     // loop through each object
          //             $.each( response, function ( i ) {
          //
          //                 $(postList).append( itemTemplate( { post: response[i], settings: WP_API_Settings, excerpt: showExcerpt } ) )
          //                 .removeClass('wpls--empty')
          //                 .addClass('wpls--full');
          //
          //             } );
          //         }
          //
          // });


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
