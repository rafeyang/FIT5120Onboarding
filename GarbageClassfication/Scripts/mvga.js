// Build 0.17.0.

var TILE_MODE_SQUARE_PLAIN = 'Square grey plain';
var TILE_MODE_SQUARE_IMAGE_OVERLAY = 'Square grey with background image';
var TILE_MODE_SQUARE_IMAGE = 'Square with image';
var TILE_MODE_DOUBLE = 'Double with image';
var TILE_MODE_DOUBLE_SPLIT = 'Double split into two tiles';
var TILE_FIELD_MODE = 'Mode';
var TILE_FIELD_URL = 'URL';
var TILE_FIELD_TITLE = 'Title';
var TILE_FIELD_CHEVRON = 'Chevron';
var TILE_FIELD_DESCRIPTION = 'Description';
var TILE_FIELD_OVERLAY_TYPE = 'OverlayType';
var TILE_FIELD_IMAGE_URL = 'ImageUrl';
var TILE_FIELD_IMAGE_ALT = 'ImageAlt';

// Global variables. 
var logoBar;
var emergencyBar;
var ribbonRow;
var workspace;
var contentContainer;
var mainArea;
var footer;
var windowWidth;
var windowHeight;
var carouselWinWidth;
var carouselWinHeight;
var breadcrumb;
var carouselData = [];
var imagesLoaded = 0;

$(function () {

    var w = window, 
        d = w.document;

    if (w.onfocusin === undefined) {
        d.addEventListener('focus'    ,addPolyfill    ,true);
        d.addEventListener('blur'     ,addPolyfill    ,true);
        d.addEventListener('focusin'  ,removePolyfill ,true);
        d.addEventListener('focusout' ,removePolyfill ,true);
    }  
    function addPolyfill(e){
        var type = e.type === 'focus' ? 'focusin' : 'focusout';
        var event = new CustomEvent(type, {bubbles:true, cancelable:false});
        event.c1Generated = true;
        e.target.dispatchEvent(event);
    }
    function removePolyfill(e){
        if (!e.c1Generated) { // focus after focusin, so chrome will the first time trigger tow times focusin
            d.removeEventListener('focus'    ,addPolyfill    ,true);
            d.removeEventListener('blur'     ,addPolyfill    ,true);
            d.removeEventListener('focusin'  ,removePolyfill ,true);
            d.removeEventListener('focusout' ,removePolyfill ,true);
        }
        setTimeout(function(){
            d.removeEventListener('focusin'  ,removePolyfill ,true);
            d.removeEventListener('focusout' ,removePolyfill ,true);
        });
    }

    // Apply the right-hand navigation accordion.
    $('#RightNavigation .accordion').accordion({
        create: function (event, ui) {
            ui.panel.addClass('display-arrow');
            $('#RightNavigation .accordion').css('height', 'auto');
        },
        beforeActivate: function (event, ui) {
            ui.oldPanel.removeClass('display-arrow');
            ui.newPanel.addClass('display-arrow');
        },
        activate: function (event, ui) {
        },
        heightStyle: 'content',
        active: 1,
        icons: false
    });

});


$(document).ready(function () {
    // Get references to all of the important objects.
    logoBar = $('#LogoBar');
    finderInput = $('#finderCtrlDiv');
    emergencyBar = $('#EmergencyBar');
    ribbonRow = $('#s4-ribbonrow');
    workspace = $('#s4-workspace');
    contentContainer = $('#ContentContainer');
    mainArea = $('#MainArea');
    footer = $('#SocialMediaChannels');
    var utilityBar = $('#UtilityBar');
    breadcrumb = $('#Breadcrumb');
    var stickyNavHeight = 87;
    var flyoutTop;
    var queryString = getQueryString();

    // Extend UI autocomplete by adding new catcomplete plugin for organising popup into categories.
    try {
        $.ui.autocomplete.prototype._renderItem = function (ul, item) {
			
			//added by Chau to remove special characters to stop "Cross-site" scripting 
			item.label = item.label.replace(/[^a-zA-Z0-9!@#$%^&* ]/g, " ");
            
			item.label = item.label.replace(new RegExp("(?![^&;]+;)(?!<[^<>]*)(" + $.ui.autocomplete.escapeRegex(this.term) + ")(?![^<>]*>)(?![^&;]+;)", "gi"), "<strong>$1</strong>");
            return $("<li></li>")
				.data("item.autocomplete", item)
				.append("<a>" + item.label + "</a>")
				.appendTo(ul);
        };

        $.widget("custom.catcomplete", $.ui.autocomplete, {
            _create: function () {
                var self = this;
                this._super();
                this.widget().menu("option", "items", "> :not(.ui-autocomplete-category)");
            },
            _renderMenu: function (ul, items) {
                var that = this,
				currentCategory = "";
                $.each(items, function (index, item) {
                    var li;
                    if (item.category != currentCategory) {
                        ul.append("<li class='ui-autocomplete-category'>" + item.category + "</li>");
                        currentCategory = item.category;
                    }
                    li = that._renderItemData(ul, item);
                    if (item.category) {
                        li.attr("aria-label", item.category + " : " + item.label);
                    }
                });
            },

        });

       
    }
    catch (Exception) {
    }

    // Set fixed positions on page load.	
    setFixedPositions();

    // Set fixed positions on an interval (caters for event-raising anomalies during resizing, and SharePoint warning popups.
    setInterval(function () {
        setFixedPositions();
    }, 2000);

    windowWidth = $(window).width();
    windowHeight = $(window).height();

    // Used for image carousel resize
    carouselWinWidth = $(window).width();
    carouselWinHeight = $(window).height();
    // Set fixed positions during resizing.
    $(window).resize(function () {
        setFixedPositions();
        //
        if ($(window).width() > 767)
            $('.ui-autocomplete').hide(); // Hide search curtain - not on mobile
        hideAboutFlyouts();
        if ($(window).width() != windowWidth || $(window).height() != windowHeight) {
            $('.crumb-tab').removeClass('selected');
            $('.crumb-tab-panel').hide();
            windowWidth = $(window).width();
            windowHeight = $(window).height();
        }
    });


    //hide breadcrumb on home page
    if ($(' #ContentContainerInner').children().first().attr('id') != "Breadcrumb") {
        if ($('#Breadcrumb ul li').length != 1)
            $('#ContentContainerInner').prepend($('#Breadcrumb').clone());
    }
    if ($('#Breadcrumb ul li').length == 1)// ON HOME PAGE
    {
        $('#Breadcrumb').hide();
    }

    $('#SelectPagination').on('change', function () {

        //var url = window.location.href.split('?')[0] + '?p=' + $(this).val();
        //window.location = url;

        var selectedValue = $(this).val();

        window.location = updateQueryStringValue(window.location.href, "p", selectedValue);
    });


    // iheritage 
    //$('.heritageList .propertyDetail th:contains("Building Grading")').parent().remove();
    //$('.heritageList .propertyDetail th:contains("Streetscape Level")').parent().remove();
    //$('.iHeritageSearch .controls label:contains("Building Grading")').parent().parent().remove();

    // Show the sticky nav when scrolling and set fixed positions.
    var minScroll = getObjectHeight(utilityBar, true) + getObjectHeight(logoBar, true) - stickyNavHeight;
    $(document).scroll(function () {
        if ($(this).scrollTop() >= minScroll && $(window).width() >= 1200) {
            logoBar.addClass('sticky');
            $('html').addClass('sticky-state');
        }
        else {
            logoBar.removeClass('sticky');
            $('html').removeClass('sticky-state');
        }
        setFixedPositions();
        /* removed by Maor $('.ui-autocomplete').hide(); 
          hideAboutFlyouts();// Hide search curtain*/
    });

    // Sidebar scrollbars.
    // $('.fixed-sidebar').mCustomScrollbar({ theme: 'minimal-dark' });
    $('#MobileNavigation .left-navigation.top-level li a span:contains("Recent")').parent().parent().parent().remove();
    // Mobile sidebar.	
    // var asd = $('#MobileNavigation');
    $('#MobileNavigation').simpleSidebar({

        opener: '#HamburgerIcon',
        wrapper: '#PageWrapper',
        ignore: '.TopLeftDate,.ContentImageCaption',
        animation: {
            duration: 50
        },

        sidebar: {
            align: 'left',
            width: 250,
            closingLinks: 'a',
            style: {
                zIndex: 100
            }
        }
    });


    // Record search results clicks.	
    $('.results-search .result a').click(function () {

        $.ajax({
            url: '/_layouts/15/CoM.MVGA.Search/RecordSearchClick.aspx',
            async: true,
            data: { k: queryString['k'], u: $(this).attr('href'), t: $(this).text() },
            success: function (data) {
                //console.log('successful');
            }
        });
    });

    // Record meeting finder search results clicks.	
    $('.results-meeting .result a').click(function () {

        $.ajax({
            url: '/_layouts/15/CoM.MVGA.Search/RecordSearchClickMeeting.aspx',
            async: true,
            data: { k: queryString['k'], u: $(this).attr('href'), t: $(this).text() },
            success: function (data) {
                //console.log('successful');
            }
        });
    });

    // Record media finder search result clicks.	
    $('.results-media .result a').click(function () {

        $.ajax({
            url: '/_layouts/15/CoM.MVGA.Search/RecordSearchClickMediaRelease.aspx',
            async: true,
            data: { k: queryString['k'], u: $(this).attr('href'), t: $(this).text() },
            success: function (data) {
                console.log('successful');
            }
        });
    });

    // Record media finder search result clicks.	
    $('.results-pub div h3 a').click(function () {

        $.ajax({
            url: '/_layouts/15/CoM.MVGA.Search/RecordSearchClickPublication.aspx',
            async: true,
            data: { k: queryString['k'], u: $(this).attr('href'), t: $(this).text() },
            success: function (data) {
                //console.log('successful');
            }
        });
    });

    // Setup About Melbourne/About Council flyouts.
    setupAboutFlyouts();

    // Toggle the mobile search bar.
    $('#MobileSearchIcon').click(function () {
        $('#MobileSearchBar').slideToggle();
    });

    // Setup the search box.
    setupSearchBox();

    // add search suggestions on txt type to Media Release finder
    if ($(".keyword-srch-filter-box").length > 0) {
        setupSearchFinderResultsPage();
    }

    // add search suggestions on txt type to Media Release finder
    if ($(".mediaSearchInput").length > 0) {
        setupSearchFinderMediaRelease();
    }

    // Generic Finder box Configured Media Release
    if ($(".finderMediaRelease").length > 0) {
        setupSearchGenericFinderMediaRelease();
    }

    // Generic Finder box Configured Media Release
    if ($(".finderMeetings").length > 0) {
        setupSearchGenericFinderMeeting();
    }

    // add search suggestions on txt type to Meeting finder
    if ($(".meetingSearchInput").length > 0) {
        setupSearchFinderMeeting();
    }

    // add search suggestions on txt type to Publication finder
    if ($(".pubSearchInput").length > 0) {
        setupSearchFinderPublication();
    }

    // Trigger search on enter key press in search results page commented out temporarily
    if ($('.keySearchBox') != null) {
        $('.keySearchBox').keydown(function (event) {
            if (event.keyCode == 13) {
                eval($('.finderSearchLink').attr('href'));
                return false;
            }
        });
    }

    // Copy the content from the Related column to the Related row.	
    $('#RelatedRow').html($('#RelatedColumn #RelatedColumnInner').html());

    // Convert SVG's to inline where required.
    $('img.svg-convert-inline').each(function () {
        var $img = jQuery(this);
        var imgID = $img.attr('id');
        var imgClass = $img.attr('class');
        var imgURL = $img.attr('src');

        $.get(imgURL, function (data) {
            var $svg = jQuery(data).find('svg');
            if (typeof imgID !== 'undefined') {
                $svg = $svg.attr('id', imgID);
            }
            if (typeof imgClass !== 'undefined') {
                $svg = $svg.attr('class', imgClass + ' replaced-svg');
            }
            $svg = $svg.removeAttr('xmlns:a');
            $img.replaceWith($svg);
        }, 'xml');
    });

    // Setup the left hand navigation.
    setupLHN(queryString);

    // Setup the crumb bar.
    setupCrumbBar();

    // Setup the Facility pages.
    setupFacilityPage();

    // Setup feedback validation
    setupFeedbackValidation();

    // Setup live chat
    setupLiveChat();

    // Setup tiles.
    setupTiles();
    setupTileEditors();

    // Setup named anchors.
    setupNamedAnchors();
    var inDesignMode = document.forms[MSOWebPartPageFormName].MSOLayout_InDesignMode.value;

    // if (inDesignMode == "1") {
    //     $('#ContentContainer').children('.clear').css('clear', 'both!important');
    // }

    //ResizeBreadCrumb();
    $('.latest-info-slider').slick({
        infinite: true,
        slidesToShow: 1,
        slidesToScroll: 1,
        nextArrow: '<img class="slick-next" src="/system/images/chevron-right.png"/>',
        prevArrow: '<img class="slick-prev" src="/system/images/chevron-left.png"/>',
        mobileFirst: true,
        responsive: [
            {
                breakpoint: 415,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1
                }
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 1
                }
            }
        ]
    });

    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        $(window).resize();
    });

    // Setup social sharing control.
    setupSocialSharing();

    // Setup rich text editors.
    setupRichTextEditors();

    // Setup FormsBuilder.
    setupFormsBuilder();

    // set tabindex=0 on links 
    $('a').each(function () {
        if (this) {
            if ($(this).is('a')) {
                if ($(this).hasClass('childless') != true) {
                    $(this).attr('tabindex', 0);
                }
            }

            $(this).keydown(function (e) { // Trigger the click event from the keyboard
                var code = e.which;
                // 13 = Return, 32 = Space
                if ((code === 13) || (code === 32)) {
                    $(this).click();
                }
            });
        }
    });

    // Show the LHN.
    $('.left-navigation').show();

    // when no style sheet hide the menu double up JR 
    $('[data-simplesidebar="sbwrapper"]').attr('aria-hidden', 'true'); // stop screen reader reading duplicate menu

    // if heigth is > 70000 style sheets turned off hide the hamburger menu stop left menu double up when stylesheets off JR
    if ($(document).height() > 70000) {
        $('[data-simplesidebar="sbwrapper"]').remove();
    }

    $('.SelectedMenuItem').find('.lhn-label').prepend('> ');
    $('.SelectedMenuItem').find('.sr-only').append(' You are here');

    $('h1.heading').hover(
        function () {
            $(this).css({ "font-weight": "bold" });
        },

        function () {
            $(this).css({ "font-weight": "500" });
        }
    );

    $("h1.heading").focusin(function () {
        $(this).css("font-weight", "bold")
    });

    $("h1.heading").focusout(function () {
        $(this).css("font-weight", "500")
    });

    $("#RightNavigation .ui-accordion-header").focusin(function () {
        $(this).addClass("focus");
    });
    $("#RightNavigation .ui-accordion-header").focusout(function () {
        $(this).removeClass("focus");
    });

    $("img[src$='flag.png']").attr("alt", "flag");

});

// Setup rich text editors.
function setupRichTextEditors() {
    try {
        tinymce.init({
            selector: 'textarea.rich-text-editor',
            menubar: false,
            toolbar1: 'undo redo formatselect ',
            toolbar2: 'bold italic link unlink',
            toolbar3: 'bullist numlist outdent indent',
            toolbar4: 'blockquote removeformat subscript superscript'
        });
    }
    catch (err) {
    }
}

// Setup the social sharing controls.
function setupSocialSharing() {
    $('#btn-social-share, .share-desc').on('touchstart click', function (e) {
        e.preventDefault();
        var shWrap = $('ul.social-share-wrapper');
        var arHd = shWrap.attr('aria-expanded');

        // Touch events.
        if (e.type == "touchstart" || e.type == "click" || e.which === 13 || e.which === 32) {

            if ($('.social-share-wrapper').hasClass('social-share-wrapper-active')) {

                // Hide share buttons.
                $('.social-share-wrapper').removeClass('social-share-wrapper-active');

                // Remove shadow.
                $('.social-share-wrapper').removeClass('social-share-wrapper-shadow');

                // Hide tooltip.
                $('.social-share-tooltip').removeClass('social-share-tooltip-active');

                // Hide menu button active colours.
                $('.social-share-activate-button').removeClass('social-share-activate-button-active');
                $('.social-share-activate-button').toggleClass('social-share-activate-button-hover');
                $('.social-share-activate-button').removeClass('social-share-activate-button-hover-touch');

                $('.social-share-wrapper').hide();

                if (arHd == "true") {
                    shWrap.attr('aria-expanded', 'false');
                    shWrap.attr('aria-hidden', 'true');
                }


            }

            else {

                // Show share buttons.
                $('.social-share-wrapper').addClass('social-share-wrapper-active');

                // Show shadow.
                $('.social-share-wrapper').addClass('social-share-wrapper-shadow');

                // Show tooltip.
                $('.social-share-tooltip').addClass('social-share-tooltip-active');

                // Show menu button active colours.
                $('.social-share-activate-button').addClass('social-share-activate-button-active');
                $('.social-share-activate-button').toggleClass('social-share-activate-button-hover');
                $('.social-share-activate-button').removeClass('social-share-activate-button-hover-touch');

                $('.social-share-wrapper').show();

                if (arHd == "false") {
                    shWrap.attr('aria-expanded', 'true');
                    shWrap.attr('aria-hidden', 'false');
                }
            }
        }
    });
}




// Setup named anchors so they don't get hidden behind the sticky nav.
function setupNamedAnchors() {
    $('#PageWrapper a[name]').addClass('named-anchor');
}

// Setup all the tile editors.
function setupTileEditors() {
    $('.tile-editor').each(function () {
        var prefix = $(this).find('.tile-prefix input[type=hidden]').val();
        var isDouble = $(this).find('.tile-is-double input[type=hidden]').val();
        var isThird = $(this).find('.tile-is-third input[type=hidden]').val();
        var panelBody = $(this).find('.panel-body');
        setupTileEditor(prefix, (isDouble == 'True'), (isThird == 'True'), panelBody);
    });
}

// Setup a tile editor.
function setupTileEditor(prefix, isDouble, isThird, panelBody) {

    var modeField = getTileField(prefix, TILE_FIELD_MODE, '');
    var modeField2 = getTileField(prefix, TILE_FIELD_MODE, '2');
    var titleField = getTileField(prefix, TILE_FIELD_TITLE, '');

    // Remove inappropriate modes from the dropdowns.
    if (!isDouble) {
        modeField.find('option:contains("Double")').remove();
    }
    if (isThird) {
        modeField.find('option:contains("grey")').remove();
    }
    modeField2.find('option:contains("Double")').remove();

    // Setup title change events.
    $('#' + prefix + 'SummaryValue').text(titleField.val());
    titleField.on('input propertychange paste', function () {
        $('#' + prefix + 'SummaryValue').text($(this).val());
    });

    // Setup mode change events.
    modeField.change(function () {
        showHideTileEditorFields($(this), prefix, '', isDouble);
    });
    if (isDouble) {
        modeField2.change(function () {
            showHideTileEditorFields($(this), prefix, '2', isDouble);
        });
    }

    // Show/hide fields.
    showHideTileEditorFields(modeField, prefix, '', isDouble);
    showHideTileEditorFields(modeField2, prefix, '2', isDouble);

    // Expand the panel body if it contains any validation errors.
    var validationErrors = panelBody.find('.validation-error').filter(function (index) {
        return ($(this).css('display') === 'block');
    });
    if (validationErrors.length > 0) {
        panelBody.addClass('in');
    };
}

// Show/hide tile editor fields relevant for the selected mode.
function showHideTileEditorFields(modeField, prefix, suffix, isDouble) {

    var mode = modeField.children(':selected').text();

    // Chevron.
    showTileEditorObject(getTileFieldContainer(getTileField(prefix, TILE_FIELD_CHEVRON, suffix)), tileModeAllowsChevron(mode));

    // Description.
    showTileEditorObject(getTileFieldContainer(getTileField(prefix, TILE_FIELD_DESCRIPTION, suffix)), tileModeAllowsDescription(mode));

    // Image URL.	
    var imageUrlField = getTileField(prefix, TILE_FIELD_IMAGE_URL, suffix);
    var imageUrlFieldContainer = getTileFieldContainer(imageUrlField);
    var imageUrlBrowse = imageUrlFieldContainer.next('.browse-button');
    showTileEditorObject(imageUrlFieldContainer, tileModeAllowsImage(mode));
    showTileEditorObject(imageUrlBrowse, tileModeAllowsImage(mode));

    // Image ALT.
    showTileEditorObject(getTileFieldContainer(getTileField(prefix, TILE_FIELD_IMAGE_ALT, suffix)), tileModeAllowsImage(mode));

    // Overlay type.
    showTileEditorObject(getTileFieldContainer(getTileField(prefix, TILE_FIELD_OVERLAY_TYPE, suffix)), tileModeAllowsOverlayType(mode));

    // 2nd tile panel (for split double tiles).
    if (suffix == '') {
        var panel2 = $('#' + prefix + 'Panel2');
        showTileEditorObject(panel2, tileModeAllowsPanel2(mode, isDouble));
    }

}

// Check whether the specified mode allows a chevron.
function tileModeAllowsChevron(mode) {
    return (mode == TILE_MODE_SQUARE_PLAIN || mode == TILE_MODE_SQUARE_IMAGE_OVERLAY);
}

// Check whether the specified mode allows a description.
function tileModeAllowsDescription(mode) {
    return (mode == TILE_MODE_SQUARE_IMAGE || mode == TILE_MODE_DOUBLE);
}

// Check whether the specified mode allows an image to be specified.
function tileModeAllowsImage(mode) {
    return (mode == TILE_MODE_SQUARE_IMAGE_OVERLAY || mode == TILE_MODE_SQUARE_IMAGE || mode == TILE_MODE_DOUBLE);
}

// Check whether the specified mode allows an overlay type to be specified.
function tileModeAllowsOverlayType(mode) {
    return (mode == TILE_MODE_SQUARE_PLAIN || mode == TILE_MODE_SQUARE_IMAGE_OVERLAY || mode == TILE_MODE_DOUBLE);
}

// Check whether the specified mode allows panel 2.
function tileModeAllowsPanel2(mode, isDouble) {
    return (isDouble && (mode == TILE_MODE_SQUARE_PLAIN || mode == TILE_MODE_SQUARE_IMAGE_OVERLAY || mode == TILE_MODE_SQUARE_IMAGE));
}

// Get the container for the specified tile field.
function getTileFieldContainer(tileField) {
    return tileField.parents('.ms-formfieldcontainer');
}

// Show a tile editor field.
function showTileEditorObject(object, show) {
    object.toggle(show);
}

// Get the jQuery object matching a field name.
function getTileField(prefix, fieldName, suffix) {
    var fullFieldName = prefix + fieldName + suffix;
    return $('input[title="' + fullFieldName + '"], input[title="' + fullFieldName + ' Required Field"], select[title="' + fullFieldName + '"], select[title="' + fullFieldName + ' Required Field"], .' + fullFieldName + ' input[type=checkbox]');
}

// Callback for when a new tile URL is selected using the asset selector.
function tileUrlSelected(prefix, suffix, url) {
    getTileField(prefix, TILE_FIELD_URL, suffix).val(url);
    loadTileDefaults(prefix, suffix, false);
}

