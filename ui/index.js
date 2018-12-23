const {ipcRenderer} = require('electron');
const Highcharts = require('highcharts');

// custom highchart initialization
require('highcharts/modules/exporting')(Highcharts);
require('highcharts/highcharts-more')(Highcharts);
require('highcharts/modules/solid-gauge')(Highcharts);

// manage odb data listener pattern
ipcRenderer.on('obd-data', (event, arg) => {
  console.log(arg);
});
ipcRenderer.send('listen-obd');


var gaugeOptions = {  
  chart: {
    type: 'solidgauge',
  },
  navigation: {
    buttonOptions: {
      enabled: false
    }
  },
  
  title: null,
  
  pane: {
    center: ['50%', '85%'],
    size: '140%',
    startAngle: -90,
    endAngle: 90,
    background: {
      backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || '#EEE',
      innerRadius: '60%',
      outerRadius: '100%',
      shape: 'arc'
    }
  },
  
  tooltip: {
    enabled: false
  },

  credits: {
    enabled: false
  },
  
  // the value axis
  yAxis: {
    stops: [
      [0.1, '#55BF3B'], // green
      [0.5, '#DDDF0D'], // yellow
      [0.9, '#DF5353'] // red
    ],
    lineWidth: 0,
    minorTickInterval: null,
    tickAmount: 10,
    tickLength: 30,
    tickPosition: "inside",
    tickmarkPlacement: "on",
    tickWidth:2,
    zIndex: 100,
    title: {
      y: -116
    },
    labels: {
      enabled: false
    }
  },
  
  plotOptions: {
    solidgauge: {
      dataLabels: {
        y: 5,
        borderWidth: 0,
        useHTML: true,
        zIndex: 1000
      }
    }
  }
};

// The AFR gauge
let afrData = [[(new Date()).getTime(), 11.9]];
const MAX_POINTS = 50;
var chartSpeed = Highcharts.chart('container-speed', Highcharts.merge(gaugeOptions, {
  yAxis: {
    min: 5,
    max: 30,
    zIndex: 99,
    title: {
      text: 'AFR'
    }
  },

  navigation: {
    buttonOptions: {
      enabled: false
    }
  },
  
  credits: {
    enabled: false
  },
  
  series: [{
    name: 'AFR',
    data: afrData.map(item => item[1]),
    dataLabels: {
      format: '<div style="text-align:center"><span style="font-size:25px;color:' +
      ((Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black') + '">{y}</span><br/></div>'
    },
    tooltip: {
      valueSuffix: ''
    }
  }]
  
}));

const chartSpeedLine = Highcharts.chart('container-speed-line', {
  chart: {
    zoomType: 'x',
    type: 'area',
    panning: true,
    panKey: 'shift',
    animation: false
  },
  navigation: {
    buttonOptions: {
      enabled: false
    }
  },
  credits: {
    enabled: false
  },
  title: {
    text: undefined
  },
  xAxis: {
    type: 'datetime'
  },
  yAxis: {
    title: {
      text: 'AFR'
    }
  },
  legend: {
    enabled: false
  },
  
  series: [{
    lineColor: Highcharts.getOptions().colors[1],
    color: Highcharts.getOptions().colors[2],
    fillOpacity: 0.5,
    name: 'AFR',
    data: afrData,
    marker: {
      enabled: false
    }
  }]
});


// Bring life to the dials
setInterval(function () {
  // Speed
  var point,
  linePoints,
  newVal,
  inc;
  
  if (chartSpeed) {
    point = chartSpeed.series[0].points[0];
    linePoints = chartSpeedLine.series[0];
    inc = Math.round((Math.random() * 25) + 5);
    newVal = point.y + inc;
    
    if (newVal > 30) {
      newVal = (point.y - inc) < 5 ? 5 : point.y - inc;
    }

    const newPoint = [(new Date()).getTime(), newVal];
    linePoints.addPoint(newPoint);
    // delete first point over MAX_POINTS
    if(afrData.length > MAX_POINTS) linePoints.data[0].remove();
    point.update(Math.round(newVal * 100) / 100, true, true, false);
  }
}, 500);