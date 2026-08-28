var percent = 65;
var oldValue=0;
var ratio=percent/100;
var glowRadius = 25;

var pie=d3.layout.pie()
  .value(function(d){return d})
  .sort(null);

var w=300,h=300;
var outerRadius=(w/2)-50;
var innerRadius=outerRadius - 30;

var arc=d3.svg.arc()
  .innerRadius(innerRadius)
  .outerRadius(outerRadius)
  .startAngle(0)
  .endAngle(2*Math.PI);

var arcLine=d3.svg.arc()
  .innerRadius(innerRadius)
  .outerRadius(outerRadius)
  .cornerRadius(glowRadius)
  .startAngle(-0.05);

var arcGuide=d3.svg.arc()
  .innerRadius(innerRadius + 14)
  .outerRadius(innerRadius + 15)
  .cornerRadius(10)
  .startAngle(-0.05);

var svg=d3.select('#chart')
  .append("svg")
  .attr({
      width:w,
      height:h
  }).append('g')
  .attr({
      transform:'translate('+w/2+','+h/2+')'
  });

svg.append('defs')
  .html(`
      <filter id="shadow">
          <feDropShadow dx="2" dy="2" stdDeviation="10"/>
      </filter>
      <radialGradient id="grayGradient" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#051219"></stop>
          <stop offset="100%" stop-color="#051219"></stop>
      </radialGradient>
      <linearGradient id="gradient" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#CA011F"></stop>
          <stop offset="100%" stop-color="#f14254"></stop>
      </linearGradient>
    <filter id="dropGlow" height="3100%" width="3100%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur"/>
      <feColorMatrix
      type = "matrix"
      values="0.95     0     0     0     0
              0     0.26     0     0     0
              0     0     0.33     0     0
              0     0     0     1     0 "/>
      <feOffset in="bluralpha" dx="0.000000" dy="0.000000" result="offsetBlur"/>
      <feMerge>
          <feMergeNode in="offsetBlur"/>
          <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  <filter id="softGlow" height="100" width="100" x="-1000%" y="-1000%">
		<feGaussianBlur in="SourceGraphic" stdDeviation="20"></feGaussianBlur>
	</filter>
  `);

var pathBackground=svg.append('path')
  .attr({
      d:arc
  })
  .style({
      fill:'url(#grayGradient)',
      filter: 'url(#shadow)'
  });

var pathForeground=svg.append('path')
  .datum({endAngle:0})
  .attr({
      d: arcLine,
      id: 'arcguide'
  })
  .style({
    // fill: '#f14254',
    fill:'url(#gradient)',
    filter: 'url(#dropGlow)',
  });

var pathLine=svg.append('path')
  .datum({endAngle:0})
  .attr({
      d:arcGuide,
      id: 'lineguide'
  })
  .style({
    // fill:'#f36272',
    fill:'transparent',
  });

var marker = svg.append('circle');
marker.attr('r', glowRadius)
    .attr({
      'id': 'glowMarker',
      'fill':'#eb384b',
      'filter':'url(#softGlow)'
      });

var textCounter=svg.append('text')
  .datum(0)
  .text(function(d){
      return d+'%';
  })
  .attr({
      class:'counterText',
      'text-anchor':'middle',
      'alignment-baseline': 'middle'
  })
  .style({
      fill:'#fff',
      'font-size':'50px'
  });

var arcTween=function(transition, newValue, oldValue) {
  transition.attrTween("d", function (d) {
    var interpolate = d3.interpolate(d.endAngle, ((2*Math.PI))*(newValue/100));
    var interpolateCount = d3.interpolate(oldValue, newValue);
    
    return function (t) {
      d.endAngle = interpolate(t);
      textCounter.text(Math.floor(interpolateCount(t))+'%');
      return arcLine(d);
    };
  });
};

var arcTweenGuide=function(transition, newValue, oldValue) {
  transition.attrTween("d", function (d) {
    var interpolate = d3.interpolate(d.endAngle, ((2*Math.PI))*(newValue/100));
    return function (t) {
      d.endAngle = interpolate(t);
      
      var path = svg.select('path#lineguide');
      var length = path.node().getTotalLength();
      var pathPoint = path.node().getPointAtLength((length/2) + (glowRadius/2));
      var marker = d3.select('#glowMarker');
      marker.attr('transform', `translate(${pathPoint.x}, ${(pathPoint.y)})`);
      
      return arcGuide(d);
    };
  });
};


var animate=function() {
  pathForeground.transition()
    .duration(1200)
    .ease('quad')
    .call(arcTween,percent,oldValue);
  
  pathLine.transition()
    .duration(1200)
    .ease('quad')
    .call(arcTweenGuide,percent,oldValue);
  
  oldValue=percent;
  percent=(Math.random() * 60) + 20;
  setTimeout(animate,3000);
};

setTimeout(animate,0);