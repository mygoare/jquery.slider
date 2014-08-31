### Slider

Slider is a JQuery plugin which makes nearly the same effect of JQuery UI's slider, but you don't need to import the big & fat JQuery UI library all in your project here. And also Slider here provide more features than JQuery UI's slider.

### How to use

	$("#el").unitslider(
		{
        	min             : 0,
        	max             : 100,
	        current         : 0,
    	    orientation     : "horizontal",
        	handle          : true,
	        snap            : 1,
    	    padding         : 5,
        	theme           : "default",
	        withProcessColor: true,
    	    withSliderbar   : true,
        	readOnly        : false,
	        rateLimit       : 400,
    	    slide           : function (p, v) {
    	    },
        	change          : function (p, v) {
        	},
	        init            : function (p, v) {
	        }	
    	};
	);

### Features

*	Horizontal & vertical orientation
*	Several default themes & you can create your own easily
*	Move the slider bar by custom snap
*	Be readOnly status
*	Trigger slide & change event which both return current percent & value when sliding
*	Min & max value
*	Set initial value
*	Two slider bars support
*	Touch support

### To do list

*	Zepto support
*	AMD support

### License

[MIT](http://opensource.org/licenses/MIT)