// Load the default values for a tile.
function loadTileDefaults(prefix, suffix, forceOverwrite) {

    var url = getTileField(prefix, TILE_FIELD_URL, suffix).val();

    $.ajax({
        url: '/_layouts/15/CoM.MVGA.Common/GetPageDetails.aspx',
        data: {
            url: url
        },
        dataType: 'json',
        success: function (data) {
            var titleField = getTileField(prefix, TILE_FIELD_TITLE, suffix);
            var descriptionField = getTileField(prefix, TILE_FIELD_DESCRIPTION, suffix);
            var imageUrlField = getTileField(prefix, TILE_FIELD_IMAGE_URL, suffix)
            var imageAltField = getTileField(prefix, TILE_FIELD_IMAGE_ALT, suffix)
            if (titleField.val() == '' || forceOverwrite) {
                titleField.val(data.title);
            }
            if (descriptionField.val() == '' || forceOverwrite) {
                descriptionField.val(data.description);
            }
            if (imageUrlField.val() == '' || forceOverwrite) {
                imageUrlField.val(data.imageUrl);
            }
            if (imageAltField.val() == '' || forceOverwrite) {
                imageAltField.val(data.imageAlt);
            }
        },
        error: function (request, error) {
            //console.log(error);
        }
    });

}

// Callback for when a new tile image is selected using the asset selector.
function tileImageSelected(prefix, suffix, url) {
    getTileField(prefix, TILE_FIELD_IMAGE_URL, suffix).val(url);
}

// Setup any tiles.
function setupTiles() {

    // Set the tile sizes.
    $('.tile-size-single').html('<img src="/system/images/tile-sizer-23-22.gif" class="tile-sizer" alt="">');
    $('.tile-size-double').html('<img src="/system/images/tile-sizer-47-22.gif" class="tile-sizer" alt="">');
    $('.tile-size-third').html('<img src="/system/images/tile-sizer-310-214.gif" class="tile-sizer" alt="">');
    $('.tile-size-quad').html('<img src="/system/images/tile-sizer-470-465.gif" class="tile-sizer" alt="">');

    // Copy the tile contents.
    $('.tile-source').each(function () {
        var tileSource = $(this);
        var tileDestination = '.' + tileSource.data('destination-tile');
        $(tileDestination).append(tileSource.html());
    });

    /* B149
    $('.tile').keypress(function (e) {
        var code = e.which;
        if ((code === 13) || (code === 32)) {
            var imgTitle = $('.galleria-info-title').text();
            var exit = false;
            $('div .carousel img').each(function (index, element) {
                $.each(this.attributes, function (i, attrib) {
                    var name = attrib.name;
                    var value = attrib.value;
                    if (name === "data-title" && value.trim().toLowerCase() === imgTitle.trim().toLowerCase()) { // this is the one we want the data-link for 
                        var url = $(element).attr('data-link');
                        window.location = url;
                        exit = true;
                        return false;
                    }
                });
                if (exit) { exit = false; return false; }
            });
        }
    });
    */

    $('.ImageCarouselContainer').keypress(function (e) {
        var code = e.which;
        if ((code === 13) || (code === 32)) {
            var imgTtl = $('.galleria-info-title').text();
            var exit = false;
            $('div .carousel img').each(function (index, element) {

                $.each(carouselData, function (indxCd, objCd) {
                    if (objCd.title.trim().toLowerCase() == imgTtl.trim().toLowerCase()) {
                        window.location = objCd.link;
                        exit = true;
                        return false;
                    }
                });

                if (exit) { exit = false; return false; }
            });
        }
    });

//Rem by CT 20/08/2020 to fix text jumps around when selected
/* 
   $('div.tiles.tiles-non-mobile.visible-xxl.space-below').on('focusin focusout', 'div.tile.tile-size-single.tile-2', function (e) {
        var evnt = e.type;
        if (evnt == 'focusin') {
            $(this).find('.tile-title').css({ 'top': '50%', });
            $(this).find('.tile-description').css({ 'top': '72.73%', 'color': 'rgba(0, 0, 0, 1.0)' });
        }
        else if (evnt == 'focusout') {
            //  setTimeout(function(){ // delay for IE
            $(this).find('.tile-title').css({ 'top': '77.27%', });
            $(this).find('.tile-description').css({ 'top': '100%', 'color': 'rgba(0, 0, 0, 0.0)' });
            //  }, 5000); 
        }
    });

    $('div.tiles.tiles-non-mobile.visible-xxl.space-below').on('focusin focusout', 'div.tile.tile-size-double.tile-3', function (e) {
        var evnt = e.type;
        if (evnt == 'focusin') {
			//Rem by CT 20/08/2020 to fix text jumps around when selected
            //$(this).find('.tile-title').css({ 'top': '-30px', });
            $(this).find('.tile-description').css({ 'color': 'rgba(0, 0, 0, 1.0)' });
        }
        else if (evnt == 'focusout') {
			//Rem by CT 20/08/2020 to fix text jumps around when selected
            //$(this).find('.tile-title').css({ 'top': '0px', });
            //$(this).find('.tile-description').css({ 'color': 'rgba(0, 0, 0, 0.0)' });
			//Added by CT 20/08/2020 to fix text jumps around when selected
			$(this).find('.tile-title').removeAttr('style')
        }
    });

    $('div.tiles.tiles-non-mobile.visible-xxl.space-below').on('focusin focusout', 'div.tile.tile-size-single.tile-5', function (e) {
        var evnt = e.type;
        if (evnt == 'focusin') {
            $(this).find('.tile-title').css({ 'top': '50%', });
            $(this).find('.tile-description').css({ 'top': '72.73%', 'color': 'rgba(0, 0, 0, 1.0)' });
        }
        else if (evnt == 'focusout') {
            $(this).find('.tile-title').css({ 'top': '77.27%', });
            $(this).find('.tile-description').css({ 'top': '100%', 'color': 'rgba(0, 0, 0, 0.0)' });
        }
    });

    $('div.tiles.tiles-non-mobile.visible-xxl.space-below').on('focusin focusout', 'div.tile.tile-size-double.tile-4', function (e) {
        var evnt = e.type;
        if (evnt == 'focusin') {
			//Rem by CT 20/08/2020 to fix text jumps around when selected
            //$(this).find('.tile-title').css({ 'top': '-30px', });
            $(this).find('.tile-description').css({ 'top': '72.73%', 'color': 'rgba(0, 0, 0, 1.0)' });
        }
        else if (evnt == 'focusout') {
			//Rem by CT 20/08/2020 to fix text jumps around when selected
            //$(this).find('.tile-title').css({ 'top': '0px', });
            //$(this).find('.tile-description').css({ 'color': 'rgba(0, 0, 0, 0.0)' });
			
			//Added by CT 20/08/2020 to fix text jumps around when selected
			$(this).find('.tile-title').removeAttr('style')
        }
    });

    $('div.tiles.tiles-non-mobile.visible-xxl.space-below').on('focusin focusout', 'div.tile.tile-size-double.tile-7', function (e) {
        var evnt = e.type;
        if (evnt == 'focusin') {
			//Rem by CT 20/08/2020 to fix text jumps around when selected
            //$(this).find('.tile-title').css({ 'top': '-30px', });
            $(this).find('.tile-description').css({ 'top': '72.73%', 'color': 'rgba(255, 255, 255, 1.0)' });
        }
        else if (evnt == 'focusout') {
			//Rem by CT 20/08/2020 to fix text jumps around when selected
            //$(this).find('.tile-title').css({ 'top': '0px', });
            //$(this).find('.tile-description').css({ 'color': 'rgba(0, 0, 0, 0.0)' });
			
			//Added bu CT 20/08/2020 to fix text jumps around when selected
			$(this).find('.tile-title').removeAttr('style')
        }
    });

    $('div.tiles.tiles-non-mobile.visible-xxl.space-below').on('focusin focusout', 'div.tile.tile-size-single.tile-8', function (e) {
        var evnt = e.type;
        if (evnt == 'focusin') {
            $(this).find('.tile-title').css({ 'top': '50%', });
            $(this).find('.tile-description').css({ 'top': '72.73%', 'color': 'rgba(0, 0, 0, 1.0)' });
        }
        else if (evnt == 'focusout') {
            $(this).find('.tile-title').css({ 'top': '77.27%', });
            $(this).find('.tile-description').css({ 'top': '100%', 'color': 'rgba(0, 0, 0, 0.0)' });
        }
    });

    $('div.tiles.tiles-non-mobile.visible-xxl.space-below').on('focusin focusout', 'div.tile.tile-size-single.tile-9', function (e) {
        var evnt = e.type;
        if (evnt == 'focusin') {
            $(this).find('.tile-title').css({ 'top': '50%', });
            $(this).find('.tile-description').css({ 'top': '72.73%', 'color': 'rgba(0, 0, 0, 1.0)' });
        }
        else if (evnt == 'focusout') {
            $(this).find('.tile-title').css({ 'top': '77.27%', });
            $(this).find('.tile-description').css({ 'top': '100%', 'color': 'rgba(0, 0, 0, 0.0)' });
        }
    });
*/

    // div.tiles.tiles-non-mobile.hidden-xxs.space-below
    // div.tile.tile-size-third.tile-10  tile tile-size-third tile-11  tile tile-size-third tile-12

    // JR home page tiles 10, 11, 12
    $('div.tiles.tiles-non-mobile.hidden-xxs.space-below').on('focusin focusout', 'div.tile.tile-size-third.tile-10', function (e) {
        var evnt = e.type;
        if (evnt == 'focusin') {
            $(this).find('.tile-title').css({ 'top': '50%', });
            $(this).find('.tile-description').css({ 'top': '72.73%', 'color': 'rgba(0, 0, 0, 1.0)' });
        }
        else if (evnt == 'focusout') {
            $(this).find('.tile-title').css({ 'top': '77.27%', });
            $(this).find('.tile-description').css({ 'top': '100%', 'color': 'rgba(0, 0, 0, 0.0)' });
        }
    });

    $('div.tiles.tiles-non-mobile.hidden-xxs.space-below').on('focusin focusout', 'div.tile.tile-size-third.tile-11', function (e) {
        var evnt = e.type;
        if (evnt == 'focusin') {
            $(this).find('.tile-title').css({ 'top': '50%', });
            $(this).find('.tile-description').css({ 'top': '72.73%', 'color': 'rgba(0, 0, 0, 1.0)' });
        }
        else if (evnt == 'focusout') {
            $(this).find('.tile-title').css({ 'top': '77.27%', });
            $(this).find('.tile-description').css({ 'top': '100%', 'color': 'rgba(0, 0, 0, 0.0)' });
        }
    });

    $('div.tiles.tiles-non-mobile.hidden-xxs.space-below').on('focusin focusout', 'div.tile.tile-size-third.tile-12', function (e) {
        var evnt = e.type;
        if (evnt == 'focusin') {
            $(this).find('.tile-title').css({ 'top': '50%', });
            $(this).find('.tile-description').css({ 'top': '72.73%', 'color': 'rgba(0, 0, 0, 1.0)' });
        }
        else if (evnt == 'focusout') {
            $(this).find('.tile-title').css({ 'top': '77.27%', });
            $(this).find('.tile-description').css({ 'top': '100%', 'color': 'rgba(0, 0, 0, 0.0)' });
        }
    });

    // JR landing pages 
    $('div.tiles-non-mobile.hidden-xxs.visible-xs.visible-sm.visible-md.visible-lg.visible-xxl').on('focusin focusout', 'div.tile.tile-single', function (e) {
        var evnt = e.type;
        if (evnt == 'focusin') {
            $(this).find('.tile-title').css({ 'top': '50%', });
            $(this).find('.tile-description').css({ 'top': '72.73%', 'color': 'black' });
        }
        else if (evnt == 'focusout') {
            $(this).find('.tile-title').css({ 'top': '77.27%', });
            $(this).find('.tile-description').css({ 'top': '100%', 'color': 'rgba(0, 0, 0, 0.0)' });
        }
    });

    $('div.tiles').on('focusin focusout', 'div.tile', function (e) {
        if (e.type == 'focusin') {
            $(this).addClass('focus');
        }
        else if (e.type == 'focusout') {
            $(this).removeClass('focus');
        }
    });

    //duplicate so commenting this
    //$('div.tiles').on('focusin focusout', 'div.tile', function (e) {
    //    if (e.type == 'focusin') {
    //        $(this).addClass('focus');
    //    }
    //    else if (e.type == 'focusout') {
    //        $(this).removeClass('focus');
    //    }
    //});

    // Reset the touch functionality for tiles.
    $(document).on('click', ':not(.has_children, .has-children *)', function () {
        $('.tile').data('follow-link', false);
    });
}

function isTouchDevice() {
    return (('ontouchstart' in window) || (navigator.MaxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0));
}

function featureTileUrlSelected(newAssetUrl, newAssetText, configObject, returnValue) {

    if (window.confirm("Load values from selected page?")) {

        $.ajax({
            url: '/_layouts/15/CoM.MVGA.Common/GetPageDetails.aspx',
            data: {
                url: newAssetUrl
            },
            dataType: 'json',
            success: function (data) {
                var titleField = $("input[title='TitleText']");
                var descriptionField = $("input[title='DescriptionText']");
                var imageUrlField = $(".asset-browse-boundary.ImageUrl input[type=text]");
                var imageAltField = $("input[title='ImageAlt']");
                titleField.val(data.title);
                descriptionField.val(data.description);
                imageUrlField.val(data.imageUrl);
                imageAltField.val(data.imageAlt);
            },
            error: function (request, error) {
                //console.log(error);
            }
        });
    }
}

// Setup the About flyouts.
function setupAboutFlyouts() {

    // Setup the document to close the flyouts when clicked.
    // Setup the links that open the flyouts.
    if ($('#AboutLinks > ul > li > .header-menu-item > .header-menu-item-expand > a').length) {
        $('#AboutLinks > ul > li > .header-menu-item > .header-menu-item-expand > a').click(function (e) {
            e.preventDefault();
            hideAboutFlyouts();
            AboutLinksAction($(this));

        });
        $('#AboutLinks > ul > li').focusin(function () {
            //console.log('focusin-');
            if ($(this).children('a:focus').length) {
                hideAboutFlyouts();
            }
            $(this).addClass('selected');
            AboutLinksAction($(this).children('a'));
        });

        var ua = window.navigator.userAgent;
        var isIE = /MSIE|Trident/.test(ua);

        if (!isIE) {
            //IE specific code goes here
            $(document).click(function (e) {
                AboutLinksBlur(e);
            });
        }

        //when focus on body outside the sub
        $('body').focusin(function (e) {
            AboutLinksBlur(e);
        });

    }
    // Setup the links that close the flyouts.
    $('.flyout-container .flyout-close a').click(function () {
        hideAboutFlyouts();
        setFixedPositions();
        return false;
    });
}



function AboutLinksBlur(e) {
    var AboutLinks = $('#AboutLinks > ul > li > .header-menu-item > .header-menu-item-expand > a.selected');
    if (AboutLinks.length) {
        var AboutLinks_selected_id = AboutLinks.attr('data-target');
        if ($(AboutLinks_selected_id).css('display') == "block"
                    && !AboutLinks.is(':focus')
                    && $(AboutLinks_selected_id).find('a:focus').length == 0
                    && "#" + $(e.target).attr('id') != AboutLinks_selected_id) {
            hideAboutFlyouts(AboutLinks_selected_id);
            AboutLinks.removeClass('selected');
            setFixedPositions();
        }
    }
}
function AboutLinksAction(_self) {
    _self.addClass('selected');
    var target = $(_self.data('target'));
    //var fs = $('.fixed-sidebar')
    // var offset = fs.offset();
    target.css('top', flyoutTop + 'px');

    target.show();
    target.after('<div class="flyout-background-overlay"></div>');
    setFixedPositions();
    return false;
}
function hideAboutFlyouts(objId) {
    if (objId === undefined) {
        $('#AboutLinks a.selected').removeClass('selected');
        $('.flyout-container').hide();
        $('.flyout-background-overlay').remove();

    }
    else {
        $(objId).prev('a.selected').removeClass('selected');
        $(objId).hide();
        $('.flyout-background-overlay').remove();
    }
}


// Setup the left hand navigation.
function setupLHN(queryString) {
    // Mobile nav
    // Left-hand navigation expand animation.


    // Expand any items that are meant to be showing as expanded.
    $('.left-navigation.top-level:not(.hidden) .expandable .fa-minus').each(function () {
        $(this).parent().siblings('ul').show();
    });

    // Left-hand navigation expand animation.
    $('.left-navigation .menuitem .nav2').click(function () {
        if ($(this).parent().find('.fa-minus').length != 0)
            expandMinusLHNItem($(this));
        else if ($(this).parent().find('.fa-plus').length != 0)
            expandLHNItem($(this));

        return false;
    });

    $('.left-navigation .menuitem').mouseenter(function () {
        hoverLHNItem($(this));
        return false;
    });
    $('.left-navigation .menuitem').mouseleave(function () {
        mouseoutLHNItem($(this));
        return false;
    });




    // Display top-level nav, and hide current-level nav, if the "back to level 1" item is clicked.
    // Display top-level nav, and hide current-level nav, if the "back to level 1" item is clicked.
    $('.left-navigation .go-back .cross').click(function () {
        $('.left-navigation.top-level').removeClass('hidden').attr('aria-hidden', 'false');
        // $('.left-navigation.top-level').children('.fa-minus').removeClass('fa-minus').addClass('fa-plus');
        // var a = $(this).parent();
        // $(this).parent().find('.fa-minus').removeClass('fa-minus').addClass('fa-plus');
        //var a = $('.left-navigation.top-level');
        //var b =  $('.left-navigation.top-level .expandable > li ').children('ul');
        $('.left-navigation.top-level').each(function () {
            // inner scope
            $(this).children('li:not(.NonSelectedMenuItem)').each(function () {

                $(this).find('.menuitem').find('.fa-minus').removeClass('fa-minus').addClass('fa-plus').parent().attr('title', 'Expand');
                $(this).find('ul').slideUp();

            });
        });

        $('.left-navigation.current-level').addClass('hidden').attr('aria-hidden', 'true');
        return false;
    });


    // Hide About Council and About Melbourne from the desktop version of the LHN.
    $('.left-sidebar .left-navigation.top-level li a span:contains("About Council")').parent().parent().parent().parent().remove();
    $('.left-sidebar .left-navigation.top-level li a span:contains("About Melbourne")').parent().parent().parent().parent().remove();
    $('.left-sidebar .left-navigation.top-level li a span:contains("Recent")').parent().parent().parent().remove();

    var urlPath = window.location.pathname.substr(1, 14).toLowerCase();

    if (urlPath.indexOf("news-and-media") < 0) {
        $('.left-navigation.top-level li a span:contains("News and media")').parent().parent().parent().parent().remove();
    }
    if (urlPath.indexOf("careers") < 0) {
        $('.left-navigation.top-level li a span:contains("Careers")').parent().parent().parent().parent().remove();
    }

    if (urlPath.indexOf("news-and-media") >= 0) {
        var duplicate = {};
        $('.left-sidebar .left-navigation.current-level li a.hreflink').each(function () {
            var txt = $(this).text();
            var href = $(this).attr('href');
            if (duplicate[href])
                $(this).parent().parent().remove();
            else
                duplicate[href] = true;
        });

        duplicate = {};
        $('.left-sidebar .left-navigation.top-level li a.hreflink').each(function () {
            var txt = $(this).text();
            var href = $(this).attr('href');
            if (duplicate[href])
                $(this).parent().parent().remove();
            else
                duplicate[href] = true;
        });
    }

    $('a.expand-only.childless').attr('aria-hidden', 'true');
}

// Expand an item in the left hand navigation.
function expandLHNItem(anchor) {

    // Close all siblings.
    anchor.parent().parent().siblings().each(function () {
        $(this).children('.selected').removeClass('selected');
        //$(this).children('ul').slideUp();
        //var s =$(this).siblings('li');
        //$(this).siblings('li').find('.fa:first:not(.fa-home)').removeClass('fa-minus').addClass('fa-plus');
        $(this).find('ul').slideUp();

        //var s =$(this).siblings('li');
        $(this).find('.fa:not(.fa-home)').removeClass('fa-minus').addClass('fa-plus').parent().attr('title', 'Expand');;

        if ($(this).parent('.top-level').length) {
            anchor.parent().addClass('selected');
            //anchor.parent().parent().addClass('selected');
            if (anchor.parent().hasClass('SelectedMenuItem')) {
                anchor.parent().not('.selected').css({
                    "background-color": "#277BB4",
                    "color": "#fff"
                });

            }
            else {

                anchor.parent().css({
                    "background-color": "#989eab"
                });
            }
            var a = anchor.parent().parent().parent();
            anchor.parent().parent().siblings(':not(.main-menu)').children('.menuitem:not(.SelectedMenuItem)').css({
                "background-color": "#c0c5d2"
            });
        }
    });

    // Expand the children.

    anchor.parent().addClass('selected');

    anchor.parent().siblings('ul').slideDown();
    anchor.parent().parent().find('.hierarchy').slideDown();
    var selectedMenuItems = anchor.parent().parent().find('.hierarchy').first();
    var selectedMenuChilds = selectedMenuItems.find('li:not(.NonSelectedMenuItem,.childless)');
    var selectedMenu = selectedMenuChilds.children('.menuitem')
    selectedMenu.find('.fa-plus').removeClass('fa-plus').addClass('fa-minus').parent().attr('title', 'Collapse');

    //findSelectedMenuItems(s);
    //$(this).find('.fa-plus').removeClass('fa-plus').addClass('fa-minus');



    anchor.parent().find('.fa').removeClass('fa-plus').addClass('fa-minus').parent().attr('title', 'Collapse');

    //anchor.parent().parent().siblings('.nav2').find('.fa').removeClass('fa-plus').addClass('fa-minus');  

    $('a.expand-only.childless').attr('aria-hidden', 'true');
    // $('.fa-plus').parent().attr('aria-expanded', 'false').attr('title', 'Expand');
    // $('.fa-minus').parent().attr('aria-expanded', 'true').attr('title', 'Collapse');
}

function expandMinusLHNItem(anchor) {

    // Close all siblings.

    $(this).children('.selected').removeClass('selected');
    //var a = $(this).parent().parent().parent();
    anchor.parent().parent().parent().find('.hideAboveLevel').removeClass('hideAboveLevel');
    //anchor.parent().siblings('ul').slideUp();
    anchor.parent().parent().find('ul:not(.selected)').slideUp();
    anchor.parent().parent().find('.fa:not(.selected)').removeClass('fa-minus').addClass('fa-plus').parent().attr('title', 'Expand');
    //anchor.parent().siblings('.nav2').find('.fa').removeClass('fa-plus').addClass('fa-minus');

    $('a.expand-only.childless').attr('aria-hidden', 'true');

    // $('.fa-plus').parent().attr('aria-expanded', 'false').attr('title', 'Expand');
    // $('.fa-minus').parent().attr('aria-expanded', 'true').attr('title', 'Collapse');
}

// Hover an Top item in the left hand navigation.
// Hover an Top item in the left hand navigation.
function hoverLHNItem(anchor) {

    // Close all siblings.
    anchor.parent().siblings().each(function () {

        if ($(this).parent('.top-level').length) {
            anchor.css({
                "background-color": "#989eab"
            });
            $(this).children('.menuitem:not(.selected,.SelectedMenuItem)').css({
                "background-color": "#c0c5d2"
            });

        }
    });

}

// Mouse Out an Top item in the left hand navigation.
function mouseoutLHNItem(anchor) {

    // Close all siblings.
    anchor.parent().siblings().each(function () {

        if ($(this).parent('.top-level').length) {
            if (anchor.hasClass('SelectedMenuItem')) {
                anchor.css({
                    "background-color": "#277BB4"
                });
            }
            else {
                anchor.not('.selected').css({
                    "background-color": "#c0c5d2"
                });
            }
        }
    });
}


//if (isTouchDevice()) { // remove all :hover stylesheets

//}


