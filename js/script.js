$(document).ready(function(){
    $('[data-toggle="tooltip"]').tooltip();   
});
Highcharts.chart('graph', {
    
    title: {
        text: ''
    },

    subtitle: {
        text: ''
    },

    yAxis: {
        title: {
            text: 'Number of Employees'
        }
    },
  

    plotOptions: {
        series: {
            pointStart: 2010
        }
    },
    credits:{
        enabled:false
    },

    series: [{
        name: 'Installation',
        data: [43934, 52503, 57177, 69658, 97031, 119931, 137133, 154175]
    }, {
        name: 'Manufacturing',
        data: [24916, 24064, 29742, 29851, 32490, 30282, 38121, 40434]
    }]

});