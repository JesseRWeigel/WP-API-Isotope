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
    cardImg,
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
    getImages()
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
           console.log (post.featured_media);
           if(post.featured_media !== 0) {
             cardImg = images[post.featured_media].thumb;
           } else {
             cardImg = 'https://baconmockup.com/300/200';
           }

           $( '.isotope-container' ).append(
             `<div class="card isotope-item ${post.categories}">
                <div class="card-image">
                  <img src="${cardImg}"/>
                </div>
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

             $('.isotope-container').imagesLoaded(function(){
               if (isotopeInit === true) {
                isotopeizeInit();

               } else {
                 $container.isotope('destroy');
                 isotopeizeInit();
               }
             });

           }
         });


        },
        cache: false
      } );
    }


    // Get Images
    function getImages() {
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
    }



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


/*!
 * imagesLoaded PACKAGED v4.1.0
 * JavaScript is all like "You images are done yet or what?"
 * MIT License
 */

!function(t,e){"function"==typeof define&&define.amd?define("ev-emitter/ev-emitter",e):"object"==typeof module&&module.exports?module.exports=e():t.EvEmitter=e()}(this,function(){function t(){}var e=t.prototype;return e.on=function(t,e){if(t&&e){var i=this._events=this._events||{},n=i[t]=i[t]||[];return-1==n.indexOf(e)&&n.push(e),this}},e.once=function(t,e){if(t&&e){this.on(t,e);var i=this._onceEvents=this._onceEvents||{},n=i[t]=i[t]||[];return n[e]=!0,this}},e.off=function(t,e){var i=this._events&&this._events[t];if(i&&i.length){var n=i.indexOf(e);return-1!=n&&i.splice(n,1),this}},e.emitEvent=function(t,e){var i=this._events&&this._events[t];if(i&&i.length){var n=0,o=i[n];e=e||[];for(var r=this._onceEvents&&this._onceEvents[t];o;){var s=r&&r[o];s&&(this.off(t,o),delete r[o]),o.apply(this,e),n+=s?0:1,o=i[n]}return this}},t}),function(t,e){"use strict";"function"==typeof define&&define.amd?define(["ev-emitter/ev-emitter"],function(i){return e(t,i)}):"object"==typeof module&&module.exports?module.exports=e(t,require("ev-emitter")):t.imagesLoaded=e(t,t.EvEmitter)}(window,function(t,e){function i(t,e){for(var i in e)t[i]=e[i];return t}function n(t){var e=[];if(Array.isArray(t))e=t;else if("number"==typeof t.length)for(var i=0;i<t.length;i++)e.push(t[i]);else e.push(t);return e}function o(t,e,r){return this instanceof o?("string"==typeof t&&(t=document.querySelectorAll(t)),this.elements=n(t),this.options=i({},this.options),"function"==typeof e?r=e:i(this.options,e),r&&this.on("always",r),this.getImages(),h&&(this.jqDeferred=new h.Deferred),void setTimeout(function(){this.check()}.bind(this))):new o(t,e,r)}function r(t){this.img=t}function s(t,e){this.url=t,this.element=e,this.img=new Image}var h=t.jQuery,a=t.console;o.prototype=Object.create(e.prototype),o.prototype.options={},o.prototype.getImages=function(){this.images=[],this.elements.forEach(this.addElementImages,this)},o.prototype.addElementImages=function(t){"IMG"==t.nodeName&&this.addImage(t),this.options.background===!0&&this.addElementBackgroundImages(t);var e=t.nodeType;if(e&&d[e]){for(var i=t.querySelectorAll("img"),n=0;n<i.length;n++){var o=i[n];this.addImage(o)}if("string"==typeof this.options.background){var r=t.querySelectorAll(this.options.background);for(n=0;n<r.length;n++){var s=r[n];this.addElementBackgroundImages(s)}}}};var d={1:!0,9:!0,11:!0};return o.prototype.addElementBackgroundImages=function(t){var e=getComputedStyle(t);if(e)for(var i=/url\((['"])?(.*?)\1\)/gi,n=i.exec(e.backgroundImage);null!==n;){var o=n&&n[2];o&&this.addBackground(o,t),n=i.exec(e.backgroundImage)}},o.prototype.addImage=function(t){var e=new r(t);this.images.push(e)},o.prototype.addBackground=function(t,e){var i=new s(t,e);this.images.push(i)},o.prototype.check=function(){function t(t,i,n){setTimeout(function(){e.progress(t,i,n)})}var e=this;return this.progressedCount=0,this.hasAnyBroken=!1,this.images.length?void this.images.forEach(function(e){e.once("progress",t),e.check()}):void this.complete()},o.prototype.progress=function(t,e,i){this.progressedCount++,this.hasAnyBroken=this.hasAnyBroken||!t.isLoaded,this.emitEvent("progress",[this,t,e]),this.jqDeferred&&this.jqDeferred.notify&&this.jqDeferred.notify(this,t),this.progressedCount==this.images.length&&this.complete(),this.options.debug&&a&&a.log("progress: "+i,t,e)},o.prototype.complete=function(){var t=this.hasAnyBroken?"fail":"done";if(this.isComplete=!0,this.emitEvent(t,[this]),this.emitEvent("always",[this]),this.jqDeferred){var e=this.hasAnyBroken?"reject":"resolve";this.jqDeferred[e](this)}},r.prototype=Object.create(e.prototype),r.prototype.check=function(){var t=this.getIsImageComplete();return t?void this.confirm(0!==this.img.naturalWidth,"naturalWidth"):(this.proxyImage=new Image,this.proxyImage.addEventListener("load",this),this.proxyImage.addEventListener("error",this),this.img.addEventListener("load",this),this.img.addEventListener("error",this),void(this.proxyImage.src=this.img.src))},r.prototype.getIsImageComplete=function(){return this.img.complete&&void 0!==this.img.naturalWidth},r.prototype.confirm=function(t,e){this.isLoaded=t,this.emitEvent("progress",[this,this.img,e])},r.prototype.handleEvent=function(t){var e="on"+t.type;this[e]&&this[e](t)},r.prototype.onload=function(){this.confirm(!0,"onload"),this.unbindEvents()},r.prototype.onerror=function(){this.confirm(!1,"onerror"),this.unbindEvents()},r.prototype.unbindEvents=function(){this.proxyImage.removeEventListener("load",this),this.proxyImage.removeEventListener("error",this),this.img.removeEventListener("load",this),this.img.removeEventListener("error",this)},s.prototype=Object.create(r.prototype),s.prototype.check=function(){this.img.addEventListener("load",this),this.img.addEventListener("error",this),this.img.src=this.url;var t=this.getIsImageComplete();t&&(this.confirm(0!==this.img.naturalWidth,"naturalWidth"),this.unbindEvents())},s.prototype.unbindEvents=function(){this.img.removeEventListener("load",this),this.img.removeEventListener("error",this)},s.prototype.confirm=function(t,e){this.isLoaded=t,this.emitEvent("progress",[this,this.element,e])},o.makeJQueryPlugin=function(e){e=e||t.jQuery,e&&(h=e,h.fn.imagesLoaded=function(t,e){var i=new o(this,t,e);return i.jqDeferred.promise(h(this))})},o.makeJQueryPlugin(),o});