// Setup the crumb bar.
function setupCrumbBar() {

    // Populate the crumb bar.
    populateCrumbBar($('#RightNavigation ul').eq(0), $('#ReportAnIssueColumnA'), $('#ReportAnIssueColumnB'), $('#ReportAnIssueColumnC'));
    populateCrumbBar($('#RightNavigation ul').eq(1), $('#IWantToColumnA'), $('#IWantToColumnB'), $('#IWantToColumnC'));
    populateCrumbBar($('#RightNavigation ul').eq(2), $('#RecentlyVisitedColumnA'), $('#RecentlyVisitedColumnB'), $('#RecentlyVisitedColumnC'));

    // Crumb bar tab events.
    $('#CrumbBar .crumb-tab').click(function () {
        var tab = $(this);
        var panelId = tab.data('toggle');
        if (panelId != '') {
            var panel = $('.crumb-tab-panel#' + panelId);
            if (!tab.hasClass('selected')) {
                tab.addClass('selected');

                panel.slideDown();
                if ($(window).width() < 992)
                {
                    
                    var leftpDownArrow = parseInt(tab.offset().left) + parseInt(10); //- parseInt(tab.context.offsetWidth);
                    var attrVal =  '#ffede5 url(/system/images/acc_selectARW.png) no-repeat ' +  leftpDownArrow + 'px 0';
                    $('.crumb-tab-panel').css('background', attrVal);
                }
                
            }
            else {
                tab.removeClass('selected');
                panel.slideUp();
            }
            tab.siblings().removeClass('selected');
            panel.siblings('.crumb-tab-panel').hide();
        }

    });

    // Close events.
    $('.crumb-tab-panel-close').click(function () {
        $('.crumb-tab.selected').removeClass('selected');
        $(this).parents('.crumb-tab-panel').slideUp();
    });
    $('#CrumbBar .crumb-tab').eq(0).click(function () {
        $('#RightNavigation .accordion').accordion('option', 'active', 0);
    });
    $('#CrumbBar .crumb-tab').eq(1).click(function () {
        $('#RightNavigation .accordion').accordion('option', 'active', 1);
    });
    $('#CrumbBar .crumb-tab').eq(2).click(function () {
        $('#RightNavigation .accordion').accordion('option', 'active', 2);
    });
}

// Populate the crumb bar from the RHN.
function populateCrumbBar(sourceList, destinationColumnA, destinationColumnB, destinationColumnC) {
    var thirdCount = Math.ceil(sourceList.children().length / 3);
    sourceList.children().slice(0, thirdCount).clone().appendTo(destinationColumnA);
    if (thirdCount < sourceList.children().length)
        sourceList.children().slice(thirdCount, thirdCount * 2).clone().appendTo(destinationColumnB);
    if (thirdCount * 2 < sourceList.children().length)
        sourceList.children().slice(thirdCount * 2).clone().appendTo(destinationColumnC);
}

