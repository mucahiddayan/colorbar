/*
*	@author Mücahid Dayan < m.dayan[at]pmedia.de >
* 	@version 2.0
*		##### code wurde optimiert #####
*/
var debug = false;

function isEmpty($var) {
	var result;
	result = (Array.isArray($var)) ? ($var.length < 1 ? true : false)
	: (typeof $var == 'undefined' || $var == 'undefined'
		|| $var == null || $var == '') ? true : false;
	return result;
}

(function($){	
	function colorBar($settings){
		var defaults = {
			'noColor' : {
				'multi':'#000',
				'single':'#fff'
			},
			'colorArray'  : [],
			'textPosition' : 'in',
			include : {
				vibrant : location.origin+"/js/custom_js/vibrant.js",
			}
		};
		var settings = $.extend(true, defaults, $settings);
		var color_ = settings.color;
		var browsers = ['-webkit-linear-gradient','-o-linear-gradient','-moz-linear-gradient','linear-gradient'];
		
		function getRGBFromImg(img){
			var rgb;
			var vibrant,swatches;
			if (!isEmpty(settings.img)){
				try{
					vibrant = new Vibrant(settings.img),
					swatches = vibrant.swatches();
				}catch(e){
					console.warn('Vibrant is not included');					
					$.getScript( settings.include.vibrant )
					.done(function( script, textStatus ) {
						console.log( '%cVibrant has included successfully','color:green;' );
						getRGBFromImg(settings.img);
					})
					.fail(function( jqxhr, settings, exception ) {
						console.error('Vibrant could not be included');
						rgb = {r:255,g:255,b:255};
						return false;
					});					
				}		
			}
			else{
				rgb = {r:255,g:255,b:255}
			}
			return swatches;
		}
		var existColor = function($color){
			return !isEmpty($color)&&!isEmpty(settings.colorArray[$color/*.replace(/ /g, '')*/.toLowerCase()]); // return true if exist			
		}
		var isSplittable = function($color,$trimmer){
			$trimmer = isEmpty($trimmer)?' ':$trimmer;
			return $color.split($trimmer).length > 1?$color.split($trimmer):false;
		}
		var getColorCode = function($color){
			var rgb,rtn,col;
			var image = getRGBFromImg($settings.img);		
			if (image) {
				if ($color.toLowerCase().indexOf('dark')>-1) {
					col = isEmpty(image.DarkMuted)?image.Muted.rgb:image.DarkMuted.rgb;				
				}else{
					col = isEmpty(image.LightVibrant)?image.Muted.rgb:image.LightVibrant.rgb;				
				}
				rgb = {r:col[0],g:col[1],b:col[2]};
			}
			var $color = $color/*.replace(/ /g, '')*/;
			var rtnArray = [];
			if (existColor($color)) {
				if(debug)console.log('Color code exists for "'+ $color+'"');
				rtn = settings.colorArray[$color.toLowerCase()];
			}else{
				if (isSplittable($color)) {
					if(debug){console.log('Color code for "'+$color+'"" does not exist. Continiue analyzing...');}
					$.each(isSplittable($color),function(index, el) {
						rtnArray.push(getColorCode(el));
					});
					rtn = rtnArray;
				}else{
					if(debug){console.log('Color code does not exist for "'+ $color+'"');}
					rtn = 'rgb('+rgb.r+','+rgb.g+','+rgb.b+')';
					if(debug){console.log('Image is being analyzed : Color : '+rtn);}
				}
			}
			return rtn;			
		}
		var gradient = function($colors,$byColorCode){
			$byColorCode = isEmpty($byColorCode)?false:$byColorCode;
			var direction = 'left';
			var grd = '';
			var rtn = '';
			if ($byColorCode) {
				$.each($colors,function(index, el) {
					grd += ','+el;
				});	
			}else{
				$.each($colors,function(index, el) {
					grd += ','+getColorCode(el);
				});	
			}			
			$.each(browsers,function(index, el) {
				rtn+= 'background:'+el+'('+direction+' '+grd+');';
			});			
			return rtn;
		}

		var multiColor = function(){
			var colors = getColorCode('multicolor').split(' ');
			return gradient(colors,true);
		}		

		var backgroundColor = '';	

		if(/-|\//.test(color_.toLowerCase()) | new RegExp(/multi/).test(color_.toLowerCase())){
			if(debug){console.log('Mutiple Color');}
			if (new RegExp(/\//).test(color_.toLowerCase())) {
				if(debug){console.log("\t"+'-> "/"');}
				var colors = isSplittable(color_,'/');
				if (colors) {
					backgroundColor += gradient(colors);
				}				
			}else if (/-/.test(color_.toLowerCase())) {
				if(debug){console.log("\t"+'-> "-"');}
				var colors = isSplittable(color_,'-');
				if (colors) {
					/*$.each(colors,function(index, el) {
						var subColors = isSplittable(el,'/');
						if (subColors) {
							$.each(subColors,function(index, el) {
								colors.push(el);
							});
						}
					});*/
					backgroundColor += gradient(colors);
				}				
			}
			else if(new RegExp(/multi/).test(color_.toLowerCase())){
				if(debug){console.log("\t"+'-> "multi"');}
				backgroundColor += multiColor();
			}

		}else{
			if (Array.isArray(getColorCode(color_))) {
				backgroundColor += gradient(getColorCode(color_),true);				
			}else{
				backgroundColor += 'background-color:'+getColorCode(color_)+';'; 
			}
		}
		var icon = !isEmpty(settings.icon)?settings.icon:'';
				
		return {
			bar:'<div id="color" title="'+color_+'" data-color="'+color_+'" style="'+backgroundColor+'">'+icon,
			color : color_,
		};
	}

	$(document).ready(function() {
		//main 
		// if(debug){console.log($('.catalog-product-view .input-box').find('select').length);}
		if ($('.catalog-product-view .input-box').find('select').length > 1 && $('.product-options dt .required:contains("Farbe")').length >0) {
			var inputbox = $('.catalog-product-view .input-box').eq(0);
			var select = inputbox.find('select').eq(0);
			var color = !isEmpty(select.find('option').eq(1).text().split('dark')[0])?select.find('option').eq(1).text().split('dark').join('- dark'):select.find('option').eq(1).text().split('dark').join('dark');                                  			
			
			var cB =  new colorBar({
				color : color,
				colorArray: Colors,				
				icon : '',
				img : document.querySelector('.gallery-image'),
			}); 
			
			select.val(select.find('option').eq(1).val());
			select.change(function(){console.log($(this).value)});
			select.hide();
			inputbox.prepend('<div id="colorbar-wrapper">'+cB.bar+'</div><div id="colorText"><span>'+cB.color+'</span></div></div>');
		}
	});
})(jQuery);