// Break up the querystring.
function getQueryString() {
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for (var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}
/*********Breadcrumb Set Width For ipad***********/

ResizeBreadCrumb();
function ResizeBreadCrumb() {
    //alert($(window).width());
    if ($(window).width() >= 978) {
        var ContentAreaContainer = $('#ContentAreaContainer');
        var contentAreawidth = getObjectWidth(ContentAreaContainer, false);
        var rightNavWidthWithPadding = 47;

        var breadcrumbWidth = contentAreawidth - rightNavWidthWithPadding;

        $('#ContentContainerInner #Breadcrumb').width(breadcrumbWidth);
    }
    else if ($(window).width() < 992) {

        $('#ContentContainerInner #Breadcrumb').css('width', '100%');

    }
}
$(window).resize(function () {
    ResizeBreadCrumb();
});

// Get the width of the specified element.
function getObjectWidth(jQueryObject, zeroIfInvisible) {
    var width = 0;
    if (!zeroIfInvisible || jQueryObject.is(':visible')) {
        width = jQueryObject.outerWidth();
    }
    return width;
}

// Set the positions of all fixed elements.
function setFixedPositions() {


    // Calculations.
    var windowScrollTop = $(window).scrollTop();

    if (ribbonRow.height() != null) {

        var ribbonRowBottom = ribbonRow.position().top + ribbonRow.height();
        // Snap the top of the workspace to the bottom of the ribbon row (if visible).
        workspace.css({
            top: ribbonRowBottom + 'px'
        });
    }
    // Position the logo bar differently depending on whether or not it's sticky.
    if (logoBar.length > 0) {
        var logoBarBottom;
        if (logoBar.hasClass('sticky') && ribbonRow.height() != null) {
            var ribbonRowBottom = ribbonRow.position().top + ribbonRow.height();
            logoBar.css({
                top: ribbonRowBottom + 'px'
            });
            logoBarBottom = logoBar.position().top + logoBar.height();
        }
        else {
            logoBar.css({
                top: '0'
            });
            logoBarBottom = logoBar.offset().top - windowScrollTop + logoBar.height();
        }
    }
    // Find the bottom of the emergency bar.
    var emergencyBarBottom = 0;
    if (emergencyBar.length > 0) {
        emergencyBarBottom = emergencyBar.offset().top - windowScrollTop + emergencyBar.outerHeight();
    }

    // Snap the top of the fixed sidebars to the bottom of the logo bar.
    var sidebarTop = logoBarBottom;
    var sidebarTop = Math.max(logoBarBottom, emergencyBarBottom);
    flyoutTop = logoBarBottom;
    // Calculate the edges of the sidebars.
    var leftSidebarLeft = mainArea.offset().left;

    // Calculate the bottom edge of the fixed sidebars.
    var sidebarBottom = 0;
    var footerTop = footer.offset().top - windowScrollTop;
    if (footerTop <= window.innerHeight) {
        sidebarBottom = window.innerHeight - footerTop + 10;
    }

    // Apply the sidebar positioning.
    $('.fixed-sidebar').css({ top: sidebarTop + 'px' });
    $('.fixed-sidebar').css({ bottom: sidebarBottom + 'px' });
    $('.left-sidebar').css({ left: leftSidebarLeft + 'px' });

    // Calculate social share wrapper top position.
    //var socialShare = $('.social-share');
    //if (socialShare.length > 0) {
    //    var socialShareBottom = socialShare.position().top + socialShare.height();
    //    $('.social-share-tooltip').css({ top: socialShareBottom + 7 + 'px' });
    //    $('.social-share-wrapper').css({ top: socialShareBottom - 3 + 'px' });
    //}


}

// Get the height of the specified element.
function getObjectHeight(jQueryObject, zeroIfInvisible) {
    var height = 0;
    if (!zeroIfInvisible || jQueryObject.is(':visible')) {
        height = jQueryObject.height();
    }
    return height;
}

// Do the search.
function doSearch(searchText) {
    if (searchText.toLowerCase().indexOf('http') !== 0) {
        window.location = '/pages/search-results.aspx?k=' + searchText + '&type=web';
    }
    else {
        window.location = searchText;
    }
}

// Setup the search box.
function setupSearchBox() {
    // Expand the search box when it has the focus.
    $('#LogoBar .searchbox input[type=text], #LogoBar .searchbox input[type=search]').focusin(function () {
        $(this).siblings('.search-icon').removeClass('fa-search').addClass('fa-search-plus');
        $(this).animate({ width: '366px' });
    });
    $('#LogoBar .searchbox input[type=text], #LogoBar .searchbox input[type=search]').focusout(function () {
        $(this).siblings('.search-icon').removeClass('fa-search-plus').addClass('fa-search');
        $(this).animate({ width: '230px' });
    });

    // Setup autocomplete JR - this displays search suggestions need to pick up copy for Finders 
    var autocomplete_objs = '#LogoBar .searchbox input[type=text], #MobileSearchBar .searchbox input[type=text], #LogoBar .searchbox input[type=search], #MobileSearchBar .searchbox input[type=search]';
    $(autocomplete_objs)
      .catcomplete({
          minLength: 1,
          delay: 0,
          html: true,
          source: function (request, response) {
              $.ajax({
                  url: '/_layouts/15/CoM.MVGA.Search/Suggestions.aspx',
                  data: {
                      k: request.term,
                      limit: 5
                  },
                  dataType: 'json',
                  success: function (data) {
                      response(data);
                  },
                  error: function (request, error) {
                      //console.log(error);
                  }
              });
          },
          open: function (event, ui) {
              self = this;
              $('.ui-autocomplete').off('menufocus hover mouseover mouseenter');
              $('.ui-autocomplete a').off('menufocus hover mouseover mouseenter');
              $('html,body').scroll(function (e) {
                  clearTimeout(self.closing);
                  if (self.element[0] !== doc.activeElement) {
                      self.element.focus();
                  }
              });
          },
          select: function (event, ui) {
              doSearch(ui.item.value);
          }
      });

    // Perform search when enter is pressed.
    $('.searchbox input[type=text], .searchbox input[type=search]').keypress(function (e) {
        if (e.which == 13) {
            doSearch($(this).val());
            return false;
        }
    });

    // Perform search when search icon is clicked.
    $('.search-icon').click(function () {
        performSearch();
    });

    // Perform search when search icon is clicked.
    $('.search-icon').keypress(function (e) {
        if (e.which == 13) {
            performSearch();
        }
    });
}


function setupSearchFinderResultsPage() {
    $('#ContentArea .keySearchBox input[type=text], #ContentArea .keySearchBox input[type=search]').focusin(function () {
        $(this).siblings('.finderSearchBtn').removeClass('fa-search').addClass('fa-search-plus');
    });

    $('#ContentArea .keySearchBox input[type=text], #ContentArea .keySearchBox input[type=search]').focusout(function () {
        $(this).siblings('.finderSearchBtn').removeClass('fa-search-plus').addClass('fa-search');
    });

    $.widget("custom.catcomplete", $.ui.autocomplete, {
        _create: function () {
            var self = this;
            this._super();
            this.widget().menu("option", "items", "> :not(.ui-autocomplete-category)");
        },
        _renderMenu: function (ul, items) {
            var that = this,
            currentCategory = "";
            $.each(items, function (index, item) {
                var li;
                if (item.category != currentCategory) {
                    ul.append("<li class='ui-autocomplete-category'>" + item.category + "</li>");
                    currentCategory = item.category;
                }
                li = that._renderItemData(ul, item);
                if (item.category) {
                    li.attr("aria-label", item.category + " : " + item.label);
                }
            });
        },
        _renderItem: function (ul, item) {
			//added by Chau to remove special characters to stop "Cross-site" scripting 
			item.label = item.label.replace(/[^a-zA-Z0-9!@#$%^&* ]/g, " ");
			
            item.label = item.label.replace(new RegExp("(?![^&;]+;)(?!<[^<>]*)(" + $.ui.autocomplete.escapeRegex(this.term) + ")(?![^<>]*>)(?![^&;]+;)", "gi"), "<strong>$1</strong>");
            return $("<li></li>")
                .data("item.autocomplete", item)
                .append("<a>" + item.label + "</a>")
                .appendTo(ul);
        }
    });

    $(".keySearchBox").catcomplete({
        minLength: 1,
        delay: 0,
        html: true,
        source: function (request, response) {
            $.ajax({
                url: '/_layouts/15/CoM.MVGA.Search/Suggestions.aspx',
                data: {
                    k: request.term,
                    limit: 5
                },
                dataType: 'json',
                success: function (data) {
                    response(data);

                },
                error: function (request, error) {
                    //console.log(error);
                }
            });
        },
        open: function (event, ui) {
            self = this;
            $('.ui-autocomplete').off('menufocus hover mouseover mouseenter');
            $('.ui-autocomplete a').off('menufocus hover mouseover mouseenter');
            $('html,body').scroll(function (e) {
                clearTimeout(self.closing);
                if (self.element[0] !== doc.activeElement) {
                    self.element.focus();
                }
            });
        },

        select: function (event, ui) {
            doSearch(ui.item.value);
        }
    });

    // Perform search when enter is pressed.
    $('.keySearchBox input[type=text], .keySearchBox input[type=search]').keypress(function (e) {
        if (e.which == 13) {
            doSearch($(this).val());
            return false;
        }
    });

    // Perform search when search icon is clicked.
    $('.finderSearchBtn').click(function () {
        performSearchResults();
    });

    // Perform search when search icon is clicked.
    $('.finderSearchBtn').keypress(function (e) {
        if (e.which == 13) {
            performSearchResults();
        }
    });
}

function performSearchResults() {
    doSearch($('.keySearchBox input[type=search]').val());
}

function setupSearchGenericFinderMediaRelease() {

    // Setup autocomplete JR - this displays search suggestions need to pick up copy for Finders 
    $.widget("custom.catcomplete", $.ui.autocomplete, {
        _create: function () {
            var self = this;
            this._super();
            this.widget().menu("option", "items", "> :not(.ui-autocomplete-category)");
        },
        _renderMenu: function (ul, items) {
            var that = this,
            currentCategory = "";
            $.each(items, function (index, item) {
                var li;
                if (item.category != currentCategory) {
                    ul.append("<li class='ui-autocomplete-category'>" + item.category + "</li>");
                    currentCategory = item.category;
                }
                li = that._renderItemData(ul, item);
                if (item.category) {
                    li.attr("aria-label", item.category + " : " + item.label);
                }
            });
        },
        _renderItem: function (ul, item) {
			//added by Chau to remove special characters to stop "Cross-site" scripting 
			item.label = item.label.replace(/[^a-zA-Z0-9!@#$%^&* ]/g, " ");
			
            item.label = item.label.replace(new RegExp("(?![^&;]+;)(?!<[^<>]*)(" + $.ui.autocomplete.escapeRegex(this.term) + ")(?![^<>]*>)(?![^&;]+;)", "gi"), "<strong>$1</strong>");
            return $("<li></li>")
                .data("item.autocomplete", item)
                .append("<a>" + item.label + "</a>")
                .appendTo(ul);
        }
    });

    $(".finderMediaRelease").catcomplete({
        minLength: 1,
        delay: 0,
        html: true,
        source: function (request, response) {
            $.ajax({
                url: '/_layouts/15/CoM.MVGA.Search/SuggestionsMediaRelease.aspx',
                data: {
                    k: request.term,
                    limit: 5
                },
                dataType: 'json',
                success: function (data) {
                    response(data);

                },
                error: function (request, error) {
                    //console.log(error);
                }
            });
        },
        open: function (event, ui) {
            self = this;
            $('.ui-autocomplete').off('menufocus hover mouseover mouseenter');
            $('.ui-autocomplete a').off('menufocus hover mouseover mouseenter');
            $('html,body').scroll(function (e) {
                clearTimeout(self.closing);
                if (self.element[0] !== doc.activeElement) {
                    self.element.focus();
                }
            });
        },

        select: function (event, ui) {
            doSearchMediaRelease(ui.item.value);
        },

    });
}

function setupSearchFinderMediaRelease() {

    // Setup autocomplete JR - this displays search suggestions need to pick up copy for Finders 
    $.widget("custom.catcomplete", $.ui.autocomplete, {
        _create: function () {
            var self = this;
            this._super();
            this.widget().menu("option", "items", "> :not(.ui-autocomplete-category)");
        },
        _renderMenu: function (ul, items) {
            var that = this,
            currentCategory = "";
            $.each(items, function (index, item) {
                var li;
                if (item.category != currentCategory) {
                    ul.append("<li class='ui-autocomplete-category'>" + item.category + "</li>");
                    currentCategory = item.category;
                }
                li = that._renderItemData(ul, item);
                if (item.category) {
                    li.attr("aria-label", item.category + " : " + item.label);
                }
            });
        },
        _renderItem: function (ul, item) {
			//added by Chau to remove special characters to stop "Cross-site" scripting 
			item.label = item.label.replace(/[^a-zA-Z0-9!@#$%^&* ]/g, " ");
			
            item.label = item.label.replace(new RegExp("(?![^&;]+;)(?!<[^<>]*)(" + $.ui.autocomplete.escapeRegex(this.term) + ")(?![^<>]*>)(?![^&;]+;)", "gi"), "<strong>$1</strong>");
            return $("<li></li>")
                .data("item.autocomplete", item)
                .append("<a>" + item.label + "</a>")
                .appendTo(ul);
        }
    });

    $(".mediaSearchInput").catcomplete({
        minLength: 1,
        delay: 0,
        html: true,
        source: function (request, response) {
            $.ajax({
                url: '/_layouts/15/CoM.MVGA.Search/SuggestionsMediaRelease.aspx',
                data: {
                    k: request.term,
                    limit: 5
                },
                dataType: 'json',
                success: function (data) {
                    response(data);

                },
                error: function (request, error) {
                    //console.log(error);
                }
            });
        },
        open: function (event, ui) {
            self = this;
            $('.ui-autocomplete').off('menufocus hover mouseover mouseenter');
            $('.ui-autocomplete a').off('menufocus hover mouseover mouseenter');
            $('html,body').scroll(function (e) {
                clearTimeout(self.closing);
                if (self.element[0] !== doc.activeElement) {
                    self.element.focus();
                }
            });
        },

        select: function (event, ui) {
            doSearchMediaRelease(ui.item.value);
        }
    });
}

// Do the search Generic Finder Media Release.
function doSearchMediaRelease(searchText) {
    if (searchText.toLowerCase().indexOf('http') !== 0) {
        window.location = '/news-and-media/Pages/media-release-search.aspx?k=' + searchText;
    }
    else {
        window.location = searchText;
    }
}

// add search suggestions on txt type to Meeting finder
function setupSearchGenericFinderMeeting() {
    // Setup autocomplete JR - this displays search suggestions need to pick up copy for Finders 
    $.widget("custom.catcomplete", $.ui.autocomplete, {

        _create: function () {
            var self = this;
            this._super();
            this.widget().menu("option", "items", "> :not(.ui-autocomplete-category)");
        },
        _renderMenu: function (ul, items) {
            var that = this,
            currentCategory = "";
            $.each(items, function (index, item) {
                var li;
                if (item.category != currentCategory) {
                    ul.append("<li class='ui-autocomplete-category'>" + item.category + "</li>");
                    currentCategory = item.category;
                }
                li = that._renderItemData(ul, item);
                if (item.category) {
                    li.attr("aria-label", item.category + " : " + item.label);
                }
            });
        },
        _renderItem: function (ul, item) {
			//added by Chau to remove special characters to stop "Cross-site" scripting 
			item.label = item.label.replace(/[^a-zA-Z0-9!@#$%^&* ]/g, " ");
			
            item.label = item.label.replace(new RegExp("(?![^&;]+;)(?!<[^<>]*)(" + $.ui.autocomplete.escapeRegex(this.term) + ")(?![^<>]*>)(?![^&;]+;)", "gi"), "<strong>$1</strong>");
            return $("<li></li>")
                .data("item.autocomplete", item)
                .append("<a>" + item.label + "</a>")
                .appendTo(ul);
        }
    });

    $(".finderMeetings").catcomplete({
        minLength: 1,
        delay: 0,
        html: true,
        source: function (request, response) {
            $.ajax({
                url: '/_layouts/15/CoM.MVGA.Search/SuggestionsMeeting.aspx',
                data: {
                    k: request.term,
                    limit: 5
                },
                dataType: 'json',
                success: function (data) {
                    response(data);

                },
                error: function (request, error) {
                    //console.log(error);
                }
            });
        },
        open: function (event, ui) {
            self = this;
            $('.ui-autocomplete').off('menufocus hover mouseover mouseenter');
            $('.ui-autocomplete a').off('menufocus hover mouseover mouseenter');
            $('html,body').scroll(function (e) {
                clearTimeout(self.closing);
                if (self.element[0] !== doc.activeElement) {
                    self.element.focus();
                }
            });
        },
        select: function (event, ui) {
            doSearchMeeting(ui.item.value);
        },
    });
}

// add search suggestions on txt type to Meeting finder
function setupSearchFinderMeeting() {
    // Setup autocomplete JR - this displays search suggestions need to pick up copy for Finders 
    $.widget("custom.catcomplete", $.ui.autocomplete, {

        _create: function () {
            var self = this;
            this._super();
            this.widget().menu("option", "items", "> :not(.ui-autocomplete-category)");
        },
        _renderMenu: function (ul, items) {
            var that = this,
            currentCategory = "";
            $.each(items, function (index, item) {
                var li;
                if (item.category != currentCategory) {
                    ul.append("<li class='ui-autocomplete-category'>" + item.category + "</li>");
                    currentCategory = item.category;
                }
                li = that._renderItemData(ul, item);
                if (item.category) {
                    li.attr("aria-label", item.category + " : " + item.label);
                }
            });
        },
        _renderItem: function (ul, item) {
			//added by Chau to remove special characters to stop "Cross-site" scripting 
			item.label = item.label.replace(/[^a-zA-Z0-9!@#$%^&* ]/g, " ");
			
            item.label = item.label.replace(new RegExp("(?![^&;]+;)(?!<[^<>]*)(" + $.ui.autocomplete.escapeRegex(this.term) + ")(?![^<>]*>)(?![^&;]+;)", "gi"), "<strong>$1</strong>");
            return $("<li></li>")
                .data("item.autocomplete", item)
                .append("<a>" + item.label + "</a>")
                .appendTo(ul);
        }
    });

    $(".meetingSearchInput").catcomplete({
        minLength: 1,
        delay: 0,
        html: true,
        source: function (request, response) {
            $.ajax({
                url: '/_layouts/15/CoM.MVGA.Search/SuggestionsMeeting.aspx',
                data: {
                    k: request.term,
                    limit: 5
                },
                dataType: 'json',
                success: function (data) {
                    response(data);

                },
                error: function (request, error) {
                    //console.log(error);
                }
            });
        },
        open: function (event, ui) {
            self = this;
            $('.ui-autocomplete').off('menufocus hover mouseover mouseenter');
            $('.ui-autocomplete a').off('menufocus hover mouseover mouseenter');
            $('html,body').scroll(function (e) {
                clearTimeout(self.closing);
                if (self.element[0] !== doc.activeElement) {
                    self.element.focus();
                }
            });
        },

        select: function (event, ui) {
            doSearchMeeting(ui.item.value);
        }
    });
}

// Do the search Generic Finder Media Release.
function doSearchMeeting(searchText) {
    if (searchText.toLowerCase().indexOf('http') !== 0) {
        window.location = '/Pages/Meetings-finder.aspx?k=' + searchText;
    }
    else {
        window.location = searchText;
    }
}

// pubSearchInput
function setupSearchFinderPublication() {
    // Setup autocomplete JR - this displays search suggestions need to pick up copy for Finders 
    $.widget("custom.catcomplete", $.ui.autocomplete, {

        _create: function () {
            var self = this;
            this._super();
            this.widget().menu("option", "items", "> :not(.ui-autocomplete-category)");
        },
        _renderMenu: function (ul, items) {
            var that = this,
            currentCategory = "";
            $.each(items, function (index, item) {
                var li;
                if (item.category != currentCategory) {
                    ul.append("<li class='ui-autocomplete-category'>" + item.category + "</li>");
                    currentCategory = item.category;
                }
                li = that._renderItemData(ul, item);
                if (item.category) {
                    li.attr("aria-label", item.category + " : " + item.label);
                }
            });
        },
        _renderItem: function (ul, item) {
			//added by Chau to remove special characters to stop "Cross-site" scripting 
			item.label = item.label.replace(/[^a-zA-Z0-9!@#$%^&* ]/g, " ");
			
            item.label = item.label.replace(new RegExp("(?![^&;]+;)(?!<[^<>]*)(" + $.ui.autocomplete.escapeRegex(this.term) + ")(?![^<>]*>)(?![^&;]+;)", "gi"), "<strong>$1</strong>");
            return $("<li></li>")
                .data("item.autocomplete", item)
                .append("<a>" + item.label + "</a>")
                .appendTo(ul);
        }
    });

    $(".pubSearchInput").catcomplete({
        minLength: 1,
        delay: 0,
        html: true,
        source: function (request, response) {
            $.ajax({
                url: '/_layouts/15/CoM.MVGA.Search/SuggestionsPublication.aspx',
                data: {
                    k: request.term,
                    limit: 5
                },
                dataType: 'json',
                success: function (data) {
                    response(data);

                },
                error: function (request, error) {
                    //console.log(error);
                }
            });
        },
        open: function (event, ui) {
            self = this;
            $('.ui-autocomplete').off('menufocus hover mouseover mouseenter');
            $('.ui-autocomplete a').off('menufocus hover mouseover mouseenter');
            $('html,body').scroll(function (e) {
                clearTimeout(self.closing);
                if (self.element[0] !== doc.activeElement) {
                    self.element.focus();
                }
            });
        },

        select: function (event, ui) {
            doSearchPublication(ui.item.value);
        },
    });
}

// Do the search.
function doSearchPublication(searchText) {
    if (searchText.toLowerCase().indexOf('http') !== 0) {
        window.location = '/Pages/Plans-and-publications.aspx?k=' + searchText;
    }
    else {
        window.location = searchText;
    }
}

function performSearch() {
    if ($('#MobileSearchBar').attr('style') == 'display: block;') {
        // Mobile search
        doSearch($("div [class='searchbox-inner']").children('input[type=search]').val());
    }
    else {
        // Desktop search
        doSearch($('.searchbox input[type=search]').val());
    }
}

// Special processing for facility pages.
function setupFacilityPage() {

    // Remove the 'fake tabs' for tab panes that don't have any content.
    $('h2.fake-tab').each(function () {
        var siblingText = $(this).siblings().text().trim();
        if (siblingText == '') {
            $(this).hide();
            $(this).removeClass('visible-xs');
        }
    });

    // Hide any tabs which point to empty panes.
    $('.nav-tabs li').each(function () {
        var tab = $(this);
        var tabText = tab.text().trim();
        var paneId = $(this).children('a').attr('href');
        var pane = $(paneId);
        var paneText = pane.text().trim();
        if (paneText == tabText) {
            $(this).hide();
        }
    });

    // Show the first visible tab.	
    $('.nav-tabs li:visible a').first().tab('show');

    // Add carets.
    $('.tab-content .carets h3').before('<span class="fa fa-caret-right heading-icon"></span>');

}

// Asset selected using the asset browse button.
function assetSelected(newAssetUrl, newAssetText, configObject, returnValue) {

    // Find the browse button container.
    var browseButtonContainer = $('#' + configObject.ClientID);

    // Find the browse boundary.
    var browseBoundary = browseButtonContainer.parents('.asset-browse-boundary');

    // Find the input control.
    var inputControl = browseBoundary.find('input[type=text]');

    // Set the value.
    inputControl.val(newAssetUrl);

}

//WILLIAM PART START
//ACCORDION START


//function to generate uuid and return
function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;

}

$('document').ready(function () {
    //TOGGLE FAQ SETS 

    $(".accordionTitleHeader").on('click keypress', function (e) {

        //collapse all children questions and answers
        if (e.type == "touchstart" || e.type == "click" || e.which === 13 || e.which === 32) {
            $(this).parent().children('.accordionQuestion').slideToggle();
            $(this).find('.accfix').toggleClass("fa-minus");

            if ($(this).find('.accfix').hasClass("fa-minus")) {
                $(this).find('.accfix').attr("aria-label", "collapse");
                $(this).find('.accfix').attr('aria-expanded', 'true');
                $(this).find('.accfix').attr('title', 'collapse');

            }
            else {
                $(this).find('.accfix').attr("aria-label", "expand");
                $(this).find('.accfix').attr('aria-expanded', 'false');
                $(this).find('.accfix').attr('title', 'expand');
            }

            $(this).find('.accfixBig').toggleClass("fa-minus");

            if ($(this).find('.accfixBig').hasClass("fa-minus")) {
                $(this).find('.accfixBig').attr("aria-label", "collapse");
                $(this).find('.accfixBig').attr('aria-expanded', 'true');
                $(this).find('.accfixBig').attr('title', 'collapse');

            }
            else {
                $(this).find('.accfixBig').attr("aria-label", "expand");
                $(this).find('.accfixBig').attr('aria-expanded', 'false');
                $(this).find('.accfixBig').attr('title', 'expand');
            }

            $(this).find('.accfixSmall').toggleClass("fa-minus");

            if ($(this).find('.accfixSmall').hasClass("fa-minus")) {
                $(this).find('.accfixSmall').attr("aria-label", "collapse");
                $(this).find('.accfixSmall').attr('aria-expanded', 'true');
                $(this).find('.accfixSmall').attr('title', 'collapse');

            }
            else {
                $(this).find('.accfixSmall').attr("aria-label", "expand");
                $(this).find('.accfixSmall').attr('aria-expanded', 'false');
                $(this).find('.accfixSmall').attr('title', 'expand');
            }
        }
    });

    //toggle questions and answers

    $(".accordionQuestion .accordionQAHeader").on('click keypress', function (e) {

        if (e.type == "touchstart" || e.type == "click" || e.which === 13 || e.which === 32) {
            $(this).next('.accordionAnswer').slideToggle();
            $(this).find('.accfix').toggleClass("fa-minus");
            if ($(this).find('.accfix').hasClass("fa-minus")) {
                $(this).find('.accfix').attr("aria-label", "collapse");
                $(this).find('.accfix').attr('aria-expanded', 'true');
                $(this).find('.accfix').attr('title', 'collapse');
            }
            else {
                $(this).find('.accfix').attr("aria-label", "expand");
                $(this).find('.accfix').attr('aria-expanded', 'false');
                $(this).find('.accfix').attr('title', 'expand');
            }

            $(this).find('.accfixBig').toggleClass("fa-minus");
            if ($(this).find('.accfixBig').hasClass("fa-minus")) {
                $(this).find('.accfixBig').attr("aria-label", "collapse");
                $(this).find('.accfixBig').attr('aria-expanded', 'true');
                $(this).find('.accfixBig').attr('title', 'collapse');
            }
            else {
                $(this).find('.accfixBig').attr("aria-label", "expand");
                $(this).find('.accfixBig').attr('aria-expanded', 'false');
                $(this).find('.accfixBig').attr('title', 'expand');
            }

            $(this).find('.accfixSmall').toggleClass("fa-minus");
            if ($(this).find('.accfixSmall').hasClass("fa-minus")) {
                $(this).find('.accfixSmall').attr("aria-label", "collapse");
                $(this).find('.accfixSmall').attr('aria-expanded', 'true');
                $(this).find('.accfixSmall').attr('title', 'collapse');
            }
            else {
                $(this).find('.accfixSmall').attr("aria-label", "expand");
                $(this).find('.accfixSmall').attr('aria-expanded', 'false');
                $(this).find('.accfixSmall').attr('title', 'expand');
            }
        }
    });

    //add new row of manual FAQ input
    $(".addNewRow").click(function () {

        var parent = $(this).closest("#AccordionManualInputTable");
        parent.find('.FAQRow').last().after("<tr class='FAQRow'><td>Question:</td><td><textarea class='newQuestion'  ></textarea></td><td>Answer:</td><td><textarea class='newAnswer'></textarea></td><td class='remove'><i class='fa fa-ban fa-lg'></i></td></tr>");
        $(".remove").off();
        $(".remove").on("click", function () {
            if (parent.find('.FAQRow').length > 1)
                $(this).parent().remove();
        });

    });

    $(".remove").on("click", function () {
        if ($("#AccordionManualInputTable").find('.FAQRow').length > 1)
            $(this).parent().remove();
    });

    //save new FAQs to list
    $("#submitAndCreateFAQ").click(function () {
        $("#submitAndCreateFAQ").hide();
        var context = new SP.ClientContext.get_current();
        var SETList = context.get_web().get_lists().getByTitle("FAQSetsList");

        var guid = generateUUID();

        var SetName = $.trim($('#newSetName').val());
        var SetKeywords = $.trim($('#newSetKeywords').val())

        //create new set
        if (SetName.length > 0) {

            $().SPServices({
                operation: "UpdateListItems",
                async: false,
                batchCmd: "New",
                webURL: "/",
                listName: "FAQSetsList",
                valuepairs: [["Title", SetName], ["SetKeywords", SetKeywords], ["SetGUID", guid]],
                completefunc: function (xData, Status) {
                    if (Status != "success") {
                        $("#ErrorPoster").html("Failed to save new FAQ set, please try again.");
                        $("#submitAndCreateFAQ").show();
                        return;
                    }


                }
            });
        }
        else {
            $("#ErrorPoster").html("Please enter new QA set name!");
            $("#submitAndCreateFAQ").show();
            return;
        }

        //create new FAQ

        var order = 1;
        var FAQList = context.get_web().get_lists().getByTitle("FAQSetsQAsList");


        $.each($('.FAQRow'), function (index, row) {

            $row = $(row);

            var newQ = $.trim($row.find('.newQuestion').val());
            var newA = $.trim($row.find('.newAnswer').val());


            if (newQ.length > 0 && newA.length > 0) {

                $().SPServices({
                    operation: "UpdateListItems",
                    async: false,
                    batchCmd: "New",
                    webURL: "/",
                    listName: "FAQSetsQAsList",
                    valuepairs: [["Title", newQ], ["Answer", newA], ["QASetKey", guid], ["OrderNumber", order]],
                    completefunc: function (xData, Status) {
                        if (Status != "success") {

                            $("#ErrorPoster").html("Failed to save new FAQs, please try again.");
                            $("#submitAndCreateFAQ").show();
                            return;
                        }
                        else {
                            order++;

                        }

                    }
                });
            }
        })

        //if success

        alert("New QA set has been created and saved successfully, please tick the QA sets you would like to display in this Accordion webpart from the webpart propreties.");

        location.reload();

    });

    

    
});
//end of document ready

// ACCORDION END

//ACCORDION (ADHOC) START

$('document').ready(function () {



    //TEST TO ADD EXISTING QAs   ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    var parent = $(".adhocManualInputTables").closest("#AccordionManualInputTable");

    var SetName = $.trim(parent.find('.WebpartID').first().html());
    var setExist = false;
    var setGUID = "";
    if ($(".AccordionManualInputTable").length > 0) {

        $().SPServices({
            operation: "GetListItems",
            async: false,
            webURL: "/",
            listName: "AccordionAdhocSetsList",
            // CAMLViewFields: "<ViewFields><FieldRef Name='Title' /><FieldRef Name='SetGUID' /></ViewFields>",
            CAMLQuery: "<Query><Where><Eq><FieldRef Name='Title'/><Value Type='Text'>" + SetName + "</Value></Eq>" +
                            "</Where></Query>",
            completefunc: function (xData, Status) {

                if (Status == "success") {
                    if ($(xData.responseXML).SPFilterNode("z:row").length > 0) {
                        setExist = true;
                        setGUID = $(xData.responseXML).SPFilterNode("z:row").first().attr("ows_SetGUID");

                    }
                    else {
                        setExist = false;
                    }
                }

            }
        });
    }
    if (setExist) {
        $().SPServices({

            //valuepairs: [["Title", newQ], ["Answer", newA], ["QASetKey", guid], ["OrderNumber", order]],
            operation: "GetListItems",
            async: false,
            webURL: "/",
            listName: "AccordionAdhocSetsQAsList",
            // CAMLViewFields: "<ViewFields><FieldRef Name='Title' /><FieldRef Name='SetGUID' /></ViewFields>",
            CAMLQuery: "<Query><Where><Eq><FieldRef Name='QASetKey'/><Value Type='Text'>" + setGUID + "</Value></Eq>" +
                            "</Where><OrderBy><FieldRef Name='OrderNumber' Ascending='TRUE' /></OrderBy></Query>",
            completefunc: function (xData, Status) {

                if (Status == "success") {
                    if ($(xData.responseXML).SPFilterNode("z:row").length > 0) {
                        $(xData.responseXML).SPFilterNode("z:row").each(function () {
                            parent.find('.FAQRow').not('.Existing').first().before("<tr class='FAQRow Existing'><td><textarea class='newQuestion' placeholder='Question' >" + $(this).attr("ows_Title") + "</textarea><textarea class='newAnswer' placeholder='Answer' >" + $(this).attr("ows_Answer") + "</textarea></td><td class='remove'><i class='fa fa-ban fa-lg'></i></td></tr>");
                        });
                    }
                }

            }
        });
    }

    $(".remove").off();
    $(".remove").on("click", function () {
        if (parent.find('.FAQRow').length > 1)
            $(this).parent().remove();
    });
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////

    //toggle questions and answers
    $(".accordionQuestionAdhoc .accordionQAHeader").on('click keypress', function (e) {

        if (e.type == "touchstart" || e.type == "click" || e.which === 13 || e.which === 32) {

            $(this).next('.accordionAnswer').slideToggle();

            $(this).find('.accfix').toggleClass("fa-minus");

            if ($(this).find('.accfix').hasClass("fa-minus")) {
                $(this).find('.accfix').attr("aria-label", "collapse");
                $(this).find('.accfix').attr('aria-expanded', 'true');
                $(this).find('.accfix').attr('title', 'collapse');
            }
            else {
                $(this).find('.accfix').attr("aria-label", "expand");
                $(this).find('.accfix').attr('aria-expanded', 'false');
                $(this).find('.accfix').attr('title', 'expand');

            }

            $(this).find('.accfixBig').toggleClass("fa-minus");

            if ($(this).find('.accfixBig').hasClass("fa-minus")) {
                $(this).find('.accfixBig').attr("aria-label", "collapse");
                $(this).find('.accfixBig').attr('aria-expanded', 'true');
                $(this).find('.accfixBig').attr('title', 'collapse');
            }
            else {
                $(this).find('.accfixBig').attr("aria-label", "expand");
                $(this).find('.accfixBig').attr('aria-expanded', 'false');
                $(this).find('.accfixBig').attr('title', 'expand');

            }

            $(this).find('.accfixSmall').toggleClass("fa-minus");

            if ($(this).find('.accfixSmall').hasClass("fa-minus")) {
                $(this).find('.accfixSmall').attr("aria-label", "collapse");
                $(this).find('.accfixSmall').attr('aria-expanded', 'true');
                $(this).find('.accfixSmall').attr('title', 'collapse');
            }
            else {
                $(this).find('.accfixSmall').attr("aria-label", "expand");
                $(this).find('.accfixSmall').attr('aria-expanded', 'false');
                $(this).find('.accfixSmall').attr('title', 'expand');

            }
        }
    });


    //add new row of manual FAQ input
    $(".addNewAdhocRow").click(function () {

        var parent = $(this).closest("#AccordionManualInputTable");
        parent.find('.FAQRow').last().after("<tr class='FAQRow'><td><textarea class='newQuestion' placeholder='Question' ></textarea><textarea class='newAnswer' placeholder='Answer'  ></textarea></td><td class='remove'><i class='fa fa-ban fa-lg'></i></td></tr>");
        $(".remove").off();
        $(".remove").on("click", function () {
            if (parent.find('.FAQRow').length > 1)
                $(this).parent().remove();
        });

    });



    //save new FAQs to list
    $("#submitAndCreateAdhocQA").click(function () {

        $("#submitAndCreateAdhocQA").hide();
        var context = new SP.ClientContext.get_current();
        var SETList = context.get_web().get_lists().getByTitle("AccordionAdhocSetsList");

        var guid = generateUUID();

        //var SetName = $.trim($('#newSetName').val());
        var parent = $(this).closest("#AccordionManualInputTable");
        var SetName = $.trim(parent.find('.WebpartID').first().html());
        //var SetKeywords = $.trim($('#newSetKeywords').val())

        //create new set
        if (SetName.length > 0) {
            var setExist = false;

            $().SPServices({
                operation: "GetListItems",
                async: false,
                webURL: "/",
                listName: "AccordionAdhocSetsList",
                // CAMLViewFields: "<ViewFields><FieldRef Name='Title' /><FieldRef Name='SetGUID' /></ViewFields>",
                CAMLQuery: "<Query><Where><Eq><FieldRef Name='Title'/><Value Type='Text'>" + SetName + "</Value></Eq>" +
                                "</Where></Query>",
                completefunc: function (xData, Status) {

                    if (Status == "success") {
                        if ($(xData.responseXML).SPFilterNode("z:row").length > 0) {

                            //$(xData.responseXML).SPFilterNode("z:row").each(function () {
                            setExist = true;
                            guid = $(xData.responseXML).SPFilterNode("z:row").first().attr("ows_SetGUID"); //($(this).attr("ows_SetGUID"));
                            // });

                        }
                        else {
                            setExist = false;
                        }
                    }

                }
            });

            //IF SET EXIST, SKIP


            //IF NEED TO CREATE A NEW SET
            if (!setExist) {
                $().SPServices({
                    operation: "UpdateListItems",
                    async: false,
                    batchCmd: "New",
                    webURL: "/",
                    listName: "AccordionAdhocSetsList",
                    valuepairs: [["Title", SetName], ["SetGUID", guid]], //["SetKeywords", SetKeywords],
                    completefunc: function (xData, Status) {
                        if (Status != "success") {
                            $("#ErrorPoster").html("Failed to save new adhoc QA set, please try again.");
                            $("#submitAndCreateAdhocQA").show();
                            return;
                        }
                    }
                });
            }



        }
        else {
            $("#ErrorPoster").html("Please enter new QA set name!");
            $("#submitAndCreateAdhocQA").show();
            return;
        }

        //Now create new FAQs ************************************************************************************


        //remove all existing FAQs
        if (setExist) {

            $().SPServices({

                operation: "GetListItems",
                async: false,
                webURL: "/",
                listName: "AccordionAdhocSetsQAsList",
                CAMLQuery: "<Query><Where><Eq><FieldRef Name='QASetKey'/><Value Type='Text'>" + guid + "</Value></Eq>" +
                                "</Where><OrderBy><FieldRef Name='OrderNumber' Ascending='TRUE' /></OrderBy></Query>",
                completefunc: function (xData, Status) {

                    if (Status == "success") {
                        if ($(xData.responseXML).SPFilterNode("z:row").length > 0) {
                            $(xData.responseXML).SPFilterNode("z:row").each(function () {
                                // $(this).attr("ows_Title") 
                                var id = $(this).attr("ows_ID");
                                //
                                $().SPServices({
                                    operation: "UpdateListItems",
                                    async: false,
                                    batchCmd: "Delete",
                                    webURL: "/",
                                    ID: id,
                                    listName: "AccordionAdhocSetsQAsList",
                                    completefunc: function (xData, Status) {
                                        if (Status == "success") {

                                        }
                                        else {

                                        }

                                    }
                                });
                                //

                            });
                        }
                    }

                }
            });





        }



        var order = 1;
        // var FAQList = context.get_web().get_lists().getByTitle("AccordionAdhocSetsQAsList");


        $.each($('.FAQRow'), function (index, row) {

            $row = $(row);

            var newQ = $.trim($row.find('.newQuestion').val());
            var newA = $.trim($row.find('.newAnswer').val());


            if (newQ.length > 0 && newA.length > 0) {

                $().SPServices({
                    operation: "UpdateListItems",
                    async: false,
                    batchCmd: "New",
                    webURL: "/",
                    listName: "AccordionAdhocSetsQAsList",
                    valuepairs: [["Title", newQ], ["Answer", newA], ["QASetKey", guid], ["OrderNumber", order]],
                    completefunc: function (xData, Status) {
                        if (Status != "success") {

                            $("#ErrorPoster").html("Failed to save new adhoc QAs, please try again.");
                            $("#submitAndCreateAdhocQA").show();
                            return;
                        }
                        else {
                            order++;

                        }

                    }
                });


                //
                //var itemCreateInfo = new SP.ListItemCreationInformation();
                //var newItem = FAQList.addItem(itemCreateInfo);
                //newItem.set_item('Title', newQ);
                //newItem.set_item('Answer', newA);
                //newItem.set_item('QASetKey', guid);
                //newItem.set_item('OrderNumber', order);
                //newItem.update();
                //context.load(newItem);
                //context.executeQueryAsync(Function.createDelegate(this, this.onQuerySucceeded), Function.createDelegate(this, this.onQueryFailed));
                //function onQuerySucceeded() { alert('Item created: '); /*+ newItem.get_id()); order++;*/ };
                //function onQueryFailed(sender, args) { alert('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace()); }



            }

        })


        //if success

        //alert("New Adhoc QA set has been created and saved successfully, please tick the QA sets you would like to display in this Accordion webpart from the webpart propreties.");
        alert("Changes have been saved!");
        location.reload();

    });





});
//end of document ready


// ACCORDION (ADHOC) END


// LIGHTBOX START
$(document).ready(function () {
    try {
        $(".LightBoxWebpartContainer").parent().parent().parent().parent().addClass("LightBoxWebpartZoneWrap");
        $(".LightBoxWebpartZoneWrap .ms-WPBody").css("overflow", "hidden"); //FIXING I DEVICES LIKE IPAD LIGHT BOX PROBLEM
    } catch (err) { }


    //william added this on September 29 for fixes
    /* $('document').ready(function () {
         try{
             $('.LightBoxWebpartContainer').closest('.ms-webpart-cell-vertical').css('display', 'block', 'important');
         }
         catch(err){}
     });*/


    //for accessibility
    $(".expandIcon").keypress(function (e) {
        if (e.keyCode == 13) {
            $(this).trigger("click");
        }
    });



    $('.expandIcon').click(function () {
        $(this).closest(".LightBoxWebpartContainer").find(".Modal").show();

        //dynamically sets the longer side of image as 100% length.
        // Get on screen image
        var screenImage = $(this).closest(".LightBoxWebpartContainer").find(".largeImage");
        // Create new offscreen image to test
        var theImage = new Image();
        theImage.src = screenImage.attr("src");
        
        // Get accurate measurements from that.
        var imageWidth = theImage.width == 0 ? 2000 : theImage.width;
        var imageHeight = theImage.height == 0 ? 2000 : theImage.height;
        
        var modalWidth = imageWidth + (0.80 * imageWidth);
        var modalHeight = imageHeight + (0.35 * imageHeight);

        /*
        var newimage = new Image();
        newimage.src = theImage.src;
        newimage.onload = function () {
            var width = this.naturalWidth;
            alert("onload func " + width);
        }
        */

        //alert("Screen width: " + $(window).width() + " Screen height: " + $(window).height());
        //alert("Modal Width: " + modalWidth + " Modal Height: " + modalHeight);

        //$(".LightBoxWebpartZoneWrap").find('.ModalWindow').css({
        //    width: modalWidth - 40 > $(window).width() ? $(window).width() - 40 : modalWidth,
        //    height: modalHeight - 80 > $(window).height() ? $(window).height() - 80 : modalHeight,
        //    'max-height': '100%'
        //});

        
        var widthperc = (imageWidth / modalWidth) * 100
        //screenImage.css('width', widthperc + '%');
        
        /*if (imageWidth > imageHeight)
            screenImage.css('width', '100%');
        else
            screenImage.css('height', '100%');
        */


        //var trimmedHref = $.trim($(this).closest(".LightBoxWebpartContainer").find("a").attr("href"));
        if ($('.download-link').length == 0) {
            $(this).closest(".LightBoxWebpartContainer").find(".downloadArea, .LightboxDownloadLinks").hide();
        }

      //  $('body').css("overflow", "hidden");




    });


    //for accessibility
    $(".closeIcon").keypress(function (e) {
        if (e.keyCode == 13) {
            $(this).trigger("click");
        }
        $('body').css("overflow", "visible");
    });

    $('.closeIcon').click(function () {
        $(this).closest(".LightBoxWebpartContainer").find(".Modal").hide();
        $('body').css("overflow", "visible");
    });

    $('.ModalGray').click(function () {
        $(this).parent().hide();
        $('body').css("overflow", "visible");
    });



    $(document).keyup(function (e) {

        if (e.keyCode == 27) {
            $(".Modal").hide();
        }   // escape key maps to keycode `27`
    });

    //$(".LightboxDownloadLinks").click(function () {
    //  $(this).find("a").trigger("click");
    //});



    // Accessibility to restrict the keyboard focus when image modal layer is presented
    $(".LightboxDownloadLinks .download-link:last-of-type").blur(function () {
        $(".ModalWindow .closeIcon").focus();
    });



});

// LIGHTBOX END

//EVENT FINDER START


function saveToHidden() {


    //var hiddenControlFrom = $("input[id$='HiddenField_DateFrom']").prop('id');
    //var hiddenControlTo = $("input[id$='HiddenField_DateTo']").prop('id');
    //var hiddenControlMode = $("input[id$='HiddenField_DisplayMode']").prop('id');


    //if (document.getElementById(hiddenControlMode).value == "daterange") {

    //    var selectedDates = $(".invisibleAnchor").mobiscroll('getVal', false);
    //    if (selectedDates.length == 2) {
    //        document.getElementById(hiddenControlFrom).value = selectedDates[0].getTime();
    //        document.getElementById(hiddenControlTo).value = selectedDates[1].getTime();

    //    }

    //}


    //if fromDate and toDate are null, take the single date selected

    // if (document.getElementById(hiddenControlMode).value == "sevendays" || document.getElementById(hiddenControlMode).value == "alltime") {

    //    var todayDate = new Date();
    //    var d = new Date(todayDate);

    //    d.setHours(0, 0, 0, 0);
    //    document.getElementById(hiddenControlFrom).value = d.getTime();

    //    if (document.getElementById(hiddenControlMode).value == "sevendays")
    //        d.setDate(todayDate.getDate() + 7); 
    //    else
    //        d.setDate(todayDate.getDate() + 999);
    //    //d.setHours(24, 0, 0, 0);
    //    d.setHours(0, 0, 0, 0);
    //    document.getElementById(hiddenControlTo).value = d.getTime();


    //}
    //else {

    //}


    return true;
}





$('document').ready(function () {


    /*$('.datepicker').datepicker({
        dateFormat: "M dd",
        minDate: new Date()
    });*/

    $('.datepickerEnd').datepicker({
        dateFormat: "M dd",
        minDate: new Date()
        // onSelect: function(dateText, inst){
        //    var startDate = new Date(dateText);
        //    alert(startDate);

        // }
    });

    $('.datepickerStart').datepicker({
        dateFormat: "M dd",
        minDate: new Date(),
        onSelect: function (dateText, inst) {
            var startDate = new Date(dateText);
            $('.datepickerEnd').datepicker("option", "minDate", dateText);
        }
    });



    var currentSelectedDateNumber = 0;
    var todayDate = new Date();
    // var thirtyDaysDate = new Date(todayDate);
    //   thirtyDaysDate.setDate(todayDate.getDate()+1)



    //$(".btn_Go").click(function(){
    //var d = $('#fromDate').datepicker('getDate');
    //alert(d);

    //});



    //SHOW 7 DAYS
    $("#sevenDays").click(function () {
        $(this).addClass("DaysSelected");
        $("#thirtyDays").removeClass("DaysSelected");
        currentSelectedDateNumber = 0;
        setDaysListHtml(0);
    });

    //SHOW 30 DAYS
    $("#thirtyDays").click(function () {
        $(this).addClass("DaysSelected");
        $("#sevenDays").removeClass("DaysSelected");
        //setDaysListHtml(currentSelectedDateNumber);
        setDaysListHtml(0);
    });


    if (!$("#sevenDays").hasClass("DaysSelected")) {
        $("#sevenDays").trigger("click");
    }

    //When a date is clicked, bind it to future elements.
    $("#daysList").on("click", "li", function (event) {
        currentSelectedDateNumber = Number($(this).attr("data-daysAfterToday"));
        if ($(this).hasClass("dateSelected"))
        { }
        else
        {
            $("#daysList li").removeClass("dateSelected");
            $(this).addClass("dateSelected");
        }


        //TODO: DO POST BACK AND REFRESH SEARCH RESULTS

        //clear dates in From and To
        $.datepicker._clearDate($('#toDate'));
        $.datepicker._clearDate($('#fromDate'));
        $(".btn_Go").trigger("click");
    });




    //When a arrow is clicked.
    $("#datesScroll #prev").click(function () {

        setDaysListHtml(Number($("#daysList li:nth-child(1)").attr("data-daysAfterToday")) - 7);

    });



    //When a arrow is clicked.
    $("#datesScroll #next").click(function () {

        setDaysListHtml(Number($("#daysList li:nth-child(1)").attr("data-daysAfterToday")) + 7);

    });



    function setDaysListHtml(firstDayNumberInList) {
        //$("#datesScroll #prev").removeClass("disabled").attr("disabled", "");
        // $("#datesScroll #next").removeClass("disabled").attr("disabled", "");
        $("#datesScroll #prev").removeClass("disabled").removeAttr("disabled");
        $("#datesScroll #next").removeClass("disabled").removeAttr("disabled");



        if ($("#thirtyDays").hasClass("DaysSelected")) //thirty days selected
        {
            // make arrows visible
            //$(".arrows").css("visibility", "");
            // $(".arrows").removeClass("disabled");
            //firstDayNumberInList = Number($("#daysList li:nth-child(1)").attr("data-daysAfterToday")) ;
        }
        else //7 days selected
        {
            //hide arrows
            //$(".arrows").css("visibility", "hidden");
            $(".arrows").addClass("disabled");

            firstDayNumberInList = 0;
        }



        if (firstDayNumberInList <= 0) {
            if (firstDayNumberInList <= 0)
                $("#datesScroll #prev").addClass("disabled").attr("disabled", "disabled");

            if (firstDayNumberInList < 0)
                return;
        }
        else if (firstDayNumberInList >= 28) {
            if (firstDayNumberInList >= 28)
                $("#datesScroll #next").addClass("disabled").attr("disabled", "disabled");

            if (firstDayNumberInList > 28)
                return;
        }








        //fill current date and sevendays to the "ul"
        var html = "";
        for (x = 0; x < 7; x++) {
            var d = new Date(todayDate);
            var y = Number(x) + Number(firstDayNumberInList);
            d.setDate(todayDate.getDate() + y);



            if ((currentSelectedDateNumber == null && firstDayNumberInList == 0 && x == 0) || (firstDayNumberInList + x == currentSelectedDateNumber)) {
                var k = Number(firstDayNumberInList) + Number(x);
                html += "<li data-daysAfterToday=\"" + k + "\" class=\"dateSelected\">" + d.getDate() + "</li>";
            }
            else {
                var k = Number(firstDayNumberInList) + Number(x); html += "<li data-daysAfterToday=\"" + k + "\">" + d.getDate(); + "</li>";
            }

        }


        $("#daysList").html(html);


        //change month numbers, according the first date number in the current list
        $("#month").html(getMonthValue(firstDayNumberInList));



    }




    function getMonthValue(daysSinceToday) {

        var d = new Date();
        d.setDate(todayDate.getDate() + Number(daysSinceToday))
        var month = new Array();
        month[0] = "JAN";
        month[1] = "FEB";
        month[2] = "MAR";
        month[3] = "APR";
        month[4] = "MAY";
        month[5] = "JUN";
        month[6] = "JUL";
        month[7] = "AUG";
        month[8] = "SEP";
        month[9] = "OCT";
        month[10] = "NOV";
        month[11] = "DEC";
        return month[d.getMonth()];
    }



    // $("#daysList li").first().trigger("click");


});


var prm = Sys.WebForms.PageRequestManager.getInstance();
prm.add_endRequest(EndRequest);
function EndRequest(sender, args) {
    $('[data-toggle="popover"]').popover();
}




//event finder new with mobiscroll
$(function () {

    function updateQueryStringParameter(uri, key, value) {
        //var uri = window.location.href;
        //alert(uri);

        var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
        var separator = uri.indexOf('?') !== -1 ? "&" : "?";
        if (uri.match(re)) {
            return uri.replace(re, '$1' + key + "=" + value + '$2');
            //window.location.replace(uri.replace(re, '$1' + key + "=" + value + '$2'));
        }
        else {
            return uri + separator + key + "=" + value;
            //window.location.replace(uri + separator + key + "=" + value);
        }
    }








    //initialize date picker
    $(".invisibleAnchor").mobiscroll().range({
        theme: 'auto',
        minDate: new Date(),
        dateFormat: 'dd/mm/yy',
        onSelect: dateSelected
    });

    //show date picker
    $('.eventfinderSelector_mobiDatepickerTrigger').click(function () {
        $(".invisibleAnchor").mobiscroll('show');
        $(".dw-dr-c div[role=radio]").attr('tabindex', '0');
        return false;
    });





    //var hiddenControlMode = $("input[id$='HiddenField_DisplayMode']").prop('id');
    //var hiddenDatesString = $("input[id$='HiddenField_DatesString']").prop('id');






    //show seven days
    $('.eventfinderSelector_seven').click(function () {
        //document.getElementById(hiddenControlMode).value = "sevendays";
        var withMode = updateQueryStringParameter(window.location.href, "mode", "sevendays");
        $(".daysDropdownBtn").html('next 7 days <span class="fa fa-chevron-down"></span>');

        var todayDate = new Date();
        var d = new Date(todayDate);

        d.setHours(0, 0, 0, 0);
        //document.getElementById(hiddenControlFrom).value = d.getTime();
        var withFromdate = updateQueryStringParameter(withMode, "from", d.getTime());
        d.setDate(todayDate.getDate() + 7);
        //d.setHours(24, 0, 0, 0);
        d.setHours(0, 0, 0, 0);
        //document.getElementById(hiddenControlTo).value = d.getTime();
        var withTodate = updateQueryStringParameter(withFromdate, "to", d.getTime());
        window.location.replace(updateQueryStringParameter(withTodate, "p", "1"));
        //$(".btn_Go").trigger("click");
    });


    //show all future events
    $('.eventfinderSelector_all').click(function () {
        //document.getElementById(hiddenControlMode).value = "alltime";
        var withMode = updateQueryStringParameter(window.location.href, "mode", "alltime");
        $(".daysDropdownBtn").html('all time <span class="fa fa-chevron-down"></span>');
        window.location.replace(withMode);
    });


    //Show date range after selection 
    function dateSelected(valuetext, inst) {
        //document.getElementById(hiddenControlMode).value = "daterange";
        var withMode = updateQueryStringParameter(window.location.href, "mode", "daterange");
        $(".daysDropdownBtn").html(valuetext + ' <span class="fa fa-chevron-down"></span>');
        //document.getElementById(hiddenDatesString).value = valuetext;
        var withDatesText = updateQueryStringParameter(withMode, "datesString", valuetext);

        var selectedDates = $(".invisibleAnchor").mobiscroll('getVal', false);

        if (selectedDates.length == 2) {
            //ocument.getElementById(hiddenControlFrom).value = selectedDates[0].getTime();
            // document.getElementById(hiddenControlTo).value = selectedDates[1].getTime();
            var withFromdate = updateQueryStringParameter(withDatesText, "from", selectedDates[0].getTime());

            var withTodate = updateQueryStringParameter(withFromdate, "to", selectedDates[1].getTime());
            window.location.replace(updateQueryStringParameter(withTodate, "p", "1"));

        }


        //if (selectedDates.length == 2) 
        //$(".btn_Go").trigger("click");



    }

    //var hiddenControlCategory = $("input[id$='HiddenField_Category']").prop('id');



    //category is clicked
    $('.categorySelector').click(function () {
        if ($(this).html() == "All") {
            $('.categoryDropdownBtn').html('all <span class="fa fa-chevron-down"></span>');
            //document.getElementById(hiddenControlCategory).value = "all";
            //$(".btn_Go").trigger("click");
            var withCategory = updateQueryStringParameter(window.location.href, "category", "all");
            window.location.replace(updateQueryStringParameter(withCategory, "p", "1"));
        }
        else {
            $('.categoryDropdownBtn').html($(this).html() + ' <span class="fa fa-chevron-down"></span>');
            //document.getElementById(hiddenControlCategory).value = $(this).html();
            //$(".btn_Go").trigger("click");
            var withCategory = updateQueryStringParameter(window.location.href, "category", $(this).html());
            window.location.replace(updateQueryStringParameter(withCategory, "p", "1"));
        }



    });


    $('.eventAddInfoSelector').click(function () {
        if ($(this).html() == "All") {
            $('.eventAddInfoDropdownBtn').html('all <span class="fa fa-chevron-down"></span>');
            //document.getElementById(hiddenControlCategory).value = "all";
            //$(".btn_Go").trigger("click");
            var withCategory = updateQueryStringParameter(window.location.href, "eventaddinfo", "all");
            window.location.replace(updateQueryStringParameter(withCategory, "p", "1"));
        }
        else {
            $('.eventAddInfoDropdownBtn').html($(this).html() + ' <span class="fa fa-chevron-down"></span>');
            //document.getElementById(hiddenControlCategory).value = $(this).html();
            //$(".btn_Go").trigger("click");
            var withCategory = updateQueryStringParameter(window.location.href, "eventaddinfo", $(this).html());
            window.location.replace(updateQueryStringParameter(withCategory, "p", "1"));
        }



    });



});



//event finder new with mobiscroll ends here




//EVENT FINDER END

//EVENT PAGE POPOVER
$('document').ready(function () {
    $('[data-toggle="popover"]').popover();
});


//EVENT SUMMARY 
$('document').ready(function () {
    $('.EventSumContainer').closest('.ms-webpart-cell-vertical').css('display', 'block', 'important');
});





//Event detail map relocation and remove bottom border of last 'detail' class 
$('document').ready(function () {

    //$('#EventDetails #Map').appendTo('')
    try {
        //$('#EventDetails .event-details .gettingthere').before($('#EventDetails #Map'));
        $('#EventDetails .event-details .gettingthere').before($('#EventDetails #MapZone'));
    }
    catch (e) { }

    $('#EventDetails .event-details .detail').last().addClass('lastDetail');
});



//Image Gallery V2
$('document').ready(function () {

    if ($('.galleria').length > 0 || $('.carousel').length > 0) {
        $.getScript('/system/js/Galleria/galleria-1.4.2.min.js', function (data, textStatus, jqxhr) {
            if (textStatus = "success") {

                if (Galleria) {
                    Galleria.loadTheme('/system/js/Galleria/themes/AzurTheme/galleria.azur.min.js');

                    //IMAGE GALLERY
                    if ($('.galleria').length > 0) {

                        if (Galleria) {
                            galleriaReady_galleria();
                            $('.galleria').each(function () {
                                var ratioNumber = $(this).siblings(".GalleriaRatio").val();//$(this).closest('.GalleriaRatio').val();

                                startImageGallery2Code(ratioNumber, $(this));
                            });
                        }

                        $(window).resize(function () {
                            setTimeout(function () {
                                if ($(".galleria-theme-azur.fullscreen").length == 0) {
                                    $('.galleria').each(function () {
                                        $(this).data('galleria').resize();
                                    });
                                }
                            }, 1000);
                        });
                    }

                    //IMAGE CAROUSEL
                    if ($('.carousel').length > 0) {

                        $('.carousel').show();
                        setupVisibleCarousels($('.carousel:visible'));

                        galleriaReady_carousel();

                        $(window).resize(function () {
                            //Resize start
                            clearTimeout(window.resizedCarouselFinished);
                            //call function when window resize complete
                            window.resizedCarouselFinished = setTimeout(function () {
                                var carouselWinNewWidth = $(window).width(), carouselWinNewHeight = $(window).height();
                                if (carouselWinWidth != carouselWinNewWidth || carouselWinHeight != carouselWinNewHeight && isTouchDevice() == false) {
                                    resizeCarousel($('.carousel:visible'));
                                }

                                //Update the width and height
                                carouselWinWidth = carouselWinNewWidth;
                                carouselWinHeight = carouselWinNewHeight;

                            }, 250);

                            // Resize end
                        });
                    }
                }
            }
        });

    }
    function resizeCarousel() {
        // 
        if ($(".galleria-theme-azur.fullscreen").length == 0) {
            // $('.carousel').each(function () {
            setupVisibleCarousels($('.carousel:visible'));
            try {
                $('.carousel:visible').data('galleria').resize();
            }
            catch (err) {
            }
            //});
        }
    }


    function setupVisibleCarousels(_obj) {
        if (_obj.length > 0) {
            if (_obj === undefined) {
                $('.carousel').each(function () {
                    // Only run the carousel plugin for this carousel if it is (1) visible, and (2) not already running.
                    // if ($(this).is(':visible') && $(this).children('.galleria-container').length == 0) {
                    if ($(this).is(':visible')) {
                        var ratioNumber = $(this).siblings(".GalleriaRatio").val();
                        startImageCarousel2Code(ratioNumber, $(this));
                    }
                });
            } else {
                var ratioNumber = _obj.siblings(".GalleriaRatio").val();
                startImageCarousel2Code(ratioNumber, _obj);
            }
        }
    }

    function startImageGallery2Code(ratioNumber, target) {

        //Galleria.loadTheme('/system/js/Galleria/themes/AzurTheme/galleria.azur.min.js');
        Galleria.run(target, { responsive: true, height: ratioNumber, debug: false, lightbox: true, fullscreenCrop: false, imageCrop: true, trueFullscreen: false, idleMode: false, showCounter: false }); //for ratio 16:9  enter 0.5625

        Galleria.configure({
            dataConfig: function (img) {
                var desc = $(img).data('description') ? $(img).data('description') : ''
                return {
                    description: desc
                }
            }
        })

    }
    var id = 0;

    function generateId() { return id++; };

    function isInArray(value, array) {
        return array.indexOf(value) > -1;
    }



    function startImageCarousel2Code(ratioNumber, target) {
        obj_id = target.attr('id');
        if (obj_id === undefined) {
            obj_id = 'obj_id_' + generateId();
            target.attr('id', obj_id)
        }
        if (window.carousel_obj_ids === undefined) {
            window.carousel_obj_ids = [];
        }
        //if called before - destroy
        if (isInArray(obj_id, window.carousel_obj_ids)) {
            $(obj_id).data('galleria').destroy();
        }

        Galleria.run(target, { transitionSpeed: 20, transition: 'fade', responsive: true, height: ratioNumber, debug: false, lightbox: false, imageCrop: true, idleMode: false, autoplay: true, wait: true, swipe: false }); //for ratio 16:9  enter 0.5625
    }
    function galleriaReady_carousel() {
        Galleria.ready(function () {
            var galleriaContainer = this.$('container');

            if (galleriaContainer.children('.galleria-image-nav-manualStartStop').length == 0) {
                galleriaContainer.find(".galleria-stage").prepend("<div tabindex='0' aria-label='Pause' class='galleria-image-nav-manualStartStop pause' role='button' aria-label='Play pause button' ></div>");
            }
            var galleriaStartStop = galleriaContainer.find(".galleria-image-nav-manualStartStop");
            galleriaStartStop.off("click");
            galleriaStartStop.on("click", function () {

                if ($(this).attr('aria-label') == "Play") {
                    $(this).closest('.carousel').data('galleria').play();
                    $(this).attr('aria-label', 'Pause').removeClass('play').addClass('pause');
                    return false;
                }
                else {
                    $(this).closest('.carousel').data('galleria').pause();
                    $(this).attr('aria-label', 'Play').removeClass('pause').addClass('play');
                    return false;
                }

            });
            galleriaStartStop.off("keypress");
            galleriaStartStop.keypress(function (e) {
                if (e.keyCode == 13) {
                    $(this).trigger("click");
                    return false;
                }
            });
            galleriaContainer.find(".galleria-image-nav-right").off("keypress");
            galleriaContainer.find(".galleria-image-nav-right").attr('tabindex', '0').attr('aria-label', 'next slide').keypress(function (e) {
                if (e.keyCode == 13) {
                    $(this).trigger("click");
                    return false;
                }
            });
            galleriaContainer.find(".galleria-image-nav-left").off("keypress");
            galleriaContainer.find(".galleria-image-nav-left").attr('tabindex', '0').attr('aria-label', 'last slide').keypress(function (e) {
                if (e.keyCode == 13) {
                    $(this).trigger("click");
                    return false;
                }
            });

            carouselData = this._data;

            galleriaContainer.bind(Galleria.IMAGE, function (e) {
                $('.image-carousel-mobile-info-text').html(galleriaContainer.find(".galleria-info-title").html());
                $('.image-carousel-mobile-info-text').attr('class', 'image-carousel-mobile-info-text');
                $('.image-carousel-mobile-info-text').show();
                // fix the image alt tag issue
                $($('div .galleria-image').children('img')[0]).attr('alt', '');

                imagesLoaded = imagesLoaded + 1; // increments images loaded
            });

            $.each(carouselData, function (indxTest, objTest) {
                testImagesLoaded(objTest.big);
            });

            if (imagesLoaded == 0) // none loaded 
            {
                MakeCarouselAccessibleIfImagesTurnedOff();
            }

        });
    }

    function galleriaReady_galleria() {
        Galleria.ready(function () {
            //swap postions of images and bar
            $(".galleria-bar").css("top", "0px", "important");
            $(".galleria-bar").css("bottom", "");

            $('.galleria-stage').css('bottom', '0px');
            $(".galleria-stage").css("top", '40px');

            $(".galleria-bar").insertBefore($('.galleria-stage'));

            //setup alt text
            this.bind('image', function (e) {
                e.imageTarget.alt = e.galleriaData.original.alt;
            });

            //replace full screen icon
            var target = $(".galleria-theme-azur .galleria-fullscreen");
            target.html("<i  class='fa fa-arrows-alt'></i>");

            //new code for accessibility
            $(".galleria .galleria-fullscreen").off("keypress");
            $(".galleria .galleria-fullscreen").attr('tabindex', '0').attr('aria-label', 'toggle full screen').keypress(function (e) {
                if (e.keyCode == 13) {
                    $(this).trigger("click");
                }
            });
            $(".galleria .galleria-play").off("keypress");
            $(".galleria .galleria-play").attr('tabindex', '0').attr('aria-label', 'start or pause slide show').keypress(function (e) {
                if (e.keyCode == 13) {
                    $(this).trigger("click");
                }
            });
            $(".galleria .galleria-thumbnails .galleria-image").off("keypress");
            $(".galleria .galleria-thumbnails .galleria-image").attr('tabindex', '0').attr('aria-label', 'image thumbnail').keypress(function (e) {
                if (e.keyCode == 13) {
                    $(this).trigger("click");
                }
            });
            $(".galleria  .galleria-image-nav .galleria-image-nav-right").off("keypress");
            $(".galleria  .galleria-image-nav .galleria-image-nav-right").attr('tabindex', '0').attr('aria-label', 'next image').keypress(function (e) {
                if (e.keyCode == 13) {
                    $(this).trigger("click");
                }
            });
            $(".galleria  .galleria-image-nav .galleria-image-nav-left").off("keypress");
            $(".galleria  .galleria-image-nav .galleria-image-nav-left").attr('tabindex', '0').attr('aria-label', 'previous image').keypress(function (e) {
                if (e.keyCode == 13) {
                    $(this).trigger("click");
                }
            });

            carouselData = this._data;
            $.each(carouselData, function (indxTest, objTest) {
                testImagesLoaded(objTest.big);
            });

            if (imagesLoaded == 0) // none loaded 
            {
                MakeImageGalleryAccessibleIfImagesTurnedOff();
            }

        });


    }

    function testImagesLoaded(URL) {
        var tester = new Image();
        tester.onload = imageFound;
        tester.onerror = imageNotFound;
        tester.src = URL;
    }

    function imageFound() {
        //console.log('Images are enabled.');
        imagesLoaded = imagesLoaded + 1;
    }

    function imageNotFound() {
        imagesLoaded = imagesLoaded - 1;
        //console.log('Images are disabled.');
        // MakeCarouselAccessibleIfImagesTurnedOff();        
    }
});


//Image gallery Old

//$('document').ready(function () {

//    $.getScript('/system/js/imagegallery/jquery.tmpl.min.js', function (data, textStatus, jqxhr) {
//        console.log(textStatus); // Success
//        console.log(jqxhr.status); // 200
//        console.log("Load was performed.");
//    });
//    $.getScript('/system/js/imagegallery/jquery.easing.1.3.js', function (data, textStatus, jqxhr) {
//        console.log(textStatus); // Success
//        console.log(jqxhr.status); // 200
//        console.log("Load was performed.");
//    });
//    $.getScript('/system/js/imagegallery/jquery.elastislide.js', function (data, textStatus, jqxhr) {
//        console.log(textStatus); // Success
//        console.log(jqxhr.status); // 200
//        console.log("Load was performed.");
//    });
//    $.getScript('/system/js/imagegallery/gallery.js', function (data, textStatus, jqxhr) {
//        console.log(textStatus); // Success
//        console.log(jqxhr.status); // 200
//        console.log("Load was performed.");
//    });

//});

////IMAGE GALLERY MANAGER
$('document').ready(function () {


    if ($(".GalleryManualInputTables").length > 0) {

        //(0) print existing Images configurations
        //TEST TO ADD EXISTING QAs   ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        var parent = $(".GalleryManualInputTables").closest("#ImageGalleryManualInputTable");
        var WPID = $.trim(parent.find('.WebpartID').first().html());

        $().SPServices({

            operation: "GetListItems",
            async: false,
            webURL: "/",
            listName: "ImageGalleryData",
            // CAMLViewFields: "<ViewFields><FieldRef Name='Title' /><FieldRef Name='SetGUID' /></ViewFields>",
            CAMLQuery: "<Query><Where><Eq><FieldRef Name='ImageGalleryWebpartID'/><Value Type='Text'>" + WPID + "</Value></Eq>" +
                            "</Where><OrderBy><FieldRef Name='OrderNumber' Ascending='TRUE' /></OrderBy></Query>",
            completefunc: function (xData, Status) {

                if (Status == "success") {
                    if ($(xData.responseXML).SPFilterNode("z:row").length > 0) {
                        $(xData.responseXML).SPFilterNode("z:row").each(function () {

                            var captionvalue = $(this).attr("ows_ImageCaption") === undefined ? "" : $(this).attr("ows_ImageCaption");
                            var descvalue = $(this).attr("ows_ImageDescription") === undefined ? "" : $(this).attr("ows_ImageDescription");
                            var alttext = $(this).attr("ows_ImageAltText") === undefined ? "" : $(this).attr("ows_ImageAltText");

                            parent.find('.ImageRow').not('.Existing').first().before("<tr class='ImageRow Existing'><td><input class='newImageID' placeholder='Image ID' value=" + $(this).attr("ows_ImageID") + " /><textarea class='newCaption' placeholder='Title / Caption' >" + captionvalue + "</textarea><textarea class='newDesc' placeholder='Description' >" + descvalue + "</textarea><textarea class='newAltText' placeholder='Alt Text' >" + alttext + "</textarea></td><td class='remove'><i class='fa fa-ban fa-lg'></i></td></tr>");

                        });
                    }
                }

            }
        });


        // $(".ImageRow .remove").off();
        parent.find(".ImageRow .remove").off();
        parent.find(".ImageRow .remove").on("click", function () {
            if (parent.find('.ImageRow').length > 1)
                $(this).parent().remove();
        });




        //(1)  add new row of manual Image info input
        parent.find(".addNewImageRow").click(function () {

            var parent = $(this).closest("#ImageGalleryManualInputTable");
            parent.find('.ImageRow').last().after("<tr class='ImageRow'><td><input class='newImageID' placeholder='Image ID' /><textarea class='newCaption' placeholder='Title / Caption' ></textarea><textarea class='newDesc' placeholder='Description' ></textarea><textarea class='newAltText' placeholder='Alt Text' ></textarea></td><td class='remove'><i class='fa fa-ban fa-lg'></i></td></tr>");
            parent.find(".ImageRow .remove").off();
            parent.find(".ImageRow .remove").on("click", function () {
                if (parent.find('.ImageRow').length > 1)
                    $(this).parent().remove();
            });

        });




        //(2)    //save new image configurations to list
        parent.find("#submitAndSaveImagesInfo").click(function () {

            //parent.find("#submitAndSaveImagesInfo").hide();
            $(this).hide();
            var context = new SP.ClientContext.get_current();

            var parent = $(this).closest("#ImageGalleryManualInputTable");
            var WPID = $.trim(parent.find('.WebpartID').first().html());

            //validation of all data
            var ImageCaptionLength = 100;
            var ImageDescLength = 300;
            var ImageAltTextLength = 255;

            parent.find(".validatorError").remove();  ////////////////////////  REMOVE IS CORRECT ? 
            var IsValid = true;

            $.each(parent.find('.ImageRow'), function (index, row) {
                $row = $(row);
                var newID = $.trim($row.find('.newImageID').val());
                var newCap = $.trim($row.find('.newCaption').val());
                var newDesc = $.trim($row.find('.newDesc').val());
                var newAltText = $.trim($row.find('.newAltText').val());

                if (newID.length == 0 && newID.trim().length == 0)   //No need to worry about the empty rows
                {

                }
                else {
                    var reg = new RegExp('^\\d+$');

                    if (!reg.test(newID)) {
                        IsValid = false;
                        $row.find('.newImageID').after("<div class='validatorError' style='color:red'>Please type correct ID of image</div>");
                    }
                    else {

                        if (newCap.length >= ImageCaptionLength) {
                            IsValid = false;
                            $row.find('.newCaption').after("<div class='validatorError' style='color:red'>No more than " + ImageCaptionLength + " characters please.</div>");
                        }

                        if (newDesc.length >= ImageDescLength) {
                            IsValid = false;
                            $row.find('.newDesc').after("<div class='validatorError' style='color:red'>No more than " + ImageDescLength + " characters please.</div>");

                        }
                        if (newAltText.length == 0)
                        {
                            IsValid = false;
                            $row.find('.newAltText').after("<div class='validatorError' style='color:red'>Image alternate text is required</div>");
                        }

                        if (newAltText.length >= ImageAltTextLength) {
                            IsValid = false;
                            $row.find('.newAltText').after("<div class='validatorError' style='color:red'>No more than " + ImageAltTextLength + " characters please.</div>");

                        }
                    }


                }

            })

            if (!IsValid) {
                parent.find("#submitAndSaveImagesInfo").show();
                return;
            }





            //remove all existing records

            $().SPServices({

                operation: "GetListItems",
                async: false,
                webURL: "/",
                listName: "ImageGalleryData",
                CAMLQuery: "<Query><Where><Eq><FieldRef Name='ImageGalleryWebpartID'/><Value Type='Text'>" + WPID + "</Value></Eq>" +
                                "</Where><OrderBy><FieldRef Name='OrderNumber' Ascending='TRUE' /></OrderBy></Query>",
                completefunc: function (xData, Status) {

                    if (Status == "success") {
                        if ($(xData.responseXML).SPFilterNode("z:row").length > 0) {
                            $(xData.responseXML).SPFilterNode("z:row").each(function () {
                                var id = $(this).attr("ows_ID");
                                $().SPServices({
                                    operation: "UpdateListItems",
                                    async: false,
                                    batchCmd: "Delete",
                                    webURL: "/",
                                    ID: id,
                                    listName: "ImageGalleryData",
                                    completefunc: function (xData, Status) {
                                        if (Status == "success") { }
                                        else { }

                                    }
                                });

                            });
                        }
                    }

                }
            });




            var order = 1;



            //SAVE BOTH EXISTING AND NEW ROWS TO SP LIST
            $.each(parent.find('.ImageRow'), function (index, row) {

                $row = $(row);

                var newID = $.trim($row.find('.newImageID').val());
                var newCap = $.trim($row.find('.newCaption').val());
                var newDesc = $.trim($row.find('.newDesc').val());
                var newAltText = $.trim($row.find('.newAltText').val());


                if (newID.length > 0 && newID.trim().length > 0) {

                    $().SPServices({
                        operation: "UpdateListItems",
                        async: false,
                        batchCmd: "New",
                        webURL: "/",
                        listName: "ImageGalleryData",
                        valuepairs: [["ImageGalleryWebpartID", WPID], ["ImageID", newID], ["ImageAltText", newAltText], ["ImageCaption", newCap], ["ImageDescription", newDesc], ["OrderNumber", order]],
                        completefunc: function (xData, Status) {
                            if (Status != "success") {

                                parent.closest("#ErrorPoster").html("Failed to save changes, please try again.");
                                parent.find("#submitAndSaveImagesInfo").show();
                                return;
                            }
                            else {
                                order++;

                            }

                        }
                    });


                }

            })


            //if success

            //alert("New Adhoc QA set has been created and saved successfully, please tick the QA sets you would like to display in this Accordion webpart from the webpart propreties.");
            alert("Changes have been saved!");
            location.reload();

        });

    }


});
//IMAGE GALLERY NEW   ENDS HERE


////IMAGE CAROUSEL MANAGER
$('document').ready(function () {

    if ($(".CarouselManualInputTables").length > 0) {

        function getOptionsHtml(mode, DateObj) {

            var resultHTML = "";

            if (DateObj == "") {
                if (mode == "hour") //HOUR
                {
                    for (i = 0; i < 24; i++) resultHTML += "<option>" + i + "</option>";
                }
                else //MINUTES
                {
                    for (i = 0; i < 60; i++) resultHTML += "<option>" + i + "</option>";
                }

            }
            else {
                if (mode == "hour") //HOUR
                {
                    //  alert(DateObj.getHours());
                    // alert(DateObj.getMinutes());
                    for (i = 0; i < 24; i++) {
                        if (i == DateObj.getHours())
                            resultHTML += "<option selected='selected' >" + i + "</option>";
                        else
                            resultHTML += "<option>" + i + "</option>";

                    }
                }
                else //MINUTES
                {
                    for (i = 0; i < 60; i++) {
                        if (i == DateObj.getMinutes())
                            resultHTML += "<option selected='selected' >" + i + "</option>";
                        else
                            resultHTML += "<option>" + i + "</option>";

                    }
                }

            }

            //var newStartDate = convertSPDateToJSDate($row.find('.newStartDate').val());
            //  newStartDate = newStartDate.setMonth(newStartDate.getMonth() - 1);

            return resultHTML;

        }





        function setDatePicker() {

            $('.ImageRow .newEndDate').datepicker({
                // dateFormat: "M dd",
                minDate: new Date()
            });

            $('.ImageRow .newStartDate').datepicker({
                // dateFormat: "M dd",
                minDate: new Date(),
                onSelect: function (dateText, inst) {
                    var startDate = new Date(dateText);
                    $('.newEndDate').datepicker("option", "minDate", dateText);
                }
            });

        }


        var parent = $(".CarouselManualInputTables:last").closest("#ImageCarouselManualInputTable");

        var WPID = $.trim(parent.find('.WebpartID').first().html());


        $().SPServices({

            operation: "GetListItems",
            async: false,
            webURL: "/",
            listName: "ImageCarouselData",
            // CAMLViewFields: "<ViewFields><FieldRef Name='Title' /><FieldRef Name='SetGUID' /></ViewFields>",
            CAMLQuery: "<Query><Where><Eq><FieldRef Name='ImageCarouselWebpartID'/><Value Type='Text'>" + WPID + "</Value></Eq>" +
                            "</Where><OrderBy><FieldRef Name='ImageOrderNumber' Ascending='TRUE' /></OrderBy></Query>",
            completefunc: function (xData, Status) {

                if (Status == "success") {
                    if ($(xData.responseXML).SPFilterNode("z:row").length > 0) {
                        $(xData.responseXML).SPFilterNode("z:row").each(function () {

                            var captionvalue = $(this).attr("ows_ImageCaption") === undefined ? "" : $(this).attr("ows_ImageCaption");
                            //var descvalue = $(this).attr("ows_ImageDescription") === undefined ? "" : $(this).attr("ows_ImageDescription");
                            var alttext = $(this).attr("ows_ImageAltText") === undefined ? "" : $(this).attr("ows_ImageAltText");
                            var titletext = $(this).attr("ows_Title") === undefined ? "" : $(this).attr("ows_Title");
                            var pagehyperlink = $(this).attr("ows_PageHyperlink") === undefined ? "" : $(this).attr("ows_PageHyperlink");
                            var orderNumber = $(this).attr("ows_ImageOrderNumber") === undefined ? "" : parseInt($(this).attr("ows_ImageOrderNumber"));



                            //parent.find('.ImageRow').not('.Existing').first().before("<tr class='ImageRow Existing'><td><input class='newImageID' placeholder='Image ID *' value='" + $(this).attr("ows_ImageID") + "' /><input class='newImageOrder' placeholder='Sequence number in carousel' value='" + orderNumber + "' /><input class='newImageTitle' placeholder='Image Tittle *' value='" + titletext + "' /><input class='newPageHyperlink' placeholder='Hyperlink to destination papge *' value='" + pagehyperlink + "' /><textarea class='newCaption' placeholder='Feature description' >" + captionvalue + "</textarea><textarea class='newAltText' placeholder='Alt Text *' >" + alttext + "</textarea><input class='newStartDate' placeholder='Start Date *' value='" + $(this).attr("ows_ImageStartDate") + "'/><input class='newEndDate' placeholder='End Date *'  value='" + $(this).attr("ows_ImageEndDate") + "' /></td><td class='remove'><i class='fa fa-ban fa-lg'></i></td></tr>");
                            parent.find('.ImageRow').not('.Existing').first().before("<tr class='ImageRow Existing'><td class='well'><div class='col-md-4'></div><div class='col-md-4'><input type='number' min='1' class='newImageID form-control' placeholder='Image ID *' value='" + $(this).attr("ows_ImageID") + "' /></div><div class='col-md-4'><input type='number' min='1' class='newImageOrder col-md-6 form-control' placeholder='Sequence number in carousel' value='" + orderNumber + "' /></div><input class='newImageTitle col-md-12  form-control' placeholder='Image Tittle *' value='" + titletext + "' /><input class='newPageHyperlink col-md-12  form-control' placeholder='Hyperlink to destination page *' value='" + pagehyperlink + "' /><textarea class='newCaption  col-md-12 form-control' placeholder='Feature description' >" + captionvalue + "</textarea><div class='col-md-6'><input class='newStartDate form-control' placeholder='Start Date *' value='" + $(this).attr("ows_ImageStartDate") + "'/></div><div class='col-md-3'><select class='StartDateHourSelect form-control'></select></div><div class='col-md-3'><select class='StartDateMinuteSelect form-control'></select></div><div class='col-md-6'><input class='newEndDate  form-control' placeholder='End Date *'  value='" + $(this).attr("ows_ImageEndDate") + "' /></div><div class='col-md-3'><select class='EndDateHourSelect form-control'></select></div><div class='col-md-3'><select class='EndDateMinuteSelect form-control'></select></div></td><td class='remove'><i class='fa fa-ban fa-lg'></i></td></tr>");

                        });
                    }
                }

            }
        });


        setDatePicker();

        function convertSPDateToJSDate(d) {
            // split apart the date and time
            var xDate = d.split(" ")[0];
            var xTime = d.split(" ")[1];

            // split apart the hour, minute, & second
            var xTimeParts = xTime.split(":");
            var xHour = xTimeParts[0];
            var xMin = xTimeParts[1];
            var xSec = xTimeParts[2];

            // split apart the year, month, & day
            var xDateParts = xDate.split("-");
            var xYear = xDateParts[0];
            var xMonth = xDateParts[1];
            var xDay = xDateParts[2];

            var dDate = new Date(xYear, xMonth, xDay, xHour, xMin, xSec);
            return dDate;
        }

        //set date picker selected date
        $.each(parent.find('.ImageRow'), function (index, row) {

            $row = $(row);

            //var newHyperlink = $.trim($row.find('.newPageHyperlink').val());     
            try {
                var newStartDate = convertSPDateToJSDate($row.find('.newStartDate').val());
                var newEndDate = convertSPDateToJSDate($row.find('.newEndDate').val());


                $row.find('.StartDateHourSelect').html(getOptionsHtml("hour", newStartDate));
                $row.find('.StartDateMinuteSelect').html(getOptionsHtml("minute", newStartDate));

                $row.find('.EndDateHourSelect').html(getOptionsHtml("hour", newEndDate));
                $row.find('.EndDateMinuteSelect').html(getOptionsHtml("minute", newEndDate));


                newStartDate = newStartDate.setMonth(newStartDate.getMonth() - 1);
                newEndDate = newEndDate.setMonth(newEndDate.getMonth() - 1);

                $row.find('.newStartDate').datepicker('setDate', new Date(newStartDate));
                $row.find('.newEndDate').datepicker('setDate', new Date(newEndDate));




            }
            catch (err) {
            }

        })

        // $(".ImageRow .remove").off();
        parent.find(".ImageRow .remove").off();
        parent.find(".ImageRow .remove").on("click", function () {
            if (parent.find('.ImageRow').length > 1)
                $(this).parent().remove();
        });




        //(1)  add new row of manual Image info input
        parent.find(".addNewImageRow").click(function () {

            var parent = $(this).closest("#ImageCarouselManualInputTable");

            //parent.find('.ImageRow').last().after("<tr class='ImageRow'><td><input class='newImageID' placeholder='Image ID *' /><input class='newImageOrder' placeholder='Sequence number in carousel'  /><input class='newImageTitle' placeholder='Image Tittle *' /><input class='newPageHyperlink' placeholder='Hyperlink to destination papge *'  /><textarea class='newCaption' placeholder='Feature description' ></textarea><textarea class='newAltText' placeholder='Alt Text *' ></textarea><input class='newStartDate' placeholder='Start Date *' /><input class='newEndDate' placeholder='End Date *'   /></td><td class='remove'><i class='fa fa-ban fa-lg'></i></td></tr>");
            parent.find('.ImageRow').last().after("<tr class='ImageRow'><td class='well'><div class='col-md-4'></div><div class='col-md-4'><input type='number' min='1' class='newImageID  form-control' placeholder='Image ID *'  /></div><div class='col-md-4'><input type='number' min='1' class='newImageOrder  form-control' placeholder='Sequence number in carousel'  /></div><input class='newImageTitle col-md-12 form-control' placeholder='Image Tittle *'  /><input class='newPageHyperlink col-md-12  form-control' placeholder='Hyperlink to destination page *'  /><textarea class='newCaption  col-md-12 form-control' placeholder='Feature description' ></textarea><div class='col-md-6'><input class='newStartDate form-control' placeholder='Start Date *' /></div><div class='col-md-3'><select class='StartDateHourSelect form-control'>" + getOptionsHtml("hour", "") + "</select></div><div class='col-md-3'><select class='StartDateMinuteSelect form-control'>" + getOptionsHtml("minute", "") + "</select></div><div class='col-md-6'><input class='newEndDate  form-control' placeholder='End Date *'   /></div><div class='col-md-3'><select class='EndDateHourSelect form-control'>" + getOptionsHtml("hour", "") + "</select></div><div class='col-md-3'><select class='EndDateMinuteSelect form-control'>" + getOptionsHtml("minute", "") + "</select></div></td><td class='remove'><i class='fa fa-ban fa-lg'></i></td></tr>");
            parent.find(".ImageRow .remove").off();
            parent.find(".ImageRow .remove").on("click", function () {
                if (parent.find('.ImageRow').length > 1)
                    $(this).parent().remove();
            });

            setDatePicker();
        });





        //(2)    //save new image configurations to list
        parent.find("#submitAndSaveImagesInfo").click(function () {

            //parent.find("#submitAndSaveImagesInfo").hide();
            $(this).hide();
            var context = new SP.ClientContext.get_current();

            var parent = $(this).closest("#ImageCarouselManualInputTable");
            var WPID = $.trim(parent.find('.WebpartID').first().html());

            //validation of all data
            var ImageCaptionLength = 125;
            var ImageDescLength = 300;
            var ImageAltTextLength = 255;
            var ImageTitleLength = 65;

            parent.find(".validatorError").remove();

            var IsValid = true;

            $.each(parent.find('.ImageRow'), function (index, row) {
                $row = $(row);
                var newID = $.trim($row.find('.newImageID').val());
                var newCap = $.trim($row.find('.newCaption').val());
                //var newDesc = $.trim($row.find('.newDesc').val());
                // var newAltText = $.trim($row.find('.newAltText').val());
                var newTitle = $.trim($row.find('.newImageTitle').val());
                var newOrder = $.trim($row.find('.newImageOrder').val());
                var newHyperlink = $.trim($row.find('.newPageHyperlink').val());
                var newStartDate = $row.find('.newStartDate').val();
                var newEndDate = $row.find('.newEndDate').val();


                if (newID.length == 0 && newID.trim().length == 0)   //No need to worry about the empty rows
                {

                }
                else {
                    var reg = new RegExp('^\\d+$');

                    if (!reg.test(newID)) {
                        IsValid = false;
                        $row.find('.newImageID').after("<div class='validatorError' style='color:red'>Please type correct ID of image</div>");
                    }
                    else {

                        if (newOrder.length > 0 && !reg.test(newOrder)) {
                            $row.find('.newImageOrder').after("<div class='validatorError' style='color:red'>Incorrect value, please enter integers only.</div>");
                        }

                        if (newCap.length >= ImageCaptionLength) {
                            IsValid = false;
                            $row.find('.newCaption').after("<div class='validatorError' style='color:red'>No more than " + ImageCaptionLength + " characters please.</div>");
                        }

                        if (newTitle.length == 0 || newTitle.length >= ImageTitleLength) {
                            IsValid = false;
                            $row.find('.newImageTitle').after("<div class='validatorError' style='color:red'>Title is mandatory and no more than " + ImageTitleLength + " characters please.</div>");

                        }
                        if (newHyperlink.length == 0) {
                            IsValid = false;
                            $row.find('.newPageHyperlink').after("<div class='validatorError' style='color:red'>Hyperlink to a page is mandatory.</div>");

                        }

                        //if (newAltText.length == 0 || newAltText.length >= ImageAltTextLength) {
                        //    IsValid = false;
                        //    $row.find('.newAltText').after("<div class='validatorError' style='color:red'>Alt text is mandatory and no more than " + ImageAltTextLength + " characters please.</div>");

                        //}
                        if (newStartDate.length == 0 || newEndDate.length == 0) {
                            IsValid = false;
                            $row.find('.newEndDate').after("<div class='validatorError' style='color:red'>Start date and End date are mandatory.</div>");

                        }
                    }


                }

            })

            if (!IsValid) {
                parent.find("#submitAndSaveImagesInfo").show();
                return;
            }




            //remove all existing records

            $().SPServices({

                operation: "GetListItems",
                async: false,
                webURL: "/",
                listName: "ImageCarouselData",
                CAMLQuery: "<Query><Where><Eq><FieldRef Name='ImageCarouselWebpartID'/><Value Type='Text'>" + WPID + "</Value></Eq>" +
                                "</Where><OrderBy><FieldRef Name='ImageOrderNumber' Ascending='TRUE' /></OrderBy></Query>",
                completefunc: function (xData, Status) {

                    if (Status == "success") {
                        if ($(xData.responseXML).SPFilterNode("z:row").length > 0) {
                            $(xData.responseXML).SPFilterNode("z:row").each(function () {
                                var id = $(this).attr("ows_ID");
                                $().SPServices({
                                    operation: "UpdateListItems",
                                    async: false,
                                    batchCmd: "Delete",
                                    webURL: "/",
                                    ID: id,
                                    listName: "ImageCarouselData",
                                    completefunc: function (xData, Status) {
                                        if (Status == "success") { }
                                        else { }

                                    }
                                });

                            });
                        }
                    }

                }
            });



            //
            function convertThisDate(thisDate) {

                var myDate;
                if (thisDate != null) {
                    myDate = thisDate;
                }
                else {
                    myDate = new Date();
                }

                var stringDate = "";
                stringDate += thisDate.getFullYear() + "-";
                stringDate += thisDate.getMonth() + 1 + "-";
                stringDate += thisDate.getDate();
                stringDate += "T" + thisDate.getHours() + ":";
                stringDate += thisDate.getMinutes() + ":";
                stringDate += thisDate.getSeconds() + "Z";
                return stringDate;
            }


            //var order = 1;



            //SAVE BOTH EXISTING AND NEW ROWS TO SP LIST
            $.each(parent.find('.ImageRow'), function (index, row) {

                $row = $(row);
                var newID = $.trim($row.find('.newImageID').val());

                if (newID.length > 0 && newID.trim().length > 0) {

                    var newCap = $.trim($row.find('.newCaption').val());
                    //var newDesc = $.trim($row.find('.newDesc').val());
                    //var newAltText = $.trim($row.find('.newAltText').val());
                    var newTitle = $.trim($row.find('.newImageTitle').val());
                    var newOrder = $.trim($row.find('.newImageOrder').val());
                    var newHyperlink = $.trim($row.find('.newPageHyperlink').val());

                    try {
                        var newStartDate = new Date($row.find('.newStartDate').datepicker('getDate').getTime());
                        var newEndDate = new Date($row.find('.newEndDate').datepicker('getDate').getTime());

                        //newStartDate.setMinutes(30);
                        newStartDate.setHours(parseInt($row.find('.StartDateHourSelect option:selected').text()));
                        newStartDate.setMinutes(parseInt($row.find('.StartDateMinuteSelect option:selected').text()));

                        newEndDate.setHours(parseInt($row.find('.EndDateHourSelect option:selected').text()));
                        newEndDate.setMinutes(parseInt($row.find('.EndDateMinuteSelect option:selected').text()));
                    }
                    catch (err) {
                        var newStartDate = new Date().getTime();
                        var newEndDate = new Date().getTime();
                    }

                    $().SPServices({
                        operation: "UpdateListItems",
                        async: false,
                        batchCmd: "New",
                        webURL: "/",
                        listName: "ImageCarouselData",
                        valuepairs: [["ImageCarouselWebpartID", WPID], ["Title", newTitle], ["ImageID", newID], ["PageHyperlink", newHyperlink], ["ImageAltText", ""], ["ImageCaption", newCap], ["ImageOrderNumber", newOrder], ["ImageStartDate", convertThisDate(newStartDate)], ["ImageEndDate", convertThisDate(newEndDate)]],
                        completefunc: function (xData, Status) {
                            if (Status != "success") {

                                parent.closest("#ErrorPoster").html("Failed to save changes, please try again.");
                                parent.find("#submitAndSaveImagesInfo").show();
                                return;
                            }
                            else {
                                // order++;
                            }

                        }
                    });


                }

            })


            //if success

            //alert("New Adhoc QA set has been created and saved successfully, please tick the QA sets you would like to display in this Accordion webpart from the webpart propreties.");
            alert("Changes have been saved!");
            location.reload();

        });
    }



});

//IMAGE CAROUSEL NEW   ENDS HERE


//LATEST NEWS 


$('document').ready(function () {
    $('.latest-news-sliders').closest('.ms-webpart-cell-vertical').css('display', 'block', 'important');
});



$('.latest-news-sliders').slick({
    infinite: false,
    slidesToShow: 1,
    slidesToScroll: 1,
    mobileFirst: true,
    nextArrow: '<img class="slick-next" src="/system/images/chevron-right.png"/>',
    prevArrow: '<img class="slick-prev" src="/system/images/chevron-left.png"/>',
    responsive: [
        {
            breakpoint: 415,
            settings: {
                slidesToShow: 2,
                slidesToScroll: 1,
            }
        },
        {
            breakpoint: 768,
            settings: {
                slidesToShow: 3,
                slidesToScroll: 1,
            }
        }
    ]
});

//LATEST NEWS ENDS HERE
// Reserved Parking start
/*
$(function () {
    if ($('.mvga-datepicker').length > 0)
        $('.mvga-datepicker').datepicker({ dateFormat: 'dd/mm/yy' });
});
*/
// Reserved Parking end


function pageLoad() {
    if ($('.mvga-datepicker-10day-1year-validation').length > 0)
        $('.mvga-datepicker-10day-1year-validation').datepicker({
            dateFormat: 'dd/mm/yy',
            minDate: "+15d",
            maxDate: "+1y"
        }).attr('readonly', 'readonly');
    if ($('.mvga-datepicker-10day-validation').length > 0)
        $('.mvga-datepicker-10day-validation').datepicker({
            dateFormat: 'dd/mm/yy',
            minDate: "+15d"
        }).attr('readonly','readonly');
    if ($('.mvga-datepicker').length > 0)
        $('.mvga-datepicker').datepicker({
            dateFormat: 'dd/mm/yy'}).attr('readonly','readonly');
}

//Add in by CT, Disable invalid date from the Datepicker This Section is used by the "Reserved parking permit application form"
$(document).ready(function () {	

		if ($('.mvga-ParkingPermit-StartDate').length > 0)
		{
			var DatePart = $('.hiddenSartDate').val().split("/");
			$('.mvga-ParkingPermit-StartDate').datepicker({
				dateFormat: 'dd/mm/yy'
				,minDate: new Date(DatePart[2],DatePart[1]-1,DatePart[0])}).attr('readonly','readonly');
		}		
	
		if ($('.mvga-ParkingPermit-ToDate').length > 0)
		{
			var DatePart = $('.hiddenSartDate').val().split("/");
			$('.mvga-ParkingPermit-ToDate').datepicker({
				dateFormat: 'dd/mm/yy'
				,minDate: new Date(DatePart[2],DatePart[1]-1,DatePart[0])}).attr('readonly','readonly');
		}
});

//William's Change request #21 for media player

$(document).ready(function () {
    $(".media-tabs .nav-tabs .active:not(.activePriority)").removeClass("active");

});


$(document).on("click", ".media-tabs .nav-tabs .active", function () {

    var elementID = $(this).find('a').attr('href');

    if ($(elementID).parent().css("display") == "none") {

        $(this).parent().css("border-bottom", "1px solid #ddd");
        $(elementID).parent().show();

    }
    else {

        $(this).parent().css("border-bottom", "none");
        $(elementID).parent().hide();
        $('.media-tabs .nav-tabs .active').blur().removeClass("active");
    }
});

$(document).on("click", ".media-tabs .nav-tabs li:not(.active)", function () {
    var elementID = $(this).find('a').attr('href');
    $(this).parent().css("border-bottom", "1px solid #ddd");
    $(elementID).parent().show();
});


//done changes for media player



// JS for GroupFitnessTimetable and LaneAvailability


$(function () {

    if ($(".TimetableOrLaneAvailability").length > 0) {
        $.getScript('/system/TimetableAndClasses/combres.axd/siteJs/elicitedJS.js', function (data, textStatus, jqxhr) {
            if (textStatus = "success") {
                $('#tabs').organicTabs();
                $(".TimetableOrLaneAvailability .classCell .collapsible").keypress(function (e) {
                    if (e.keyCode == 13) {
                        $(this).find('h4').trigger("click");
                    }
                });
            }
        })

    }
});


// done JS for GroupFinessTimetable and LaneAvailability


//WILLIAM PART END **************************************************************************************************************************************************
 

var liveChatClientId = $("#mvgaLiveChatClientId").val();
var twitterCloseChatButtonText = $("#twitterCloseChatButtonText").val();

function setupLiveChat() {
    if (!window._laq) {
        window._laq = [];
    }

    window._laq.push
    (
            function () {

                var mvgaLiveChatContainerOnline = document.getElementsByClassName('mvgaLiveChatContainerOnline')
                var i;
                for (i = 0; i < mvgaLiveChatContainerOnline.length; i++) {
                    
                    liveagent.showWhenOnline(liveChatClientId, mvgaLiveChatContainerOnline[i]);
                    liveagent.showWhenOnline(liveChatClientId, mvgaLiveChatContainerOnline[i].querySelector('#mvgaLiveChatOnline'));
                    liveagent.showWhenOnline(liveChatClientId, mvgaLiveChatContainerOnline[i].querySelector('#mvgaLiveChatOpOnlineCaption'));
                }

                var mvgaLiveChatContainerOffline = document.getElementsByClassName('mvgaLiveChatContainerOffline')
                var j;
                for (j = 0; j< mvgaLiveChatContainerOffline.length; j++) {
                    
                    liveagent.showWhenOffline(liveChatClientId, mvgaLiveChatContainerOffline[j]);
                    liveagent.showWhenOffline(liveChatClientId, mvgaLiveChatContainerOffline[j].querySelector('#mvgaLiveChatOpOfflineCaption'));
                    liveagent.showWhenOffline(liveChatClientId, mvgaLiveChatContainerOffline[j].querySelector('#mvgaLiveChatOffline'));
                    liveagent.showWhenOffline(liveChatClientId, mvgaLiveChatContainerOffline[j].querySelector('#mvgaLiveChatOfflinePhone'));
                }


                    

                }

       );

}


function startLiveChat() {

    var iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    if (iOS) {
        standardPageContent.hide();
        standardPageContent.after('<button type="button" class="live-chat-component" onclick="closeLiveChat();">' + twitterCloseChatButtonText + '</button><iframe name="LiveChatFrame" id="LiveChatFrame" class="live-chat-component" style="width: 100%; height: 500px;"></iframe>');
        liveagent.startChatWithWindow(liveChatClientId, 'LiveChatFrame');
    } else {
        liveagent.startChat(liveChatClientId);
    }

}

function closeLiveChat() {
    standardPageContent.show();
    $('.live-chat-component').remove();
}

$(document).ready(function () {
    if ($(".ms-rtestate-notify").find(".LightBoxControl2").length > 0) {
        $(".ms-rtestate-notify").addClass('LightBoxControl2RemoveMargin');
    };
});

/////**Site Feedback Form **////// 

        $(document).ready(function () {

            $('[id$=rblQ1]').find('input').change(function () {
                $('[id$=divMultiLine]').css("display", "block");
                $('.feedbackButtonDiv').css("display", "block");
            });
        });

        // Feedback validation 
        function setupFeedbackValidation() {

            var showFeedback = true;

            //Feedback form will not be displayed on        home + landing + search results + publication index + finder pages

            if ($(".noFeedback").length > 0 ||
                 $(".eventfindContainer").length > 0 ||
                 $(".tile-carousel").length > 0
                ) {
                showFeedback = false;

            }
            else {
                $(".fbContainer").show();
            }


            if (showFeedback) {
                $('[id$=btnSubmitFeedback]').click(function (e) {
                    if (!isfeedbackValid()) {
                        e.preventDefault();
                    }
                });

                function isfeedbackValid() {

                    var radioSelected = $("input:radio[id^='ctl00_PlaceHolderFeedback_FeedbackForm_rblQ1']").is(":checked");

                    if (!radioSelected && $.trim($("textarea[id$='FeedbackForm_txtbQ2']").val()).length == 0
                        ) {
                        $('#divfeedbackMsg').html('Please answer at least one question.');
                        $('#divfeedbackMsg').css("display", "block");
                        return false;
                    }

                    if ($("textarea[id$='FeedbackForm_txtbQ2']").val().length > 1000) {
                        $('#divfeedbackMsg').html('Please enter up to 1000 characters only.');
                        $('#divfeedbackMsg').css("display", "block");
                        return false;
                    }
                    return true;
                }
            }


        }

        function skm_CountTextBox(textboxId, outputId, formatString, treatCRasOneChar, maxChars, maxWords, defaultCssClass, warningCssClass, maxCssClass, warningPercentage) {
            var textBox = document.getElementById(textboxId);
            var output = document.getElementById(outputId);

            var tbText = textBox.value;
            var totalWords = 0, wordsRemaining = 0;
            var totalChars = 0, charsRemaining = 0;

            // Count the total number of words...    
            var uniformSpaces = tbText.replace(/\s/g, ' ');
            var pieces = uniformSpaces.split(' ');

            for (var i = 0; i < pieces.length; i++)
                if (pieces[i].length > 0)
                    totalWords++;

            // Count the total number of characters...
            if (treatCRasOneChar) {
                var removedExtraChar = tbText.replace('\r\n', '\n');
                totalChars = removedExtraChar.length;
            }
            else
                totalChars = tbText.length;

            // Compute chars/words remaining    
            if (maxChars > 0 && (maxChars - totalChars > 0))
                charsRemaining = maxChars - totalChars;
            if (maxWords > 0 && (maxWords - totalWords > 0))
                wordsRemaining = maxWords - totalWords;

            // Output the message, replacing the placeholders as needed
            output.innerHTML = formatString.replace('{0}', totalWords).replace('{1}', totalChars).replace('{2}', wordsRemaining).replace('{3}', charsRemaining).replace('{4}', maxWords).replace('{5}', maxChars);

            // Apply the appropriate CSS class, if needed
            if ((defaultCssClass != '' || warningCssClass != '' || maxCssClass != '') && (maxChars > 0 || maxWords > 0) && (warningPercentage > 0)) {
                // Only apply the CSS classes if they have a value to apply
                // and if at least one of the max variables is set
                if (((totalChars >= maxChars && maxChars > 0) || (totalWords >= maxWords && maxWords > 0)) && (maxCssClass != '')) {
                    output.className = output.className.replace(defaultCssClass, '');
                    output.className = output.className.replace(warningCssClass, '');

                    if (output.className.search(maxCssClass) == -1) {
                        output.className = output.className + ' ' + maxCssClass;
                    }
                }
                else if (((totalChars >= warningPercentage / 100 * maxChars && maxChars > 0) || (totalWords >= warningPercentage / 100 * maxWords && maxWords > 0)) && (warningCssClass != '')) {
                    output.className = output.className.replace(defaultCssClass, '');
                    output.className = output.className.replace(maxCssClass, '');

                    if (output.className.search(warningCssClass) == -1) {
                        output.className = output.className + ' ' + warningCssClass;
                    }
                }
                else {
                    output.className = output.className.replace(warningCssClass, '');
                    output.className = output.className.replace(maxCssClass, '');

                    if (output.className.search(defaultCssClass) == -1) {
                        output.className = output.className + ' ' + defaultCssClass;
                    }
                }
            }
        }

        function setupFormsBuilder() {
            $('.fb2-form-layout .error').siblings('input, textarea').addClass('error-border');
            $('.fb2-form-layout .error').first().siblings('input, textarea').first().focus();
        }
        // get the url with updated query string
        function updateQueryStringValue(uri, key, value) {
            var re = new RegExp("([?|&])" + key + "=.*?(&|#|$)", "i");
            if (uri.match(re)) {
                return uri.replace(re, '$1' + key + "=" + value + '$2');
            } else {
                var hash = '';
                if (uri.indexOf('#') !== -1) {
                    hash = uri.replace(/.*#/, '#');
                    uri = uri.replace(/#.*/, '');
                }
                var separator = uri.indexOf('?') !== -1 ? "&" : "?";
                return uri + separator + key + "=" + value + hash;
            }
        }

        // Get rid of name.dll reference to fix "plugin blocked" errors.
        function ProcessImn() { }
        function ProcessImnMarkers() { }

        var FlickrInstaPhotos = 0;
        //social media
        if ($("#uniqueInstagram").length) {
            $("#PhotosUL").html("");
            $.ajax({
                type: "GET",
                async: true,
                contentType: "application/json; charset=utf-8",
                //Recent user photos   
                url: 'https://api.instagram.com/v1/users/' + instagramaccessid + '/media/recent?access_token=' + instagramaccesstoken,
                data: {
                    count: 18,
                },
                dataType: "jsonp",
                cache: false,
                beforeSend: function () {
                    $("#loading").show();
                },
                success: function (data) {
                    $("#loading").hide();
                    if (data == "") {
                        $("#PhotosDiv").hide();
                    } else {
                        $("#PhotosDiv").show();
                        for (var i = 0; i < data["data"].length; i++) {
                            $("#PhotosUL").append("<div class='col-lg-2 col-md-2 col-sm-4 col-xs-4 Insta'><div class='Insta-Wrapper'><a href='" + data.data[i].link + "'><img src='" + data.data[i].images.thumbnail.url.replace('s150x150/', 's320x320/') + "' class='img-responsive'></img></a></div></div>");
                        }
                    }
                    //social_popup();
                    setTimeout(function () {
                        FlickrInstaPhotosResize();
                    }, 1000);
                }
            });
        }

        // SOCIAL MEDIA (instagram) image inlarg popup
        //code not complete, not implemented yet
        function social_popup() {
            $("#uniqueInstagram .Insta-Wrapper a").click(function (e) {
                //console.log('preventDefault');
                e.preventDefault();
                var modal_template = '<div class="Modal"> \
                                <div class="ModalGray"></div> \
                                <div class="ModalWindow"> \
                                    <i tabindex="0" aria-label="Close the popup" class="closeIcon fa fa-times fa-2x"></i> \
                                    <div class="LightBoxImage"> \
                                        <div class="LightBoxImageTitle"><h2 class="title"></h2></div> \
                                        <div class="responsive-container"><!-- <div class="dummy"></div> --> \
                                        <div class="img-container"><img class="largeImage" alt="" /></div> \
                                    </div> \
                                </div> \
                            </div>';
                //console.log(modal_template);
                var modal = $("#uniqueInstagram").append(modal_template);
                //console.log(modal);
                modal.show();

                //dynamically sets the longer side of image as 100% length.
                // Get on screen image
                var screenImage = $(this).find("img");
                //console.log(screenImage);
                // Create new offscreen image to test
                var theImage = new Image();
                theImage.src = screenImage.attr("src");
                //console.log(theImage.src);
                // Get accurate measurements from that.
                var imageWidth = theImage.width;
                var imageHeight = theImage.height;
                if (imageWidth > imageHeight)
                    screenImage.css('width', '100%');
                else
                    screenImage.css('height', '100%');
                $('body').css("overflow", "hidden");
            });
        }

        if ($("#uniqueTwitter").length) {
            !function (d, s, id) { var js, fjs = d.getElementsByTagName(s)[0], p = /^http:/.test(d.location) ? 'http' : 'https'; if (!d.getElementById(id)) { js = d.createElement(s); js.id = id; js.src = p + "://platform.twitter.com/widgets.js"; fjs.parentNode.insertBefore(js, fjs); } }(document, "script", "twitter-wjs");

        }

        // twitter scrollbars.
        $('.twitter-scrollbar').mCustomScrollbar({ theme: '3d' });

        $(document).ready(function () {
            if ($(window).width() > 760) {
                clearTimeout(window.resizedFinished);


                if ($(".TwitterWrap").length) {
                    // var newHeight;
                    if (FlickrInstaPhotos == 0) {
                        setTimeout(function () {
                            FlickrInstaPhotosResize();
                        }, 1000);
                    }
                    //console.log(FlickrInstaPhotos);
                }
            }
            else {
                $('.twitter-scrollbar').mCustomScrollbar("disable");
                $(".TwitterWrap").height("inherit");

            }

            $(window).resize(function () {
                clearTimeout(window.resizedFinished);

                //call function when window resize complete
                window.resizedFinished = setTimeout(function () {
                    FlickrInstaPhotosResize();
                    TwitterScrollBar();
                    //ResizeBreadCrumb();
                }, 500);
            });

        })
        function FlickrInstaPhotosResize() {

            FlickrInstaPhotos = $(".FlickrInstaPhotos").height();
            if (FlickrInstaPhotos > 0) {
                $(".TwitterWrap").height(FlickrInstaPhotos);
            }
        }

        function TwitterScrollBar() {
            if ($(window).width() <= 760) {
                $('.twitter-scrollbar').mCustomScrollbar("disable");
                $(".TwitterWrap").height("inherit");
            }
            else {
                $('.twitter-scrollbar').mCustomScrollbar("update");
            }
        }

        //animate anchor
        $(function () {

            $('a[href*="#"]:not([href="#"])').click(function () {
                if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
                    if (!this.hash == "") {
                        target = get_target(this.hash);
                        animate_scroll(target);
                    }
                }
            });
            function get_target(hash) {
                if (!hash == "") {
                    var target = $(hash);
                    return target.length ? target : $('[name=' + hash.slice(1) + ']');
                }
            }
            function animate_scroll(target) {
                if (target != undefined) {
                    if (target.length) {
                        var top_offset = 11;
                        //$('html').hasClass('sticky-state')
                        if ($(window).width() >= 1200) {
                            top_offset = 111
                        }
                        var _scrollTop = target.offset().top;
                        var _scrollTop = _scrollTop - top_offset;
                        $('html, body').animate({
                            scrollTop: (_scrollTop)
                        }, 100).promise().then(function () {
                            // normal callback
                            scrollTo(window.scrollX, _scrollTop);
                        });

                        return false;
                    }
                }
            }
            setTimeout(function () {
                var hash_url = location.hash;
                target = get_target(hash_url);
                animate_scroll(target);
            }, 300);
        });

        function MakeCarouselAccessibleIfImagesTurnedOff() {

            // last thing Fix Carousel if images are off    

            var logoHeight = $('img.logo.hidden-xs').height();
            // JR Apple ph 6, 6s act or behave like chrome and IE do when images turned off so we look for logo size when images are off in these browsers bw 27 51
            if (logoHeight >= 18 && logoHeight <= 37 && logoHeight != 0) {
                $('div.galleria-container').append("<ul style='width:100%;display:table;table-layout:fixed;' id='carouselNoImageList'></ul>");
                $listSelector = $("#carouselNoImageList");

                $.each(carouselData, function (indx, obj) {

                    var lurl = obj.link;
                    lurl = lurl.replace(/\/$/, "");

                    var temp = "<li style='width:auto;text-align:left;'><a tabindex='0' href=" + lurl + ">" + obj.title + "</a></li>";
                    
                    $listSelector.append(temp);
                });

                $('div.tile-image').removeClass('tile-image');
                $('div.galleria-stage').removeClass('galleria-stage');
                $('div.galleria-info-title').removeClass('galleria-info-title');
                $('div.galleria-image-nav').removeClass('galleria-image-nav');
                $('div.carousel').remove('galleria-image-nav');
                $("div.tile-title").css("color", "#fff");
                $("div.tile-title").css('background-color', '#277bb4');
               // $("div.tile-title-inner-inner").css("color", "black");
                $("div.tile-title-inner").css("color", "#fff");
               // $("div.tile-description-inner-inner").css("color", "#fff");

                
                console.log('inside tile div');
                

                // get rid of the spinning canvas gif thingy
                $('canvas').remove();
            }
        }


function MakeImageGalleryAccessibleIfImagesTurnedOff() {

    // last thing Fix Carousel if images are off    

    var logoHeight = $('img.logo.hidden-xs').height();
    // JR Apple ph 6, 6s act or behave like chrome and IE do when images turned off so we look for logo size when images are off in these browsers bw 27 51
    if (logoHeight >= 18 && logoHeight <= 37 && logoHeight != 0) {
        $('div .galleria-container').append("<ul style='width:100%;display:table;table-layout:fixed;' id='carouselNoImageList'></ul>");
        $listSelector = $("#carouselNoImageList");

        $.each(carouselData, function (indx, obj) {

            var alttext = "";
            var desctext = "";
            if (obj.original.alt != null) {
                alttext = obj.original.alt;
            }

            if (obj.description != null) {
                desctext = obj.description;
            }

            if (alttext != "" && desctext != "") {
                $listSelector.append("<li style='width:auto;text-align:left;'>Caption: <a tabindex='0' href=" + obj.image + ">" + obj.title + "</a>. Description: " + desctext + ". Alternative text: " + alttext + ".</li>");
            }
            else if (alttext != "" && desctext == "") {
                $listSelector.append("<li style='width:auto;text-align:left;'>Caption: <a tabindex='0' href=" + obj.image + ">" + obj.title + "</a>. Alternative text: " + alttext + ".</li>");
            }
            else if (alttext == "" && desctext != "") {
                $listSelector.append("<li style='width:auto;text-align:left;'>Caption: <a tabindex='0' href=" + obj.image + ">" + obj.title + "</a>. Description: " + desctext +".</li>");
            }
            else {
                $listSelector.append("<li style='width:auto;text-align:left;'>Caption: <a tabindex='0' href=" + obj.image + ">" + obj.title + "</a>. </li>");
            }


        });

        $('div.tile-image').removeClass('tile-image');
        $('div.galleria-stage').removeClass('galleria-stage');
        $('div.galleria-info-title').removeClass('galleria-info-title');
        $('div.galleria-image-nav').removeClass('galleria-image-nav');
        $("div.galleria-bar").css("display", "none");
        $("div.galleria-info").css("display", "none");
        

       
        $('div.carousel').remove('galleria-image-nav');
        $("div.tile-title").css("color", "black");
        // get rid of the spinning canvas gif thingy
        $('canvas').remove();
    }
}




    /////**  In This Section script  **////// 

        $(document).ready(function () {
           //alert(navigator.userAgent);

            //call InThisSection Webpart related function on document.ready                          
            if ($("#inThisSectionExclusionSpan").length > 0)
            {
                $("#inThisSectionExclusionSpan").hide();
            
                getNavigationSiteMap();
            }

            //call SiteMapWebpart related function //
            if ($(".smwp-list").length > 0) {                                
                siteMapAdhoc();
            }
        });        

        function getNavigationSiteMap() {
            var protocol = $(location).attr('protocol');
            var hostName = $(location).attr('hostname');
            var absoluteUrl = protocol + "//" + hostName;

            $.ajax({
                url: absoluteUrl + _spPageContextInfo.webServerRelativeUrl + "/_api/navigation/menustate?mapprovidername='CurrentNavigationSwitchableProvider'",
                method: "GET",
                headers: { "Accept": "application/json; odata=verbose" },
                success: function (data) {
                    // Returning the results
                    getNavigationSiteMapSuccess(data);
                },
                error: function (data) {
                    getNavigationSiteMapfailure(data);
                }
            });
        }

        function getNavigationSiteMapSuccess(data) {
            var html = '';
            var isAllHidden = 0;
            var isChecked = false;
            var exclusionList;
            var exclusionArray = [];
            //getExclusionList();

            if (data != null) {
                var result = data.d;
                //var html = ''; 		

                for (var i = 0; i < data.d.MenuState.Nodes.results.length; i++) {
                    if (data.d.MenuState.Nodes.results[i].IsHidden == false) {
                        isAllHidden = isAllHidden + 1;

                        if ($("#MSOLayout_InDesignMode").attr('value') == "1") {
                            exclusionList = $("textarea[title='InThisSectionExclusion']").text();
                            exclusionArray = exclusionList.trim().split(" ; ");

                            var SimpleUrl = data.d.MenuState.Nodes.results[i].SimpleUrl;
                            var Title = data.d.MenuState.Nodes.results[i].Title;
                            if (exclusionArray.length > 0) {
                                for (var item = 0; item < exclusionArray.length; item++) {
                                    if (Title == exclusionArray[item]) {
                                        isChecked = true;
                                        break;
                                    }
                                    else {
                                        isChecked = false;
                                    }
                                }
                            }

                            if (isChecked == true) {
                                html += '<div class="col-sm-3">';
                                html += '<input type="checkbox" id="' + Title + '" name="inThisSectionGroup" value="' + Title + '" />';
                                html += '<a href= ' + SimpleUrl + ' tabindex="0">' + Title + ' </a>';
                                html += '</div>';
                            }
                            else {
                                html += '<div class="col-sm-3">';
                                html += '<input type="checkbox" id="' + Title + '" name="inThisSectionGroup" value="' + Title + '" checked />';
                                html += '<a href= ' + SimpleUrl + ' tabindex="0">' + Title + ' </a>';
                                html += '</div>';
                            }
                        }

                        else {
                            exclusionList = $("#inThisSectionExclusionSpan").text();
                            exclusionArray = exclusionList.trim().split(" ; ");

                            var SimpleUrl = data.d.MenuState.Nodes.results[i].SimpleUrl;
                            var Title = data.d.MenuState.Nodes.results[i].Title;

                            if (exclusionArray.length > 0) {
                                for (var item = 0; item < exclusionArray.length; item++) {
                                    if (Title == exclusionArray[item]) {
                                        isChecked = true;
                                        break;
                                    }
                                    else {
                                        isChecked = false;
                                    }
                                }
                            }
                            if (isChecked == false) {
                                html += '<div class="col-sm-3">';
                                html += '<a href= ' + SimpleUrl + ' tabindex="0">' + Title + ' </a>';
                                html += '</div>';
                            }
                        }
                    }
                    if (isAllHidden != 0) {
                        $("#emptyITSectionDiv").html("<div id='in-this-section-container' class='container-fluid'><h2>In this section</h2><div></div></div>");
                        $("#in-this-section-container > div").html(html);
                        $("#in-this-section-container").show();
                    }
                }

                $('input[type="checkbox"]').on("click", function () {
                    var favorite = [];

                    //$.each($("input[name='inThisSectionGroup']:checked"), function(){
                    $.each($("input[name='inThisSectionGroup']"), function () {
                        if (!$(this).is(':checked')) {
                            favorite.push($(this).val());
                        }
                        else {
                        }

                    });
                    $("textarea[title='InThisSectionExclusion']").text(favorite.join(" ; "));
                });

            }
        }

        function getNavigationSiteMapfailure(result) {
            console.log("Failed getting navigation data!");
        }
        /////**  In This Section script end  **////// 

        /////** Site-map webpart script  **////// 

        function siteMapAdhoc() {
            //All the L1s that have placeholder pages (or redirects) not to be linked //
            var l1Navigation = ['About Council', 'About Melbourne', 'Residents', 'Business', 'Community', 'Parking and Transport', 'Building and Development', 'Arts and Culture'];

            $.each(l1Navigation, function (i, val) {
                $(".smwp-list > .smwp-li").each(function () {
                    if ($(this).find("div:first a").text().trim() == l1Navigation[i]) {
                        //$(this).find("div:first a").bind('click', false).css({ 'cursor': "default", 'text-decoration': "none" });
                    }
                });
            });

            var l1Nav_With_NM = ['Home', 'About Council', 'About Melbourne', 'Residents', 'Business', 'Community', 'Parking and Transport', 'Building and Development', 'Arts and Culture', 'Careers', 'News and media'];
            var l1Nav_With_Out_NM = ['Home', 'About Council', 'About Melbourne', 'Residents', 'Business', 'Community', 'Parking and Transport', 'Building and Development', 'Arts and Culture', 'Careers'];
            var l1Nav_With_Out_Home = ['About Council', 'About Melbourne', 'Residents', 'Business', 'Community', 'Parking and Transport', 'Building and Development', 'Arts and Culture', 'Careers', 'News and media'];

            $.each(l1Nav_With_Out_NM, function (i, val) {
                $(".smwp-list > .smwp-li").each(function () {
                    if ($(this).find("div:first a").text().trim() == l1Nav_With_Out_NM[i]) {

                        var skipText = "Skip to " + l1Nav_With_NM[i + 1];
                        var html = '<a href="#' + skipText + '" class="skip-to-content-in-sitemap" style="font-style: normal; font-size: 10px;" >' + skipText + '</a>'

                        $(this).find("div:first a").after(html);
                    }
                });
            });

            $.each(l1Nav_With_Out_Home, function (i, val) {
                $(".smwp-list > .smwp-li").each(function () {
                    if ($(this).find("div:first a:first").text().trim() == l1Nav_With_Out_Home[i]) {

                        var skipText = "Skip to " + l1Nav_With_Out_Home[i];

                        //$(this).find("div:first a:first").attr('name', skipText).addClass("named-anchor-sitemap");
                    }
                });
            });

        }

    /////** Site-map webpart script end **////// 
       
    /////** Ministerial, Planning and VCAT's current tab reload on refresh of a page script  **////// 
       
        function ValidateDate(dateValue) {
            if (!(dateValue.length == 0))
            {
            //var dtValue = $('input[id$="_txtFromApplicationDate"]').val();
                var dtRegex = /^(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-]\d{4}$/;
                return dtRegex.test(dateValue);
            }
        }

        $('input[id$="_txtFromApplicationDate"]').keyup(function () {
            var dtValue = $('input[id$="_txtFromApplicationDate"]').val();
            if (ValidateDate(dtValue) == false)
            {
                if (!($('input[id$="_txtFromApplicationDate"]').val().length == 0))
                {
                    if (!($('.span-error').length)) {
                        $('input[id$="_txtFromApplicationDate"]').before("<span class='span-error' style='color:red;padding-right:2px;font-size:large'>!</span>");
                    }
                }

                if (($('input[id$="_txtFromApplicationDate"]').val().length == 10) || ($('input[id$="_txtFromApplicationDate"]').val().length == 9) && ($('.span-error').length))
                {
                    $('span.err-invaldate').css("display", "inherit");
                }

                /*$('input[id$="_btniCompasSearchDateRange"]').click(function (e) {
                     e.preventDefault();
                 });*/
                //$('input[id$="_txtFromApplicationDate"]').css("color", "Red");                
            }
            else
            {
                if ($('input[id$="_txtFromApplicationDate"]').val().length == 0) {
                    $("span.span-error").remove();
                }
                $("span.span-error").each(function () {
                    $(this).remove();
                });
                $('span.err-invaldate').css("display", "none");
            }

        });

        $('input[id$="_txtToApplicationDate"]').keyup(function () {

            var dtValue = $('input[id$="_txtToApplicationDate"]').val();

            if (ValidateDate(dtValue) == false) {
                if (!($('input[id$="_txtToApplicationDate"]').val().length == 0))
                {
                    if (!($('.span-error').length))
                    {
                        $('input[id$="_txtToApplicationDate"]').before("<span class='span-error' style='color:red;padding-right:2px;font-size:large'>!</span>");
                    }
                }

                if(($('input[id$="_txtToApplicationDate"]').val().length == 10) || ($('input[id$="_txtToApplicationDate"]').val().length == 9) && ($('.span-error').length))
                {
                    $('span.err-invaldate').css("display", "inherit");
                }

                /*$('input[id$="_btniCompasSearchDateRange"]').click(function (e) {
                     e.preventDefault();
                 });*/
            }
            else {
                if ($('input[id$="_txtToApplicationDate"]').val().length == 0) {
                    $("span.span-error").remove();
                }
                $("span.span-error").each(function () {
                    $(this).remove();
                });
                $('span.err-invaldate').css("display", "none");
            }

        });
        
        $('input[id$="_txtFromDecisionDate"]').keyup(function () {
            var dtValue = $('input[id$="_txtFromDecisionDate"]').val();

            if (ValidateDate(dtValue) == false) {
                if (!($('input[id$="_txtFromDecisionDate"]').val().length == 0))
                {
                    if (!($('.span-error').length)) {
                        $('input[id$="_txtFromDecisionDate"]').before("<span class='span-error' style='color:red;padding-right:2px;font-size:large'>!</span>");
                    }
                }

                if (($('input[id$="_txtFromDecisionDate"]').val().length == 10) || ($('input[id$="_txtFromDecisionDate"]').val().length == 9) && ($('.span-error').length))
                {
                    $('span.err-invaldate').css("display", "inherit");
                }               
            }
            else {
                if ($('input[id$="_txtFromDecisionDate"]').val().length == 0)
                {
                    $("span.span-error").remove();
                }
                $("span.span-error").each(function () {
                    $(this).remove();
                });
                $('span.err-invaldate').css("display", "none");
            }
        });

        $('input[id$="_txtToDecisionDate"]').keyup(function () {
            var dtValue = $('input[id$="_txtToDecisionDate"]').val();

            if (ValidateDate(dtValue) == false) {
                if (!($('input[id$="_txtToDecisionDate"]').val().length == 0))
                {
                    if (!($('.span-error').length)) {
                        $('input[id$="_txtToDecisionDate"]').before("<span class='span-error' style='color:red;padding-right:2px;font-size:large'>!</span>");
                    }
                }

                if (($('input[id$="_txtToDecisionDate"]').val().length == 10) || ($('input[id$="_txtToDecisionDate"]').val().length == 9) && ($('.span-error').length))
                {
                    $('span.err-invaldate').css("display", "inherit");
                }

                /*$('input[id$="_btniCompasSearchDateRange"]').click(function (e) {
                     e.preventDefault();
                 });*/
            }
            else {
                if ($('input[id$="_txtToDecisionDate"]').val().length == 0)
                {
                    $("span.span-error").remove();
                }
                $("span.span-error").each(function () {
                    $(this).remove();
                });
                $('span.err-invaldate').css("display", "none");
            }
        });

/////**Finder Box and Meetings Finder webpart script end **////// 
        $(document).ready(function () {
            $("#finderCtrlDiv select option[PreviousCommittee ='yes']").wrapAll("<optgroup label='Previous committees'>");
            $("#meetingSearchCtrlDiv select option[PreviousCommittee ='yes']").wrapAll("<optgroup label='Previous committees'>");          
        });


        $(document).ready(function () {
					
            //below stuff makes the js ".contains()" method case in-sensitive
            $.expr[":"].contains = $.expr.createPseudo(function (arg) {
                return function (elem) {
                    return $(elem).text().toUpperCase().indexOf(arg.toUpperCase()) >= 0;
                };
            });

			//Add by CT 27/08/2020
			//if the document.referrer is null then get the currnt URL with Query String
            var referrer = document.referrer;
			if (referrer == "")
			{
				referrer = window.location.href
			}
					
            var keywordkindex = referrer.indexOf("k=");
            if (keywordkindex != -1) {
                var slice = referrer.slice(referrer.indexOf("k=") + 2, referrer.indexOf("&"));
				
                if (slice) {
                    var keyword = slice.replace(/%20/g, " ");
					keyword = keyword.replace(/\+/g, " ");
					
                    //TOGGLE FAQ SETS based on the search keyword, if the accordion page was opened from search results
                    if ($(".accordionQuestion > .accordionQAHeader:contains('" + keyword + "')").length > 0) {
                        $(".accordionQAHeader:contains('" + keyword + "')").closest("div.accordionTitle").find(".accordionQuestion").css("display", "block");
                        $(".accordionQAHeader:contains('" + keyword + "')").closest("div.accordionTitle").find('.accfix').toggleClass("fa-minus");
                    }
                    if ($(".accordionQuestion > div.accordionAnswer:contains('" + keyword + "')").length > 0) {
                        $(".accordionAnswer:contains('" + keyword + "')").closest("div.accordionTitle").find(".accordionQuestion").css("display", "block");
                        $(".accordionAnswer:contains('" + keyword + "')").closest("div.accordionTitle").find('.accfix').toggleClass("fa-minus");
                        $(".accordionAnswer:contains('" + keyword + "')").closest("div.accordionAnswer").css("display", "block");
                        $(".accordionAnswer:contains('" + keyword + "')").closest("div.accordionQuestion").find(".accfixSmall ").toggleClass("fa-minus");
                    }

                    //TOGGLE ACCORDION (ADHOC) based on the search keyword, if the accordion page was opened from search results
                    if ($(".accordionQuestionAdhoc > div.accordionAnswer:contains('" + keyword + "')").length > 0) {
                        $(".accordionQuestionAdhoc .accordionAnswer:contains('" + keyword + "')").closest("div.accordionAnswer").css("display", "block");
                        $(".accordionQuestionAdhoc .accordionAnswer:contains('" + keyword + "')").closest("div.accordionQuestionAdhoc").find(".accfix").toggleClass("fa-minus");
                    }
                }
            }
        });

//CTA Flexi webpart
        $(document).ready(function () {
            $(".CTAFlexiContainerTop").height($(".CTAFlexiContainerTop").parent().height());
            $(".CTAFlexiContainerBottom").height($(".CTAFlexiContainerBottom").parent().height());


            if($('.downpage-promo-tiles ul li').size() < 1)
            {
                $('.promo-tile').css("display", "none");
            }
        });

        $(document).ready(function () {

            //Handle homepage split on accordion expand
            $("#ContentContainerInnerLower").each(function () {
                $(this).insertAfter($(this).parent().find("#ContentContainerInner"));
            });

            if (window.location.protocol == "https:") {

                    try {
                        $("img").each(function () {

                            var i = $(this).attr("src");
                            var n = i.replace("http://www.melbourne.vic.gov.au/", "https://www.melbourne.vic.gov.au/");
                            $(this).attr("src", function () {
                                return n
                            })
                        })
                    }
                    catch (err) {
                    }

                    try {
                        $("a").each(function () {

                            var i = $(this).attr("href");
                            var n = i.replace("http://www.melbourne.vic.gov.au/", "https://www.melbourne.vic.gov.au/");
                            $(this).attr("href", function () {
                                return n
                            })
                        })
                    }
                    catch (err) {
                    }






            }


            try {

                var textContainerHeight = $('#mapHeader').height();
                var textContainerWidth = $('#mapHeader').width()-35;

                $('#mapheaderText').css('max-height', textContainerHeight);
                $('#mapheaderText').css('max-width', textContainerWidth);
                $('#mapheaderText').css('text-overflow', 'ellipsis');
                $('#mapheaderText').css('overflow', 'hidden');
                $('#mapheaderText').css('white-space', 'nowrap');


                //$('#mapheaderText').each(function () {
                //    var $ellipsisText = $(this);

                //    while (($ellipsisText.outerHeight(true) ) > textContainerHeight) {
                //        $ellipsisText.text(function (index, text) {
                //            return text.replace(/\W*\s(\S)*$/, '...');
                //        });
                //    }
                //});


            } catch (e) {

            }


            try {
                $(".http").each(function () {

                    var i = $(this).attr("href");
                    var n = i.replace("http://www.melbourne.vic.gov.au/", "https://www.melbourne.vic.gov.au/");
                    $(this).attr("href", function () {
                        return n
                    })
                })
            }
            catch (err) {
            }

        });

        $(document).ready(function () {
            var maxHeight = 0;
            $(".vcat-heading").each(function () {
                if ($(this).outerHeight() > maxHeight) {
                    maxHeight = $(this).outerHeight()-15;
                }
            }).height(maxHeight);
        });

try {
    $(document).ready(function () {
        $('.img-responsive2 > div > p:eq(0)').length > 0 ? $('.img-responsive2').css('margin-bottom', '20px') : $('.img-responsive2').css('margin-bottom', '30px');
    });
} catch (e) {

}

try {
    $(document).ready(function () {
        $('.ms-webpartzone-cell').has('.download-container').css('display', 'block');
    })

} catch (e) {

}
 
//try {
//    $(document).ready(function () {
//        setTimeout(function () {
//            $('.galleria-container.notouch.galleria-theme-azur').css('margin-bottom', '-30px')
//        }, 500);
        
//    }
//    );
//} catch (e) {

//}


//Search Tabs
   


$(document).ready(function () {
    $(".accordionContainer a[href]").each(function () {
        $(this).attr("target", "_self");
    })

});

//ReadSpeaker 
//Update the URL to the current page
$(document).ready(function () {
	var href = $('.CoMReadSpeakerOveride a.rsbtn_play').attr('href');
	if(typeof href !== "undefined")
	{
		var New_href_Str = href.substr(0,href.indexOf("url")) + 'url=' + window.location.href;
		$('.CoMReadSpeakerOveride a.rsbtn_play').attr('href',New_href_Str);
	}
});
//ReadSpeaker

//IWamtToList

$(document).ready(function () {
	$(".IWTLHeadingArrowIcon").click(function () 
	{ 	
		//Only hide/show the Panel within the Webpart
		if( $(this).parent('.IWTHeadingFieldLab').parent('.IWantToListMainOuterWraper').find('.TopPanel').hasClass('hide') == false){
			$(this).parent('.IWTHeadingFieldLab').parent('.IWantToListMainOuterWraper').find('.TopPanel').addClass('hide');
			$(this).addClass('fa-flip-vertical');		
		}		
		else
		{
			$(this).parent('.IWTHeadingFieldLab').parent('.IWantToListMainOuterWraper').find('.TopPanel').removeClass('hide');
			$(this).removeClass('fa-flip-vertical');
		}		
	});
	
	//Expand and Contrect base on Screen size
	$(window).resize(function() {
		if (document.documentElement.clientWidth < 1024) {    
			if ($('.TopPanel').hasClass('IWTMobileMode') == false)
			{			
				$('.TopPanel').addClass('IWTMobileMode');
				$('.TopPanel').addClass('hide');
				$('.IWTLHeadingArrowIcon').addClass('fa-flip-vertical');
			}
        }
		else
		{
			$('.TopPanel').removeClass('IWTMobileMode');
			$('.TopPanel').removeClass('hide');
			$('.IWTLHeadingArrowIcon').removeClass('fa-flip-vertical');
		}
    }).resize()
	
});

//IWantToList

//ServiceCategory

	$(document).ready(function () {
		$(".SerCatHeadingLab").click(function () 
		{ 	
			//Test the window resolution befor executing the script
			if ($(window).width() < 1024) {
				//Only hide/show the Panel within the Webpart
				if( $(this).parent('.SerCatHeading').parent('.SerCatSection').find('.SerCatSectionInner').hasClass('hide') == false){
					$(this).parent('.SerCatHeading').parent('.SerCatSection').find('.SerCatSectionInner').addClass('hide');
					$(this).parent('.SerCatHeading').parent('.SerCatSection').find('.SerCatVMLinkDiv').addClass('hide');
					$(this).find('.SerCatHeadingArrowIcon').addClass('fa-flip-vertical');		
				}		
				else
				{
					$(this).parent('.SerCatHeading').parent('.SerCatSection').find('.SerCatSectionInner').removeClass('hide');
					$(this).parent('.SerCatHeading').parent('.SerCatSection').find('.SerCatVMLinkDiv').removeClass('hide');
					$(this).find('.SerCatHeadingArrowIcon').removeClass('fa-flip-vertical');
				}	
			};
		});			
				
		//Expand and Contrect base on Screen size
		$(window).resize(function() {
			if (document.documentElement.clientWidth < 1024) {  
				if ($('.SerCatSectionInner').hasClass('SerCatMobileMode') == false)			
				{
					$('.SerCatSectionInner').addClass('SerCatMobileMode');
					$('.SerCatSectionInner').addClass('hide');
					$('.SerCatVMLinkDiv').addClass('hide');
					$('.SerCatHeadingArrowIcon').addClass('fa-flip-vertical');
				}
			}
			else
			{
				$('.SerCatSectionInner').removeClass('SerCatMobileMode');
				$('.SerCatSectionInner').removeClass('hide');
				$('.SerCatVMLinkDiv').removeClass('hide');
				$('.SerCatHeadingArrowIcon').removeClass('fa-flip-vertical');
			}
		}).resize()
				
	});

//ServiceCategory


